/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unit tests for Lumière Beauty Center ERP pure business logic
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTechnicianCommission,
  checkDoubleBooking,
  calculateBillOfMaterialsConsumption,
  processPosSaleCalculation,
  calculateCashRegisterVariance,
  calculatePayrollNetSalary,
  timeStringToMinutes,
  minutesToTimeString
} from './rules';
import { Appointment, Product, ServiceRecipeItem } from '../../types/erp';

test('timeStringToMinutes and minutesToTimeString conversion', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('10:30'), 630);
  assert.equal(timeStringToMinutes('18:45'), 1125);
  assert.equal(minutesToTimeString(630), '10:30');
  assert.equal(minutesToTimeString(1125), '18:45');
});

test('calculateTechnicianCommission - percentage calculation', () => {
  // 1,000 EGP service with 40% commission = 400 EGP
  const commission = calculateTechnicianCommission({
    servicePrice: 1000,
    commissionType: 'percentage',
    commissionPercentage: 40
  });
  assert.equal(commission, 400);

  // With 100 EGP discount: Net = 900, 40% = 360 EGP
  const discountedCommission = calculateTechnicianCommission({
    servicePrice: 1000,
    discount: 100,
    commissionType: 'percentage',
    commissionPercentage: 40
  });
  assert.equal(discountedCommission, 360);

  // If appointment is cancelled or no-show, commission must be 0
  const cancelledCommission = calculateTechnicianCommission({
    servicePrice: 1000,
    commissionType: 'percentage',
    commissionPercentage: 40,
    isCancelledOrNoShow: true
  });
  assert.equal(cancelledCommission, 0);
});

test('calculateTechnicianCommission - fixed and hybrid models', () => {
  // Fixed commission
  const fixed = calculateTechnicianCommission({
    servicePrice: 800,
    commissionType: 'fixed',
    commissionFixedAmount: 150
  });
  assert.equal(fixed, 150);

  // Hybrid: Fixed 100 EGP + 20% of 1,000 EGP = 100 + 200 = 300 EGP
  const hybrid = calculateTechnicianCommission({
    servicePrice: 1000,
    commissionType: 'hybrid',
    commissionFixedAmount: 100,
    commissionPercentage: 20
  });
  assert.equal(hybrid, 300);
});

test('checkDoubleBooking - detects technician overlaps on same date and branch', () => {
  const existingAppts: Appointment[] = [
    {
      id: 'appt-1',
      code: 'APT-101',
      customer_id: 'cust-1',
      customer_name: 'Nour El-Sherif',
      customer_phone: '01012345678',
      branch_id: 'branch-alex',
      service_id: 'serv-makeup',
      service_name_en: 'Bridal Makeup',
      service_name_ar: 'مكياج عروس',
      technician_id: 'tech-sarah',
      technician_name: 'Sarah Gamal',
      date: '2026-11-01',
      start_time: '14:00',
      end_time: '15:30',
      duration_minutes: 90,
      price: 1500,
      discount: 0,
      net_price: 1500,
      status: 'confirmed',
      payment_status: 'paid',
      created_at: '2026-10-30T10:00:00Z'
    }
  ];

  // Overlapping appointment: 14:30 to 15:30 -> conflict!
  const conflictResult = checkDoubleBooking({
    existingAppointments: existingAppts,
    technicianId: 'tech-sarah',
    branchId: 'branch-alex',
    date: '2026-11-01',
    startTime: '14:30',
    durationMinutes: 60
  });
  assert.equal(conflictResult.hasConflict, true);
  assert.equal(conflictResult.conflictingAppointment?.id, 'appt-1');

  // Non-overlapping appointment: 15:30 to 16:30 -> no conflict!
  const noConflictResult = checkDoubleBooking({
    existingAppointments: existingAppts,
    technicianId: 'tech-sarah',
    branchId: 'branch-alex',
    date: '2026-11-01',
    startTime: '15:30',
    durationMinutes: 60
  });
  assert.equal(noConflictResult.hasConflict, false);

  // Different date: 2026-11-02 -> no conflict!
  const diffDateResult = checkDoubleBooking({
    existingAppointments: existingAppts,
    technicianId: 'tech-sarah',
    branchId: 'branch-alex',
    date: '2026-11-02',
    startTime: '14:00',
    durationMinutes: 60
  });
  assert.equal(diffDateResult.hasConflict, false);
});

