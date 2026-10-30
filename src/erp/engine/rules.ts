/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lumière Beauty Center ERP - Pure Business Logic Engine
 * Decoupled, testable functions for commissions, booking conflicts,
 * POS calculations, cash shifts, inventory recipes, and payroll.
 */

import { 
  Appointment, 
  CommissionType, 
  PaymentSplit, 
  SaleItem, 
  ServiceRecipeItem, 
  Product 
} from '../../types/erp';

/**
 * Calculates technician commission based on business compensation rules.
 * Business Rules:
 * - Cancelled or No-show appointments generate 0 commission.
 * - Percentage: applies to net service price (after discount if applicable).
 * - Fixed: provides a fixed reward amount.
 * - Tiered / Hybrid: allows technician rate override or base + percentage.
 */
export function calculateTechnicianCommission(params: {
  servicePrice: number;
  discount?: number;
  commissionType: CommissionType;
  commissionPercentage?: number;
  commissionFixedAmount?: number;
  technicianRateOverride?: number;
  isCancelledOrNoShow?: boolean;
}): number {
  if (params.isCancelledOrNoShow) {
    return 0;
  }

  const effectiveDiscount = Math.max(0, params.discount || 0);
  const netServicePrice = Math.max(0, params.servicePrice - effectiveDiscount);

  // If technician has a custom rate override, prioritize it
  const percentage = params.technicianRateOverride !== undefined 
    ? params.technicianRateOverride 
    : (params.commissionPercentage ?? 0);

  switch (params.commissionType) {
    case 'percentage':
      return Math.round((netServicePrice * (percentage / 100)) * 100) / 100;

    case 'fixed':
      return Math.max(0, params.commissionFixedAmount ?? 0);

    case 'hybrid': {
      const fixed = params.commissionFixedAmount ?? 0;
      const pctPart = (netServicePrice * (percentage / 100));
      return Math.round((fixed + pctPart) * 100) / 100;
    }

    case 'tiered': {
      // Tiered example: higher percentage if service is premium > 1000 EGP
      const tieredPct = netServicePrice >= 1000 ? Math.min(60, percentage + 5) : percentage;
      return Math.round((netServicePrice * (tieredPct / 100)) * 100) / 100;
    }

    default:
      return 0;
  }
}

/**
 * Helper to convert "HH:mm" time string into minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
}

/**
 * Helper to convert minutes from midnight into "HH:mm"
 */
