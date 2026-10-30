/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Comprehensive TypeScript types for Lumière Beauty Center ERP
 * Multi-branch, Arabic/English, EGP currency, Alexandria/Cairo
 */

export type Language = 'ar' | 'en';

export type UserRole = 
  | 'super_admin'
  | 'business_owner'
  | 'partner'
  | 'general_manager'
  | 'branch_manager'
  | 'hr_manager'
  | 'accountant'
  | 'receptionist'
  | 'technician'
  | 'inventory_manager'
  | 'marketing_manager';

export type Permission = 
  | 'dashboard.view'
  | 'appointments.view'
  | 'appointments.create'
  | 'appointments.edit'
  | 'appointments.cancel'
  | 'appointments.complete'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'pos.create'
  | 'pos.refund'
  | 'pos.discount'
  | 'cash_register.manage'
  | 'services.view'
  | 'services.manage'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'inventory.purchase'
  | 'hr.view'
  | 'hr.manage'
  | 'attendance.manage'
  | 'payroll.view'
  | 'payroll.calculate'
  | 'payroll.approve'
  | 'commissions.view'
  | 'commissions.override'
  | 'expenses.view'
  | 'expenses.create'
  | 'expenses.approve'
  | 'finance.view'
  | 'finance.manage'
  | 'partners.view'
  | 'partners.manage'
  | 'marketing.manage'
  | 'loyalty.manage'
  | 'reports.view'
  | 'reports.export'
  | 'audit.view'
  | 'settings.manage';

export interface Branch {
  id: string;
  name_en: string;
  name_ar: string;
  city: string;
  address_en: string;
  address_ar: string;
  phone: string;
  whatsapp: string;
  is_active: boolean;
  is_main: boolean;
  rooms_count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branch_id: string; // 'all' or specific branch
  avatar?: string;
  is_active: boolean;
  permissions: Permission[];
}

export type CustomerSource = 
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'google'
  | 'whatsapp'
  | 'referral'
  | 'walk_in'
  | 'existing'
  | 'other';

export interface Customer {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'female' | 'male';
  address?: string;
  preferred_language: Language;
  preferred_technician_id?: string;
  source: CustomerSource;
  notes?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'vip' | 'blacklisted';
  loyalty_points: number;
  total_spent: number;
  visits_count: number;
  last_visit?: string;
  created_at: string;
  branch_id: string;
}

export interface CustomerTimelineEvent {
  id: string;
  customer_id: string;
  type: 'appointment' | 'sale' | 'payment' | 'note' | 'points' | 'complaint' | 'review';
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  amount?: number;
  created_at: string;
  created_by_name: string;
}

export type ServiceCategory = 
  | 'makeup'
  | 'soft_makeup'
  | 'brows'
  | 'eyebrows_styling'
  | 'lashes'
  | 'basic_facial'
  | 'deep_facial'
  | 'skin_prep'
  | 'hair_styling'
  | 'packages'
  | 'other';

export type CommissionType = 'percentage' | 'fixed' | 'tiered' | 'hybrid';

export interface ServiceRecipeItem {
  product_id: string;
  quantity: number;
  unit: string; // 'ml', 'g', 'pieces', 'pairs', etc.
}

export interface Service {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  category: ServiceCategory;
  description_en: string;
  description_ar: string;
  duration_minutes: number;
  price: number; // in EGP
  cost: number; // estimated consumable cost
  tax_rate: number; // 0.14 for 14% VAT in Egypt or 0
  commission_type: CommissionType;
  commission_percentage?: number; // e.g. 40 for 40%
  commission_fixed_amount?: number; // e.g. 150 EGP
  required_skill?: string;
  is_active: boolean;
  recipe_items: ServiceRecipeItem[]; // Bill of materials
}

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface Appointment {
  id: string;
  code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  branch_id: string;
  service_id: string;
  service_name_en: string;
  service_name_ar: string;
  technician_id?: string;
  technician_name?: string;
  room_name?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  duration_minutes: number;
  price: number;
  discount: number;
  net_price: number;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  completed_at?: string;
  calculated_commission?: number;
  inventory_deducted?: boolean;
}

export type PaymentMethod = 
  | 'cash'
  | 'visa'
  | 'mastercard'
  | 'instapay'
  | 'vodafone_cash'
  | 'bank_transfer'
  | 'loyalty_points'
  | 'gift_card';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SaleItem {
  id: string;
  type: 'service' | 'product' | 'package' | 'gift_card';
  item_id: string;
  name_en: string;
  name_ar: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  technician_id?: string;
  technician_name?: string;
  commission_amount?: number;
}

export interface SaleInvoice {
  id: string;
  invoice_number: string;
  appointment_id?: string;
  customer_id: string;
  customer_name: string;
  branch_id: string;
  cashier_id: string;
  cashier_name: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  change_amount: number;
  status: 'paid' | 'partially_paid' | 'refunded';
  payments: PaymentSplit[];
  points_earned: number;
  points_redeemed?: number;
  points_discount_amount?: number;
  created_at: string;
}

export interface CashRegisterSession {
  id: string;
  branch_id: string;
  register_name: string;
  opened_by_user_id: string;
  opened_by_user_name: string;
  opened_at: string;
  closed_at?: string;
  status: 'open' | 'closed';
  opening_balance: number;
  cash_sales: number;
  cash_expenses: number;
  cash_withdrawals: number;
  cash_deposits: number;
  expected_cash: number;
  actual_cash?: number;
  variance?: number;
  notes?: string;
  approved_by?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name_en: string;
  name_ar: string;
  category: string;
  brand: string;
  unit: string;
  purchase_cost: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  branch_id: string;
  expiry_date?: string;
  batch_number?: string;
  supplier_id?: string;
}