test('calculateBillOfMaterialsConsumption - computes accurate stock deductions', () => {
  const inventory: Product[] = [
    {
      id: 'prod-cleanser',
      sku: 'SKU-CLN-01',
      barcode: '62210001',
      name_en: 'Facial Cleanser Foam',
      name_ar: 'غسول رغوي للبشرة',
      category: 'Skin',
      brand: 'Dermaceutic',
      unit: 'ml',
      purchase_cost: 120,
      selling_price: 250,
      current_stock: 500,
      min_stock: 100,
      max_stock: 1000,
      branch_id: 'branch-alex'
    },
    {
      id: 'prod-cotton',
      sku: 'SKU-COT-01',
      barcode: '62210002',
      name_en: 'Cotton Pads',
      name_ar: 'قطن تنظيف',
      category: 'Supplies',
      brand: 'SoftCare',
      unit: 'pieces',
      purchase_cost: 0.5,
      selling_price: 2,
      current_stock: 50,
      min_stock: 20,
      max_stock: 200,
      branch_id: 'branch-alex'
    }
  ];

  const recipe: ServiceRecipeItem[] = [
    { product_id: 'prod-cleanser', quantity: 20, unit: 'ml' },
    { product_id: 'prod-cotton', quantity: 4, unit: 'pieces' }
  ];

  const result = calculateBillOfMaterialsConsumption({
    recipeItems: recipe,
    inventory
  });

  assert.equal(result.canDeduct, true);
  assert.equal(result.deductions.length, 2);
  assert.equal(result.deductions[0].newStock, 480);
  assert.equal(result.deductions[1].newStock, 46);
});

test('processPosSaleCalculation - validates split payment, discounts and points', () => {
  const items = [
    {
      id: 'item-1',
      type: 'service' as const,
      item_id: 'serv-1',
      name_en: 'Deep Facial',
      name_ar: 'تنظيف بشرة عميق',
      quantity: 1,
      unit_price: 800,
      discount: 0,
      total: 800
    }
  ];

  // Split payment: 500 cash, 300 visa
  const posResult = processPosSaleCalculation({
    items,
    discountAmount: 0,
    payments: [
      { method: 'cash', amount: 500 },
      { method: 'visa', amount: 300 }
    ]
  });

  assert.equal(posResult.subtotal, 800);
  assert.equal(posResult.total, 800);
  assert.equal(posResult.paidAmount, 800);
  assert.equal(posResult.isFullyPaid, true);
  assert.equal(posResult.remainingBalance, 0);
  assert.equal(posResult.pointsEarned, 8); // 800 / 100 = 8 points
});

test('calculateCashRegisterVariance - verifies shift balance and approval flag', () => {
  // Expected = 1000 opening + 4000 cash sales - 500 expense - 1000 withdrawal = 3500
  const shiftResult = calculateCashRegisterVariance({
    openingBalance: 1000,
    cashSales: 4000,
    cashExpenses: 500,
    cashWithdrawals: 1000,
    cashDeposits: 0,
    actualCountedCash: 3400 // short by 100
  });

  assert.equal(shiftResult.expectedCash, 3500);
  assert.equal(shiftResult.actualCash, 3400);
  assert.equal(shiftResult.variance, -100);
  assert.equal(shiftResult.hasVariance, true);
  assert.equal(shiftResult.requiresManagerApproval, true);
});

test('calculatePayrollNetSalary - calculates salary breakdown correctly', () => {
  const payroll = calculatePayrollNetSalary({
    baseSalary: 6000,
    allowances: 1000,
    overtimeMinutes: 120, // 2 hours
    commissionEarned: 2500,
    bonuses: 500,
    deductions: 200,
    advances: 1000,
    unpaidAbsenceDays: 1 // 6000 / 30 = 200
  });

  // Base 6000, allowances 1000, commission 2500, bonus 500
  // Overtime rate: 6000 / 30 / 8 = 25/hr * 1.5 * 2h = 75
  // Gross = 6000 + 1000 + 2500 + 500 + 75 = 10075
  // Deductions: 200 + advances 1000 + unpaid 200 = 1400
  // Net = 10075 - 1400 = 8675
  assert.equal(payroll.grossSalary, 10075);
  assert.equal(payroll.totalDeductions, 1400);
  assert.equal(payroll.netSalary, 8675);
});