export function minutesToTimeString(minutesTotal: number): string {
  const h = Math.floor(minutesTotal / 60);
  const m = minutesTotal % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Double Booking Prevention Engine:
 * Prevents scheduling the same technician (or room) for overlapping active appointments.
 */
export function checkDoubleBooking(params: {
  existingAppointments: Appointment[];
  technicianId?: string;
  branchId: string;
  date: string;
  startTime: string; // HH:mm
  durationMinutes: number;
  excludeAppointmentId?: string;
}): { hasConflict: boolean; conflictingAppointment?: Appointment } {
  const newStartMin = timeStringToMinutes(params.startTime);
  const newEndMin = newStartMin + params.durationMinutes;

  for (const appt of params.existingAppointments) {
    if (params.excludeAppointmentId && appt.id === params.excludeAppointmentId) {
      continue;
    }

    // Ignore cancelled or no-show appointments
    if (appt.status === 'cancelled' || appt.status === 'no_show') {
      continue;
    }

    // Must be same date, same branch, and same technician (if technician assigned)
    if (params.technicianId && params.technicianId !== 'none' && params.technicianId !== 'direct_owner') {
      if (appt.date === params.date && appt.branch_id === params.branchId && appt.technician_id === params.technicianId) {
        const existingStartMin = timeStringToMinutes(appt.start_time);
        const existingEndMin = timeStringToMinutes(appt.end_time);

        // Overlap check: start < existingEnd AND end > existingStart
        if (newStartMin < existingEndMin && newEndMin > existingStartMin) {
          return { hasConflict: true, conflictingAppointment: appt };
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Bill of Materials / Recipe Consumption:
 * Calculates required stock deductions for a completed service.
 */
export function calculateBillOfMaterialsConsumption(params: {
  recipeItems: ServiceRecipeItem[];
  inventory: Product[];
}): { 
  canDeduct: boolean; 
  deductions: { productId: string; quantity: number; currentStock: number; newStock: number; productName: string }[];
  missingStock?: string[];
} {
  const deductions: { productId: string; quantity: number; currentStock: number; newStock: number; productName: string }[] = [];
  const missingStock: string[] = [];

  for (const item of params.recipeItems) {
    const product = params.inventory.find(p => p.id === item.product_id);
    if (!product) {
      missingStock.push(`Unknown product ID: ${item.product_id}`);
      continue;
    }

    const newStock = product.current_stock - item.quantity;
    if (newStock < 0) {
      missingStock.push(`${product.name_en} (Need ${item.quantity} ${item.unit}, only ${product.current_stock} available)`);
    }

    deductions.push({
      productId: product.id,
      quantity: item.quantity,
      currentStock: product.current_stock,
      newStock,
      productName: product.name_en
    });
  }

  return {
    canDeduct: missingStock.length === 0,
    deductions,
    missingStock: missingStock.length > 0 ? missingStock : undefined
  };
}

/**
 * POS Sale Checkout Engine:
 * Validates totals, discounts, loyalty points conversion, and split payments.
 * Rule: 100 EGP = 1 point earned. 1 point = 2 EGP discount redeemed.
 */
export function processPosSaleCalculation(params: {
  items: SaleItem[];
  discountAmount?: number;
  pointsToRedeem?: number;
  payments: PaymentSplit[];
  taxRate?: number; // e.g. 0.14 for 14% or 0
}): {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingBalance: number;
  changeAmount: number;
  isFullyPaid: boolean;
  pointsEarned: number;
} {
  const subtotal = params.items.reduce((sum, item) => sum + (item.quantity * item.unit_price) - (item.discount || 0), 0);
  const generalDiscount = Math.max(0, params.discountAmount || 0);

  // 1 loyalty point = 2 EGP discount
  const pointsToRedeem = Math.max(0, params.pointsToRedeem || 0);
  const pointsDiscount = pointsToRedeem * 2;

  const totalDiscount = generalDiscount + pointsDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxRate = params.taxRate ?? 0;
  const tax = Math.round((taxableAmount * taxRate) * 100) / 100;
  const total = Math.max(0, Math.round((taxableAmount + tax) * 100) / 100);

  const paidAmount = params.payments.reduce((sum, p) => sum + Math.max(0, p.amount), 0);
  const difference = paidAmount - total;
  const changeAmount = difference > 0 ? Math.round(difference * 100) / 100 : 0;
  const remainingBalance = difference < 0 ? Math.round(Math.abs(difference) * 100) / 100 : 0;
  const isFullyPaid = remainingBalance <= 0.01;

  // Earn 1 point per 100 EGP spent
  const pointsEarned = Math.floor(total / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: generalDiscount,
    pointsDiscount,
    tax,
    total,
    paidAmount: Math.round(paidAmount * 100) / 100,
    remainingBalance,
    changeAmount,
    isFullyPaid,
    pointsEarned
  };
}

/**
 * Cash Register Shift Balancing:
 * Expected cash = Opening balance + Cash sales - Cash expenses - Cash withdrawals + Cash deposits
 */
export function calculateCashRegisterVariance(params: {
  openingBalance: number;
  cashSales: number;
  cashExpenses: number;
  cashWithdrawals: number;
  cashDeposits: number;
  actualCountedCash: number;
}): {
  expectedCash: number;
  actualCash: number;
  variance: number;
  hasVariance: boolean;
  requiresManagerApproval: boolean; // if variance > 50 EGP
} {
  const expectedCash = 
    params.openingBalance + 
    params.cashSales - 
    params.cashExpenses - 
    params.cashWithdrawals + 
    params.cashDeposits;

  const variance = Math.round((params.actualCountedCash - expectedCash) * 100) / 100;
  const hasVariance = Math.abs(variance) > 0.01;
  const requiresManagerApproval = Math.abs(variance) >= 50;

  return {
    expectedCash: Math.round(expectedCash * 100) / 100,
    actualCash: Math.round(params.actualCountedCash * 100) / 100,
    variance,
    hasVariance,
    requiresManagerApproval
  };
}

/**
 * Payroll Calculation Engine:
 * Net = Base + Allowances + Overtime + Commissions + Bonuses - Deductions - Unpaid Days - Advances
 */
export function calculatePayrollNetSalary(params: {
  baseSalary: number;
  allowances?: number;
  overtimeMinutes?: number;
  commissionEarned?: number;
  bonuses?: number;
  deductions?: number;
  advances?: number;
  unpaidAbsenceDays?: number;
}): {
  baseSalary: number;
  allowances: number;
  overtimePay: number;
  commissionEarned: number;
  bonuses: number;
  deductions: number;
  advances: number;
  unpaidAbsenceDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
} {
  const baseSalary = Math.max(0, params.baseSalary);
  const allowances = Math.max(0, params.allowances || 0);
  const bonuses = Math.max(0, params.bonuses || 0);
  const commissionEarned = Math.max(0, params.commissionEarned || 0);

  // Overtime rate: (baseSalary / 30 days / 8 hours) * 1.5 * overtimeHours
  const hourlyRate = baseSalary > 0 ? (baseSalary / 30 / 8) : 0;
  const overtimeHours = (params.overtimeMinutes || 0) / 60;
  const overtimePay = Math.round((overtimeHours * hourlyRate * 1.5) * 100) / 100;

  // Daily rate for unpaid absence: baseSalary / 30
  const dailyRate = baseSalary > 0 ? (baseSalary / 30) : 0;
  const unpaidAbsenceDeduction = Math.round(((params.unpaidAbsenceDays || 0) * dailyRate) * 100) / 100;

  const deductions = Math.max(0, params.deductions || 0);
  const advances = Math.max(0, params.advances || 0);

  const grossSalary = baseSalary + allowances + overtimePay + commissionEarned + bonuses;
  const totalDeductions = deductions + advances + unpaidAbsenceDeduction;
  const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

  return {
    baseSalary,
    allowances,
    overtimePay,
    commissionEarned,
    bonuses,
    deductions,
    advances,
    unpaidAbsenceDeduction,
    grossSalary: Math.round(grossSalary * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netSalary
  };
}