export type InventoryMovementType = 
  | 'purchase_received'
  | 'pos_sale'
  | 'service_consumption'
  | 'manual_adjustment'
  | 'branch_transfer'
  | 'supplier_return'
  | 'damage_waste'
  | 'expiry_writeoff';

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name_en: string;
  product_name_ar: string;
  branch_id: string;
  type: InventoryMovementType;
  quantity_change: number; // positive or negative
  previous_stock: number;
  new_stock: number;
  reference_type?: 'appointment' | 'sale' | 'po' | 'manual';
  reference_id?: string;
  notes?: string;
  created_at: string;
  created_by_name: string;
}

export interface Supplier {
  id: string;
  name: string;
  company_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  tax_number?: string;
  balance_due: number; // in EGP
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  branch_id: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_cost: number;
    total: number;
  }[];
  created_at: string;
  received_at?: string;
}

export type ExpenseCategory = 
  | 'rent'
  | 'electricity'
  | 'water'
  | 'internet'
  | 'salaries'
  | 'commissions'
  | 'marketing'
  | 'cleaning'
  | 'maintenance'
  | 'beauty_supplies'
  | 'transportation'
  | 'equipment'
  | 'taxes_licensing'
  | 'hospitality'
  | 'other';

export interface Expense {
  id: string;
  branch_id: string;
  category: ExpenseCategory;
  amount: number;
  payment_method: PaymentMethod;
  description_en: string;
  description_ar: string;
  supplier_id?: string;
  supplier_name?: string;
  date: string;
  created_by_name: string;
  approved_by_name?: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  requires_approval: boolean;
}

export type EmploymentType = 'full_time' | 'part_time' | 'technician' | 'freelancer' | 'contractor' | 'intern';

export interface Employee {
  id: string;
  code: string;
  full_name: string;
  photo?: string;
  phone: string;
  email: string;
  address?: string;
  national_id?: string;
  job_title_en: string;
  job_title_ar: string;
  department: string;
  branch_id: string;
  employment_type: EmploymentType;
  hire_date: string;
  base_salary: number;
  commission_model: 'commission_only' | 'fixed_salary' | 'hybrid';
  commission_default_rate: number; // percentage e.g. 40
  status: 'active' | 'on_leave' | 'terminated';
  skills: string[];
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  branch_id: string;
  date: string; // YYYY-MM-DD
  check_in?: string; // HH:mm
  check_out?: string; // HH:mm
  status: 'present' | 'absent' | 'late' | 'on_leave';
  late_minutes: number;
  overtime_minutes: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'annual' | 'sick' | 'emergency' | 'unpaid';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
}

export interface PayrollRecord {
  id: string;
  month: string; // YYYY-MM
  employee_id: string;
  employee_name: string;
  job_title: string;
  branch_id: string;
  base_salary: number;
  allowances: number;
  overtime_pay: number;
  commission_earned: number;
  bonuses: number;
  deductions: number;
  advances: number;
  unpaid_absence_deduction: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  paid_date?: string;
  payment_method?: PaymentMethod;
}

export interface Partner {
  id: string;
  name_en: string;
  name_ar: string;
  ownership_percentage: number; // e.g. 50
  initial_capital: number;
  additional_contributions: number;
  total_drawings: number;
  current_balance: number;
  phone: string;
  email: string;
}

export interface PartnerTransaction {
  id: string;
  partner_id: string;
  partner_name: string;
  type: 'contribution' | 'drawing' | 'profit_distribution';
  amount: number;
  date: string;
  notes: string;
  payment_method: PaymentMethod;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: 'instagram' | 'facebook' | 'tiktok' | 'google' | 'influencer' | 'whatsapp';
  start_date: string;
  end_date: string;
  budget: number;
  actual_spend: number;
  leads_count: number;
  bookings_count: number;
  revenue_generated: number;
  roi_percentage: number;
  status: 'active' | 'completed' | 'paused';
}

export interface BeautyPackage {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  included_services: {
    service_id: string;
    service_name: string;
    total_quantity: number;
  }[];
  validity_days: number;
}

export interface CustomerPackageRedemption {
  id: string;
  package_id: string;
  package_name: string;
  customer_id: string;
  purchase_date: string;
  expiry_date: string;
  status: 'active' | 'completed' | 'expired';
  services_balance: {
    service_id: string;
    service_name: string;
    total: number;
    used: number;
    remaining: number;
  }[];
}

export interface GiftCard {
  id: string;
  code: string;
  initial_value: number;
  current_balance: number;
  purchased_by_customer_id?: string;
  recipient_name: string;
  expiry_date: string;
  status: 'active' | 'depleted' | 'expired';
}

export interface CustomerReview {
  id: string;
  appointment_id: string;
  customer_id: string;
  customer_name: string;
  technician_id: string;
  technician_name: string;
  service_name: string;
  rating: number; // 1 to 5
  feedback: string;
  created_at: string;
  is_complaint: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  details_en: string;
  details_ar: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  ip_address: string;
}

export interface SystemNotification {
  id: string;
  title_en: string;
  title_ar: string;
  message_en: string;
  message_ar: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  module: string;
  created_at: string;
  read: boolean;
  link_module?: string;
}
