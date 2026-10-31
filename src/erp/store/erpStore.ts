/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lumière Beauty Center ERP - Single Source of Truth State Store
 * Multi-branch, immutable transaction ledgers, event-driven appointment completion,
 * BOM inventory deduction, POS checkout, cash shifts, and audit logging.
 */

import { useState, useEffect } from 'react';
import {
  Branch,
  User,
  UserRole,
  Language,
  Customer,
  Service,
  Appointment,
  Product,
  InventoryMovement,
  SaleInvoice,
  CashRegisterSession,
  Expense,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  Partner,
  PartnerTransaction,
  MarketingCampaign,
  BeautyPackage,
  GiftCard,
  CustomerReview,
  AuditLog,
  SystemNotification,
  PaymentSplit
} from '../../types/erp';
import {
  calculateTechnicianCommission,
  calculateBillOfMaterialsConsumption,
  processPosSaleCalculation,
  calculateCashRegisterVariance,
  checkDoubleBooking
} from '../engine/rules';

// Initial Branches
export const initialBranches: Branch[] = [
  {
    id: 'branch-sabapasha',
    name_en: 'Alexandria - Saba Pasha Main Branch',
    name_ar: 'فرع الإسكندرية - سابا باشا الرئيسي',
    city: 'Alexandria',
    address_en: 'Saba Pasha, Alexandria',
    address_ar: 'سابا باشا، طريق الجيش / مصطفى كامل، الإسكندرية',
    phone: '03-5840000',
    whatsapp: '01023456789',
    is_active: true,
    is_main: true,
    rooms_count: 6
  },
  {
    id: 'branch-gleem',
    name_en: 'Alexandria - Gleem Branch',
    name_ar: 'فرع الإسكندرية - جليم',
    city: 'Alexandria',
    address_en: '28 Abdel Salam Aref St., Gleem, Alexandria',
    address_ar: '٢٨ شارع عبد السلام عارف، جليم، الإسكندرية',
    phone: '03-5841234',
    whatsapp: '01098765432',
    is_active: true,
    is_main: false,
    rooms_count: 4
  }
];

// Initial Partners (2 co-founders with configurable ownership)
export const initialPartners: Partner[] = [
  {
    id: 'partner-karim',
    name_en: 'Eng. Karim Mansour',
    name_ar: 'م. كريم منصور',
    ownership_percentage: 50,
    initial_capital: 750000,
    additional_contributions: 50000,
    total_drawings: 120000,
    current_balance: 680000,
    phone: '01001122334',
    email: 'karim@lumiere-egypt.com'
  },
  {
    id: 'partner-yasmine',
    name_en: 'Dr. Yasmine El-Badawi',
    name_ar: 'د. ياسمين البدوي',
    ownership_percentage: 50,
    initial_capital: 750000,
    additional_contributions: 50000,
    total_drawings: 110000,
    current_balance: 690000,
    phone: '01005566778',
    email: 'yasmine@lumiere-egypt.com'
  }
];

// Initial Employees
export const initialEmployees: Employee[] = [
  {
    id: 'emp-sarah',
    code: 'EMP-01',
    full_name: 'Sarah Gamal',
    phone: '01223456781',
    email: 'sarah@lumiere.com',
    job_title_en: 'Senior Makeup Artist',
    job_title_ar: 'أخصائية مكياج أولى',
    department: 'Makeup',
    branch_id: 'branch-sabapasha',
    employment_type: 'technician',
    hire_date: '2025-01-15',
    base_salary: 4000,
    commission_model: 'hybrid',
    commission_default_rate: 35,
    status: 'active',
    skills: ['Bridal Makeup', 'Soft Makeup', 'Contouring']
  },
  {
    id: 'emp-mariam',
    code: 'EMP-02',
    full_name: 'Mariam Soliman',
    phone: '01112233445',
    email: 'mariam@lumiere.com',
    job_title_en: 'Skin & Facial Specialist',
    job_title_ar: 'أخصائية عناية بالبشرة وتنظيف عميق',
    department: 'Facial/Skin',
    branch_id: 'branch-sabapasha',
    employment_type: 'technician',
    hire_date: '2025-02-01',
    base_salary: 0,
    commission_model: 'commission_only',
    commission_default_rate: 40,
    status: 'active',
    skills: ['Deep Facial', 'Basic Facial', 'Skin Prep', 'Hydrafacial']
  },
  {
    id: 'emp-dina',
    code: 'EMP-03',
    full_name: 'Dina Fouad',
    phone: '01099887766',
    email: 'dina@lumiere.com',
    job_title_en: 'Brows & Skin Specialist',
    job_title_ar: 'أخصائية تشكيل حواجب وعناية بالبشرة',
    department: 'Brows/Lashes',
    branch_id: 'branch-sabapasha',
    employment_type: 'technician',
    hire_date: '2025-03-10',
    base_salary: 5000,
    commission_model: 'hybrid',
    commission_default_rate: 40,
    status: 'active',
    skills: ['Eyebrow Styling', 'Brow Lamination', 'Facial Care']
  },
  {
    id: 'emp-nourhan',
    code: 'EMP-04',
    full_name: 'Nourhan Tarek',
    phone: '01554433221',
    email: 'nourhan@lumiere.com',
    job_title_en: 'Lashes & Brows Technician',
    job_title_ar: 'أخصائية رموش وحواجب',
    department: 'Brows/Lashes',
    branch_id: 'branch-sabapasha',
    employment_type: 'technician',
    hire_date: '2025-04-01',
    base_salary: 0,
    commission_model: 'commission_only',
    commission_default_rate: 35,
    status: 'active',
    skills: ['Lashes Lifting', 'Brow Lamination', 'Tinting']
  },
  {
    id: 'emp-hoda',
    code: 'EMP-05',
    full_name: 'Hoda Radwan',
    phone: '01287654321',
    email: 'hoda@lumiere.com',
    job_title_en: 'Hair Stylist',
    job_title_ar: 'مصففة شعر وتصفيف سهرة',
    department: 'Hair',
    branch_id: 'branch-sabapasha',
    employment_type: 'technician',
    hire_date: '2025-02-15',
    base_salary: 4500,
    commission_model: 'hybrid',
    commission_default_rate: 30,
    status: 'active',
    skills: ['Hair Styling', 'Waves', 'Bridal Updo']
  },
  {
    id: 'emp-salma',
    code: 'EMP-06',
    full_name: 'Salma Ezzat',
    phone: '01011224488',
    email: 'salma@lumiere.com',
    job_title_en: 'Front Desk Receptionist',
    job_title_ar: 'مسؤولة الاستقبال والضيافة',
    department: 'Reception',
    branch_id: 'branch-sabapasha',
    employment_type: 'full_time',
    hire_date: '2025-01-01',
    base_salary: 6500,
    commission_model: 'fixed_salary',
    commission_default_rate: 0,
    status: 'active',
    skills: ['Customer Service', 'POS', 'Appointment Scheduling']
  },
  {
    id: 'emp-tamer',
    code: 'EMP-07',
    full_name: 'Tamer Nabil',
    phone: '01066778899',
    email: 'tamer@lumiere.com',
    job_title_en: 'Senior Accountant & Operations',
    job_title_ar: 'المحاسب المالي ومدير العمليات',
    department: 'Finance',
    branch_id: 'branch-sabapasha',
    employment_type: 'full_time',
    hire_date: '2025-01-01',
    base_salary: 8500,
    commission_model: 'fixed_salary',
    commission_default_rate: 0,
    status: 'active',
    skills: ['Accounting', 'Inventory Audit', 'Payroll', 'Tax']
  }
];

// Initial Services with Consumable Bill of Materials (BOM)
export const initialServices: Service[] = [
  {
    id: 'serv-deep-facial',
    code: 'SRV-FAC-01',
    name_en: 'Deep Facial Cleansing',
    name_ar: 'جلسة تنظيف بشرة عميق',
    category: 'deep_facial',
    description_en: 'Multi-step extraction, ultrasonic cleansing, hydro-peel, calming mask, and high-potency serum.',
    description_ar: 'تنظيف عميق للبشرة بالألتراسونيك وإزالة الرؤوس السوداء مع ماسك كولاجين وسيروم علاجي.',
    duration_minutes: 75,
    price: 1200,
    cost: 150,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 40,
    required_skill: 'Deep Facial',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-cleanser', quantity: 20, unit: 'ml' },
      { product_id: 'prod-mask', quantity: 30, unit: 'g' },
      { product_id: 'prod-serum', quantity: 5, unit: 'ml' },
      { product_id: 'prod-cotton', quantity: 4, unit: 'pieces' },
      { product_id: 'prod-gloves', quantity: 1, unit: 'pairs' }
    ]
  },
  {
    id: 'serv-basic-facial',
    code: 'SRV-FAC-02',
    name_en: 'Basic Refreshing Facial',
    name_ar: 'جلسة تنظيف بشرة نضارة كلاسيك',
    category: 'basic_facial',
    description_en: 'Steam, gentle exfoliation, pore cleansing, and vitamin C hydration.',
    description_ar: 'تنظيف سطحي للبشرة مع بخار وسكراب وتغذية بفيتامين سي.',
    duration_minutes: 45,
    price: 650,
    cost: 80,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 35,
    required_skill: 'Basic Facial',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-cleanser', quantity: 15, unit: 'ml' },
      { product_id: 'prod-scrub', quantity: 15, unit: 'g' },
      { product_id: 'prod-cotton', quantity: 3, unit: 'pieces' },
      { product_id: 'prod-gloves', quantity: 1, unit: 'pairs' }
    ]
  },
  {
    id: 'serv-dermapen',
    code: 'SRV-DERM-01',
    name_en: 'Dermapen Skin Rejuvenation',
    name_ar: 'جلسة ديرمابن نضارة ومسام (Dermapen)',
    category: 'dermapen',
    description_en: 'Microneedling skin therapy tailored with depth settings (0.5mm - 1.5mm) and sterile meso-cocktail serum.',
    description_ar: 'جلسة نضارة وتحفيز كولاجين بأحدث جهاز ديرمابن مع ضبط العمق وسيروم ميزوثيرابي معقم.',
    duration_minutes: 60,
    price: 900,
    cost: 110,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 35,
    required_skill: 'Dermapen & Skin Care',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-dermapen-needle', quantity: 1, unit: 'pieces' },
      { product_id: 'prod-hyaluronic-serum', quantity: 1, unit: 'pieces' },
      { product_id: 'prod-gloves', quantity: 1, unit: 'pairs' },
      { product_id: 'prod-cotton', quantity: 4, unit: 'pieces' }
    ]
  },
  {
    id: 'serv-bridal-makeup',
    code: 'SRV-MKP-01',
    name_en: 'Luxury Bridal Makeup',
    name_ar: 'مكياج زفاف ملكي كامل (Bridal)',
    category: 'makeup',
    description_en: 'Full luxury bridal application with skin prep, individual 3D lashes, contouring, and 24h setting.',
    description_ar: 'مكياج عروس فاخر متكامل مع إعداد البشرة ورموش 3D وتثبيت احترافي يدوم ٢٤ ساعة.',
    duration_minutes: 90,
    price: 1800,
    cost: 250,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 35,
    required_skill: 'Bridal Makeup',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-lashes-3d', quantity: 1, unit: 'pairs' },
      { product_id: 'prod-cotton', quantity: 5, unit: 'pieces' },
      { product_id: 'prod-gloves', quantity: 1, unit: 'pairs' }
    ]
  },
  {
    id: 'serv-soft-makeup',
    code: 'SRV-MKP-02',
    name_en: 'Soft Soirée Makeup',
    name_ar: 'مكياج سواريه ناعم',
    category: 'soft_makeup',
    description_en: 'Elegant soft glam makeup tailored for events, parties, and photography.',
    description_ar: 'مكياج سواريه أنيق بلمسات ناعمة مناسب للسهرات وجلسات التصوير.',
    duration_minutes: 60,
    price: 950,
    cost: 120,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 35,
    required_skill: 'Soft Makeup',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-cotton', quantity: 3, unit: 'pieces' }
    ]
  },
  {
    id: 'serv-eyebrows-style',
    code: 'SRV-BRW-02',
    name_en: 'Eyebrow Styling & Tinting',
    name_ar: 'تحديد وتنسيق الحواجب مع صبغة علاجية',
    category: 'eyebrows_styling',
    description_en: 'Precision eyebrow mapping, threading/waxing shaping, and botanical tint.',
    description_ar: 'تحديد دقيق لرسمة الحاجب وتنظيفه بالخيط والشمع مع صبغة نباتية.',
    duration_minutes: 30,
    price: 350,
    cost: 30,
    tax_rate: 0,
    commission_type: 'fixed',
    commission_fixed_amount: 100,
    required_skill: 'Eyebrow Styling',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-cotton', quantity: 2, unit: 'pieces' }
    ]
  },
  {
    id: 'serv-lashes-lifting',
    code: 'SRV-LSH-01',
    name_en: 'Lash Lifting & Keratin Boost',
    name_ar: 'رفع وتكثيف الرموش الطبيعية بالكيراتين',
    category: 'lashes',
    description_en: 'Natural lash curl enhancement with nourishing keratin infusion and black tint.',
    description_ar: 'رفع الرموش الطبيعية وتغذيتها بالكيراتين الأسود لمظهر كثيف وجذاب لمدة ٨ أسابيع.',
    duration_minutes: 50,
    price: 600,
    cost: 70,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 35,
    required_skill: 'Lashes Lifting',
    is_active: true,
    recipe_items: [
      { product_id: 'prod-cotton', quantity: 3, unit: 'pieces' }
    ]
  },
  {
    id: 'serv-hair-styling',
    code: 'SRV-HAR-01',
    name_en: 'Hair Styling & Glam Waves',
    name_ar: 'تصفيف شعر ويفي هوليوود / كلاسيك',
    category: 'hair_styling',
    description_en: 'Professional blow-dry and thermal styling, Hollywood glam waves or sleek look.',
    description_ar: 'سيشوار احترافي ويفي هوليوود أو تمليس حراري بأحدث أجهزة التصفيف.',
    duration_minutes: 45,
    price: 550,
    cost: 50,
    tax_rate: 0,
    commission_type: 'percentage',
    commission_percentage: 30,
    required_skill: 'Hair Styling',
    is_active: true,
    recipe_items: []
  }
];

// Initial Inventory Products (Consumables & Retail)
export const initialProducts: Product[] = [
  {
    id: 'prod-cleanser',
    sku: 'LUM-SKN-CLN01',
    barcode: '622100000001',
    name_en: 'Medical Facial Cleansing Foam 500ml',
    name_ar: 'غسول رغوي طبي للبشرة ٥٠٠ مل',
    category: 'Skin Care',
    brand: 'Dermaceutic Paris',
    unit: 'ml',
    purchase_cost: 450,
    selling_price: 680,
    current_stock: 420,
    min_stock: 100,
    max_stock: 1000,
    branch_id: 'branch-sabapasha',
    batch_number: 'B-2026-03',
    expiry_date: '2027-12-31'
  },
  {
    id: 'prod-mask',
    sku: 'LUM-SKN-MSK01',
    barcode: '622100000002',
    name_en: 'Gold Collagen Firming Mask 1000g',
    name_ar: 'ماسك الذهب والكولاجين لشد البشرة ١٠٠٠ جم',
    category: 'Skin Care',
    brand: 'Casmara Luxury',
    unit: 'g',
    purchase_cost: 950,
    selling_price: 1400,
    current_stock: 650,
    min_stock: 150,
    max_stock: 2000,
    branch_id: 'branch-sabapasha',
    batch_number: 'B-2026-01',
    expiry_date: '2028-06-30'
  },
  {
    id: 'prod-serum',
    sku: 'LUM-SKN-SRM01',
    barcode: '622100000003',
    name_en: 'Hyaluronic Acid Multi-Serum 100ml',
    name_ar: 'سيروم حمض الهيالورونيك المركز ١٠٠ مل',
    category: 'Skin Care',
    brand: 'La Roche-Posay',
    unit: 'ml',
    purchase_cost: 620,
    selling_price: 890,
    current_stock: 75,
    min_stock: 40,
    max_stock: 300,
    branch_id: 'branch-sabapasha',
    batch_number: 'B-2025-09',
    expiry_date: '2027-10-15'
  },
  {
    id: 'prod-scrub',
    sku: 'LUM-SKN-SCB01',
    barcode: '622100000004',
    name_en: 'Micro-Exfoliating Enzyme Scrub 500g',
    name_ar: 'مقشر إنزيمي لطيف للبشرة ٥٠٠ جم',
    category: 'Skin Care',
    brand: 'Bioderma Lab',
    unit: 'g',
    purchase_cost: 380,
    selling_price: 550,
    current_stock: 340,
    min_stock: 80,
    max_stock: 800,
    branch_id: 'branch-sabapasha',
    batch_number: 'B-2026-02',
    expiry_date: '2028-01-30'
  },
  {
    id: 'prod-lashes-3d',
    sku: 'LUM-LSH-3D01',
    barcode: '622100000005',
    name_en: 'Silk 3D Mink Lashes (Pair)',
    name_ar: 'رموش حريرية طبيعية 3D (زوج)',
    category: 'Lashes',
    brand: 'Lumière Exclusive',
    unit: 'pairs',
    purchase_cost: 65,
    selling_price: 160,
    current_stock: 8, // LOW STOCK TRIGGER!
    min_stock: 15,
    max_stock: 150,
    branch_id: 'branch-sabapasha',
    batch_number: 'L-2026-04'
  },
  {
    id: 'prod-gloves',
    sku: 'LUM-MED-GLV',
    barcode: '622100000009',
    name_en: 'Nitrile Medical Gloves Black (Pairs)',
    name_ar: 'قفازات طبية نايتريل سوداء خالية من البودرة (أزواج)',
    category: 'Supplies',
    brand: 'SafeTouch Egypt',
    unit: 'pairs',
    purchase_cost: 3.5,
    selling_price: 10,
    current_stock: 240,
    min_stock: 50,
    max_stock: 1000,
    branch_id: 'branch-sabapasha'
  },
  {
    id: 'prod-cotton',
    sku: 'LUM-MED-COT',
    barcode: '622100000010',
    name_en: 'Pure Cotton Facial Cleansing Pads',
    name_ar: 'قطن طبي لتنظيف البشرة (قطع)',
    category: 'Supplies',
    brand: 'SoftCare Alex',
    unit: 'pieces',
    purchase_cost: 0.8,
    selling_price: 2,
    current_stock: 580,
    min_stock: 100,
    max_stock: 2000,
    branch_id: 'branch-sabapasha'
  },
  {
    id: 'prod-dermapen-needle',
    sku: 'LUM-DERM-NDL12',
    barcode: '622100000011',
    name_en: 'Sterile Dermapen Cartridge 12/36-Pin',
    name_ar: 'سن ديرمابن معقم ومغلف ١٢/٣٦ إبرة (قطعة)',
    category: 'Dermapen Consumables',
    brand: 'Dr. Pen Medical',
    unit: 'pieces',
    purchase_cost: 25,
    selling_price: 80,
    current_stock: 50, // 50 sterile needles as specified in the study
    min_stock: 15,
    max_stock: 200,
    branch_id: 'branch-sabapasha',
    batch_number: 'DP-2026-08',
    expiry_date: '2028-12-31'
  },
  {
    id: 'prod-hyaluronic-serum',
    sku: 'LUM-DERM-SRM20',
    barcode: '622100000012',
    name_en: 'Meso-Cocktail Rejuvenation Serum 10ml Vials',
    name_ar: 'أمبولات سيروم ميزوثيرابي نضارة ١٠ مل (عبوة)',
    category: 'Dermapen Consumables',
    brand: 'MCCM Medical Cosmetics',
    unit: 'pieces',
    purchase_cost: 65,
    selling_price: 150,
    current_stock: 20, // 20 serum vials as specified in the study
    min_stock: 5,
    max_stock: 100,
    branch_id: 'branch-sabapasha',
    batch_number: 'MC-2026-05',
    expiry_date: '2028-06-30'
  }
];

// Initial Customers in Alexandria
export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    code: 'CST-101',
    full_name: 'Farida El-Gazzar',
    phone: '01012345678',
    whatsapp: '01012345678',
    email: 'farida.gazzar@gmail.com',
    date_of_birth: '1995-04-12',
    gender: 'female',
    address: 'Kafr Abdo, Alexandria',
    preferred_language: 'ar',
    preferred_technician_id: 'emp-sarah',
    source: 'instagram',
    notes: 'Bride upcoming wedding in November. Sensitive skin, prefers warm undertones.',
    tags: ['Bride', 'VIP', 'Sensitive Skin'],
    status: 'vip',
    loyalty_points: 125,
    total_spent: 8500,
    visits_count: 5,
    last_visit: '2026-10-25',
    created_at: '2026-06-15T10:00:00Z',
    branch_id: 'branch-sabapasha',
    cosmetic_profile: {
      skin_type: 'combination',
      foundation_shade: 'MAC Studio Fix NC20 / Dior 1N',
      allergies: 'خالية من الحساسية - تفضل لمسة نهائية مخملية Matte',
      dermapen_depth: 'غير مطبق - مكياج عروس',
      preferred_lashes: 'Full 3D Silk Mink Lashes',
      medical_notes: 'جلسة نضارة وتحضير بشرة سريعة قبل المكياج بيومين',
      consultation_notes: 'تم اعتماد مكياج الزفاف الملكي مع رموش 3D وتثبيت ٢٤ ساعة.'
    }
  },
  {
    id: 'cust-2',
    code: 'CST-102',
    full_name: 'Laila Mostafa',
    phone: '01229876543',
    whatsapp: '01229876543',
    email: 'laila.mostafa@outlook.com',
    date_of_birth: '1998-08-20',
    gender: 'female',
    address: 'Roushdy, Alexandria',
    preferred_language: 'ar',
    preferred_technician_id: 'emp-mariam',
    source: 'referral',
    notes: 'Regular monthly deep facial & Dermapen client. Always books on Thursdays.',
    tags: ['Regular', 'Skin Care', 'Dermapen'],
    status: 'active',
    loyalty_points: 60,
    total_spent: 4200,
    visits_count: 4,
    last_visit: '2026-10-18',
    created_at: '2026-07-02T11:30:00Z',
    branch_id: 'branch-sabapasha',
    cosmetic_profile: {
      skin_type: 'oily',
      foundation_shade: 'Estee Lauder 2W1 Dawn',
      allergies: 'حساسية طفيفة من العطور الكحولية في منتجات البشرة',
      dermapen_depth: '1.25mm للخدود و 0.75mm للجبهة',
      preferred_lashes: 'Natural Classic 10mm',
      medical_notes: 'تم التأكد من إيقاف الريتينول قبل ٥ أيام من موعد الديرمابن',
      consultation_notes: 'جلسة ديرمابن لتحفيز الكولاجين وعلاج المسام مع أمبولات هيالورونيك.'
    }
  },
  {
    id: 'cust-3',
    code: 'CST-103',
    full_name: 'Nadine El-Shazly',
    phone: '01115544332',
    whatsapp: '01115544332',
    email: 'nadine.shazly@yahoo.com',
    date_of_birth: '1992-11-05',
    gender: 'female',
    address: 'Smouha, Alexandria',
    preferred_language: 'en',
    preferred_technician_id: 'emp-dina',
    source: 'tiktok',
    notes: 'Skin preparation and Soft Glam Soirée Makeup scheduled. Prefers English communication.',
    tags: ['Soft Glam', 'Brows', 'Smouha'],
    status: 'active',
    loyalty_points: 90,
    total_spent: 6400,
    visits_count: 3,
    last_visit: '2026-10-12',
    created_at: '2026-08-10T14:15:00Z',
    branch_id: 'branch-sabapasha',
    cosmetic_profile: {
      skin_type: 'sensitive',
      foundation_shade: 'NARS Sheer Glow Deauville',
      allergies: 'حساسية من صبغات الأمونيا ومعطرات الفيشال الصناعية',
      dermapen_depth: '1.0mm مع سيروم ميزو مهدئ للبشرة الحساسة',
      preferred_lashes: 'Natural Lash Lift only',
      medical_notes: 'ضرورة تطبيق واقي شمس فيزيائي 50+ وتجنب الحرارة المباشرة',
      consultation_notes: 'تفضل مكياج سواريه هادئ يركز على رسمة العين بدون فاونديشن ثقيل.'
    }
  },
  {
    id: 'cust-4',
    code: 'CST-104',
    full_name: 'Hanya Zahran',
    phone: '01098877665',
    whatsapp: '01098877665',
    date_of_birth: '2001-02-14',
    gender: 'female',
    address: 'Saba Pasha, Alexandria',
    preferred_language: 'ar',
    preferred_technician_id: 'emp-nourhan',
    source: 'walk_in',
    notes: 'Walk-in for lashes and brow styling.',
    tags: ['Walk-in', 'Lashes', 'Saba Pasha'],
    status: 'active',
    loyalty_points: 25,
    total_spent: 1800,
    visits_count: 2,
    last_visit: '2026-10-22',
    created_at: '2026-09-01T16:00:00Z',
    branch_id: 'branch-sabapasha',
    cosmetic_profile: {
      skin_type: 'normal',
      foundation_shade: 'Huda Beauty Faux Filter 210B Chai',
      allergies: 'لا توجد حساسية معروفة',
      dermapen_depth: '0.5mm نضارة سطحية',
      preferred_lashes: 'Wispy Volume Lash Lift',
      medical_notes: 'لا توجد ملاحظات طبية',
      consultation_notes: 'رفع وتكثيف رموش بالكيراتين الطبيعي بدون تركيب رموش صناعية.'
    }
  }
];

// Initial Today Appointments
export const initialAppointments: Appointment[] = [
  {
    id: 'appt-1',
    code: 'APT-801',
    customer_id: 'cust-1',
    customer_name: 'Farida El-Gazzar',
    customer_phone: '01012345678',
    branch_id: 'branch-sabapasha',
    service_id: 'serv-bridal-makeup',
    service_name_en: 'Luxury Bridal Makeup',
    service_name_ar: 'مكياج زفاف ملكي كامل (Bridal)',
    technician_id: 'emp-sarah',
    technician_name: 'Sarah Gamal',
    room_name: 'VIP Suite 1',
    date: '2026-10-30',
    start_time: '12:00',
    end_time: '13:30',
    duration_minutes: 90,
    price: 1800,
    discount: 100,
    net_price: 1700,
    status: 'in_service',
    payment_status: 'paid',
    deposit_amount: 350,
    deposit_method: 'instapay',
    deposit_paid: true,
    deposit_reference: 'IPAY-78912',
    notes: 'Trial bridal look before wedding day. 350 EGP deposit paid via InstaPay.',
    created_at: '2026-10-28T09:00:00Z',
    calculated_commission: 595 // 35% of 1700
  },
  {
    id: 'appt-2',
    code: 'APT-802',
    customer_id: 'cust-2',
    customer_name: 'Laila Mostafa',
    customer_phone: '01229876543',
    branch_id: 'branch-sabapasha',
    service_id: 'serv-deep-facial',
    service_name_en: 'Deep Facial Cleansing',
    service_name_ar: 'جلسة تنظيف بشرة عميق',
    technician_id: 'emp-mariam',
    technician_name: 'Mariam Soliman',
    room_name: 'Facial Room A',
    date: '2026-10-30',
    start_time: '14:00',
    end_time: '15:15',
    duration_minutes: 75,
    price: 1200,
    discount: 0,
    net_price: 1200,
    status: 'confirmed',
    payment_status: 'partially_paid',
    deposit_amount: 250,
    deposit_method: 'instapay',
    deposit_paid: true,
    deposit_reference: 'IPAY-99214',
    notes: 'Confirmed via WhatsApp with 250 EGP InstaPay deposit.',
    created_at: '2026-10-29T11:20:00Z'
  },
  {
    id: 'appt-3',
    code: 'APT-803',
    customer_id: 'cust-3',
    customer_name: 'Nadine El-Shazly',
    customer_phone: '01115544332',
    branch_id: 'branch-sabapasha',
    service_id: 'serv-soft-makeup',
    service_name_en: 'Soft Soirée Makeup',
    service_name_ar: 'مكياج سواريه ناعم',
    technician_name: 'إدارة المركز (تشغيل مباشر)',
    room_name: 'Makeup Suite',
    date: '2026-10-30',
    start_time: '16:00',
    end_time: '17:00',
    duration_minutes: 60,
    price: 950,
    discount: 50,
    net_price: 900,
    status: 'confirmed',
    payment_status: 'partially_paid',
    deposit_amount: 200,
    deposit_method: 'vodafone_cash',
    deposit_paid: true,
    deposit_reference: 'VF-33214',
    notes: 'Soirée makeup for evening event. 200 EGP deposit via Vodafone Cash.',
    created_at: '2026-10-27T15:40:00Z'
  },
  {
    id: 'appt-4',
    code: 'APT-804',
    customer_id: 'cust-4',
    customer_name: 'Hanya Zahran',
    customer_phone: '01098877665',
    branch_id: 'branch-sabapasha',
    service_id: 'serv-lashes-lifting',
    service_name_en: 'Lash Lifting & Keratin Boost',
    service_name_ar: 'رفع وتكثيف الرموش الطبيعية بالكيراتين',
    technician_id: 'emp-nourhan',
    technician_name: 'Nourhan Tarek',
    room_name: 'Lashes Booth 2',
    date: '2026-10-30',
    start_time: '10:30',
    end_time: '11:20',
    duration_minutes: 50,
    price: 600,
    discount: 0,
    net_price: 600,
    status: 'completed',
    payment_status: 'paid',
    deposit_amount: 100,
    deposit_method: 'instapay',
    deposit_paid: true,
    deposit_reference: 'IPAY-44120',
    notes: 'Delighted with results, gave 5 star review.',
    created_at: '2026-10-29T14:10:00Z',
    completed_at: '2026-10-30T11:25:00Z',
    calculated_commission: 210,
    inventory_deducted: true
  },
  {
    id: 'appt-5',
    code: 'APT-805',
    customer_id: 'cust-2',
    customer_name: 'Laila Mostafa',
    customer_phone: '01229876543',
    branch_id: 'branch-sabapasha',
    service_id: 'serv-dermapen',
    service_name_en: 'Dermapen Skin Rejuvenation',
    service_name_ar: 'جلسة ديرمابن نضارة ومسام (Dermapen)',
    technician_name: 'إدارة وتشغيل المركز (مباشر)',
    room_name: 'Facial & Dermapen Suite',
    date: '2026-10-31',
    start_time: '12:00',
    end_time: '13:00',
    duration_minutes: 60,
    price: 900,
    discount: 0,
    net_price: 900,
    status: 'confirmed',
    payment_status: 'partially_paid',
    deposit_amount: 200,
    deposit_method: 'instapay',
    deposit_paid: true,
    deposit_reference: 'IPAY-88219',
    notes: 'عربون ٢٠٠ ج.م مدفوع إنستاباي. عمق السن 1.25mm للخدود و 0.75mm للجبهة. إيقاف الريتينول مؤكد.',
    created_at: '2026-10-30T16:00:00Z'
  }
];

// Initial Cash Register Session for Today
export const initialCashRegister: CashRegisterSession = {
  id: 'reg-session-today',
  branch_id: 'branch-sabapasha',
  register_name: 'Front Desk Main Drawer #1',
  opened_by_user_id: 'emp-salma',
  opened_by_user_name: 'Salma Ezzat',
  opened_at: '2026-10-30T09:30:00Z',
  status: 'open',
  opening_balance: 500, // Fixed 500 EGP drawer float as per operational study
  cash_sales: 2400,
  cash_expenses: 350,
  cash_withdrawals: 0,
  cash_deposits: 0,
  expected_cash: 2550
};

// Initial Expenses
export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    branch_id: 'branch-sabapasha',
    category: 'beauty_supplies',
    amount: 350,
    payment_method: 'cash',
    description_en: 'Emergency medical cotton and disposable salon cap supply',
    description_ar: 'شراء قطن طبي إضافي وأغطية رأس صالون للاستخدام لمرة واحدة',
    date: '2026-10-30',
    created_by_name: 'Salma Ezzat',
    approved_by_name: 'Tamer Nabil',
    status: 'approved',
    requires_approval: false
  },
  {
    id: 'exp-2',
    branch_id: 'branch-sabapasha',
    category: 'electricity',
    amount: 3850,
    payment_method: 'bank_transfer',
    description_en: 'Alexandria Electricity Company monthly commercial bill',
    description_ar: 'فاتورة شركة كهرباء الإسكندرية التجارية للشهر الحالي',
    date: '2026-10-25',
    created_by_name: 'Tamer Nabil',
    approved_by_name: 'Dr. Yasmine El-Badawi',
    status: 'approved',
    requires_approval: true
  },
  {
    id: 'exp-3',
    branch_id: 'branch-sabapasha',
    category: 'marketing',
    amount: 4500,
    payment_method: 'visa',
    description_en: 'Instagram & Facebook sponsored ads for bridal season Alexandria',
    description_ar: 'حملة إعلانات ممولة على إنستجرام وفيسبوك لموسم أفراح الإسكندرية',
    date: '2026-10-22',
    created_by_name: 'Tamer Nabil',
    approved_by_name: 'Eng. Karim Mansour',
    status: 'approved',
    requires_approval: true
  }
];

// Initial Audit Logs
export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'emp-salma',
    user_name: 'Salma Ezzat',
    user_role: 'receptionist',
    action: 'CASH_REGISTER_OPEN',
    entity: 'cash_register',
    entity_id: 'reg-session-today',
    details_en: 'Opened front desk cash register with 2,000 EGP starting balance.',
    details_ar: 'فتح درج النقدية بالاستقبال برصيد افتتاحي ٢,٠٠٠ ج.م.',
    created_at: '2026-10-30T09:30:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 'log-2',
    user_id: 'emp-nourhan',
    user_name: 'Nourhan Tarek',
    user_role: 'technician',
    action: 'APPOINTMENT_COMPLETED',
    entity: 'appointment',
    entity_id: 'appt-4',
    details_en: 'Completed Lash Lifting for Hanya Zahran. Auto-deducted BOM supplies and booked 210 EGP commission.',
    details_ar: 'إنهاء جلسة رفع الرموش للعميلة هانيا زهران. تم خصم الخامات وحساب عمولة ٢١٠ ج.م.',
    created_at: '2026-10-30T11:25:00Z',
    ip_address: '192.168.1.15'
  }
];

// Initial Notifications
export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    title_en: 'Low Stock Alert: 3D Silk Lashes',
    title_ar: 'تنبيه انخفاض مخزون: رموش 3D حريرية',
    message_en: 'Current stock is 8 pairs, below minimum threshold of 15 pairs.',
    message_ar: 'الرصيد المتاح ٨ أزواج فقط، وهو أقل من الحد الأدنى (١٥ زوج).',
    type: 'warning',
    module: 'inventory',
    created_at: '2026-10-30T10:00:00Z',
    read: false,
    link_module: 'inventory'
  },
  {
    id: 'notif-2',
    title_en: 'Upcoming VIP Bride Appointment',
    title_ar: 'موعد عميلة VIP: مكياج زفاف',
    message_en: 'Farida El-Gazzar is currently in VIP Suite 1 with Sarah Gamal.',
    message_ar: 'العميلة فريدة الجزار متواجدة حالياً بالجناح الملكي مع أخصائية المكياج سارة جمال.',
    type: 'info',
    module: 'appointments',
    created_at: '2026-10-30T12:00:00Z',
    read: false,
    link_module: 'appointments'
  }
];

// Storage Key
const STORAGE_KEY = 'lumiere_beauty_center_erp_state_v1';

export function useErpStore() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentBranchId, setCurrentBranchId] = useState<string>('branch-sabapasha');
  const [currentRole, setCurrentRole] = useState<UserRole>('business_owner');
  const [activeModule, setActiveModule] = useState<string>('dashboard');

  const [branches] = useState<Branch[]>(initialBranches);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [cashRegister, setCashRegister] = useState<CashRegisterSession>(initialCashRegister);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  
  // Technician & Commission module activation toggle (starts disabled as requested)
  const [enableTechnicians, setEnableTechnicians] = useState<boolean>(false);

  // Toggle Language & Direction
  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Add an Audit Log
  const addAuditLog = (log: Omit<AuditLog, 'id' | 'created_at' | 'ip_address'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      ip_address: '192.168.1.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Appointment Status Transitions with Automatic Event Handlers
  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    const appt = appointments.find(a => a.id === appointmentId);
    if (!appt) return;

    if (newStatus === 'completed') {
      completeAppointment(appointmentId);
      return;
    }

    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        return { ...a, status: newStatus };
      }
      return a;
    }));

    addAuditLog({
      user_id: 'current-user',
      user_name: 'Staff User',
      user_role: currentRole,
      action: 'APPOINTMENT_STATUS_CHANGE',
      entity: 'appointment',
      entity_id: appointmentId,
      details_en: `Changed appointment status to ${newStatus}`,
      details_ar: `تغيير حالة الموعد إلى ${newStatus}`,
      old_value: appt.status,
      new_value: newStatus
    });
  };

  // Complete Appointment:
  // 1. Calculate Technician Commission
  // 2. Automatically Deduct BOM Inventory
  // 3. Mark appointment complete
  // 4. Update customer stats & loyalty points
  // 5. Create immutable audit log
  const completeAppointment = (appointmentId: string) => {
    const appt = appointments.find(a => a.id === appointmentId);
    if (!appt) return;

    const service = services.find(s => s.id === appt.service_id);
    const tech = employees.find(e => e.id === appt.technician_id);

    // 1. Calculate Commission (only if technician mode is enabled by management)
    let commission = 0;
    if (enableTechnicians && appt.technician_id && service) {
      commission = calculateTechnicianCommission({
        servicePrice: appt.price,
        discount: appt.discount,
        commissionType: service.commission_type,
        commissionPercentage: service.commission_percentage,
        commissionFixedAmount: service.commission_fixed_amount,
        technicianRateOverride: tech?.commission_model === 'fixed_salary' ? 0 : tech?.commission_default_rate
      });
    }

    // 2. Deduct BOM Consumables
    if (service && service.recipe_items.length > 0) {
      const deductionCalc = calculateBillOfMaterialsConsumption({
        recipeItems: service.recipe_items,
        inventory: products
      });

      // Update product inventory levels
      setProducts(prevProducts => {
        return prevProducts.map(prod => {
          const deduction = deductionCalc.deductions.find(d => d.productId === prod.id);
          if (deduction) {
            return {
              ...prod,
              current_stock: Math.max(0, prod.current_stock - deduction.quantity)
            };
          }
          return prod;
        });
      });

      // Log inventory movements
      for (const d of deductionCalc.deductions) {
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}-${Math.random()}`,
          product_id: d.productId,
          product_name_en: d.productName,
          product_name_ar: d.productName,
          branch_id: appt.branch_id,
          type: 'service_consumption',
          quantity_change: -d.quantity,
          previous_stock: d.currentStock,
          new_stock: d.newStock,
          reference_type: 'appointment',
          reference_id: appt.id,
          notes: `BOM consumed for completed service ${appt.service_name_en}`,
          created_at: new Date().toISOString(),
          created_by_name: appt.technician_name || (lang === 'ar' ? 'إدارة وتشغيل المركز' : 'Center Direct Operation')
        };
        setInventoryMovements(prev => [movement, ...prev]);
      }
    }

    // 3. Mark appointment complete
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: 'completed',
          completed_at: new Date().toISOString(),
          calculated_commission: commission,
          inventory_deducted: true
        };
      }
      return a;
    }));

    // 4. Update Customer stats
    const earnedPoints = Math.floor(appt.net_price / 100);
    setCustomers(prev => prev.map(c => {
      if (c.id === appt.customer_id) {
        return {
          ...c,
          loyalty_points: c.loyalty_points + earnedPoints,
          total_spent: c.total_spent + appt.net_price,
          visits_count: c.visits_count + 1,
          last_visit: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));

    // 5. Audit Log
    addAuditLog({
      user_id: 'current-user',
      user_name: 'Staff User',
      user_role: currentRole,
      action: 'APPOINTMENT_COMPLETED',
      entity: 'appointment',
      entity_id: appointmentId,
      details_en: `Completed appointment ${appt.code}. Earned commission: ${commission} EGP. Inventory deducted.`,
      details_ar: `إنهاء الموعد ${appt.code}. استحقاق عمولة: ${commission} ج.م وتم خصم الخامات.`
    });
  };

  // Create New Appointment with Double-Booking check
  const createAppointment = (newApptData: Omit<Appointment, 'id' | 'code' | 'created_at'>): { success: boolean; error?: string } => {
    // Conflict check
    const conflict = checkDoubleBooking({
      existingAppointments: appointments,
      technicianId: newApptData.technician_id,
      branchId: newApptData.branch_id,
      date: newApptData.date,
      startTime: newApptData.start_time,
      durationMinutes: newApptData.duration_minutes
    });

    if (conflict.hasConflict) {
      return {
        success: false,
        error: lang === 'ar' 
          ? `تعارض في المواعيد! الأخصائية لديها موعد آخر (${conflict.conflictingAppointment?.service_name_ar}) في نفس الوقت.`
          : `Double booking conflict! Technician already has appointment (${conflict.conflictingAppointment?.service_name_en}) at this time.`
      };
    }

    const apptCount = appointments.length + 801;
    const newAppt: Appointment = {
      ...newApptData,
      id: `appt-${Date.now()}`,
      code: `APT-${apptCount}`,
      created_at: new Date().toISOString()
    };

    setAppointments(prev => [newAppt, ...prev]);

    addAuditLog({
      user_id: 'current-user',
      user_name: 'Receptionist',
      user_role: currentRole,
      action: 'APPOINTMENT_CREATED',
      entity: 'appointment',
      entity_id: newAppt.id,
      details_en: `Created new booking ${newAppt.code} for ${newAppt.customer_name}`,
      details_ar: `تسجيل حجز جديد ${newAppt.code} للعميلة ${newAppt.customer_name}`
    });

    return { success: true };
  };

  // Process POS Sale with Split Payments
  const completePosSale = (saleData: {
    customerId: string;
    customerName: string;
    branchId: string;
    cashierName: string;
    items: SaleInvoice['items'];
    discount: number;
    payments: PaymentSplit[];
    pointsToRedeem?: number;
    appointmentId?: string;
  }): { success: boolean; invoice?: SaleInvoice; error?: string } => {
    const calc = processPosSaleCalculation({
      items: saleData.items,
      discountAmount: saleData.discount,
      pointsToRedeem: saleData.pointsToRedeem,
      payments: saleData.payments
    });

    if (!calc.isFullyPaid) {
      return {
        success: false,
        error: lang === 'ar'
          ? `المبلغ المدفوع أقل من الإجمالي المطلوب! المتبقي: ${calc.remainingBalance} ج.م`
          : `Insufficient payment! Remaining due: ${calc.remainingBalance} EGP`
      };
    }

    const invoiceNum = `INV-2026-${String(invoices.length + 1001)}`;
    const newInvoice: SaleInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNum,
      appointment_id: saleData.appointmentId,
      customer_id: saleData.customerId,
      customer_name: saleData.customerName,
      branch_id: saleData.branchId,
      cashier_id: 'cashier-1',
      cashier_name: saleData.cashierName,
      items: saleData.items,
      subtotal: calc.subtotal,
      discount: calc.discount,
      tax: calc.tax,
      total: calc.total,
      paid_amount: calc.paidAmount,
      change_amount: calc.changeAmount,
      status: 'paid',
      payments: saleData.payments,
      points_earned: calc.pointsEarned,
      points_redeemed: saleData.pointsToRedeem,
      points_discount_amount: calc.pointsDiscount,
      created_at: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update cash register if cash payment was included
    const cashPortion = saleData.payments.find(p => p.method === 'cash')?.amount || 0;
    if (cashPortion > 0) {
      setCashRegister(prev => ({
        ...prev,
        cash_sales: prev.cash_sales + cashPortion,
        expected_cash: prev.expected_cash + cashPortion
      }));
    }

    // Update customer points & spend
    setCustomers(prev => prev.map(c => {
      if (c.id === saleData.customerId) {
        const netPoints = c.loyalty_points - (saleData.pointsToRedeem || 0) + calc.pointsEarned;
        return {
          ...c,
          loyalty_points: Math.max(0, netPoints),
          total_spent: c.total_spent + calc.total,
          visits_count: c.visits_count + 1,
          last_visit: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));

    // If linked to an appointment, mark appointment paid
    if (saleData.appointmentId) {
      setAppointments(prev => prev.map(a => {
        if (a.id === saleData.appointmentId) {
          return { ...a, payment_status: 'paid' };
        }
        return a;
      }));
    }

    addAuditLog({
      user_id: 'current-user',
      user_name: saleData.cashierName,
      user_role: currentRole,
      action: 'POS_SALE_COMPLETED',
      entity: 'sale_invoice',
      entity_id: newInvoice.id,
      details_en: `Processed invoice ${newInvoice.invoice_number} for ${calc.total} EGP`,
      details_ar: `إصدار فاتورة بيع ${newInvoice.invoice_number} بقيمة ${calc.total} ج.م`
    });

    return { success: true, invoice: newInvoice };
  };

  // Adjust Inventory with reason and movement log
  const adjustProductStock = (productId: string, newStock: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const diff = newStock - prod.current_stock;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, current_stock: newStock };
      }
      return p;
    }));

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      product_id: prod.id,
      product_name_en: prod.name_en,
      product_name_ar: prod.name_ar,
      branch_id: prod.branch_id,
      type: 'manual_adjustment',
      quantity_change: diff,
      previous_stock: prod.current_stock,
      new_stock: newStock,
      notes: reason,
      created_at: new Date().toISOString(),
      created_by_name: 'Inventory Manager'
    };
    setInventoryMovements(prev => [movement, ...prev]);

    addAuditLog({
      user_id: 'current-user',
      user_name: 'Inventory Manager',
      user_role: currentRole,
      action: 'INVENTORY_ADJUSTMENT',
      entity: 'product',
      entity_id: productId,
      details_en: `Stock adjusted for ${prod.name_en} from ${prod.current_stock} to ${newStock}. Reason: ${reason}`,
      details_ar: `تعديل رصيد مخزون ${prod.name_ar} من ${prod.current_stock} إلى ${newStock}. السبب: ${reason}`
    });
  };

  // Record Partner Drawings
  const recordPartnerDrawing = (partnerId: string, amount: number, notes: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          total_drawings: p.total_drawings + amount,
          current_balance: p.current_balance - amount
        };
      }
      return p;
    }));

    addAuditLog({
      user_id: 'current-user',
      user_name: 'Accountant',
      user_role: currentRole,
      action: 'PARTNER_DRAWING',
      entity: 'partner',
      entity_id: partnerId,
      details_en: `Recorded partner drawing of ${amount} EGP. Notes: ${notes}`,
      details_ar: `تسجيل مسحوبات شريك بقيمة ${amount} ج.م. ملاحظات: ${notes}`
    });
  };

  // Add Expense
  const addExpense = (expenseData: Omit<Expense, 'id' | 'status' | 'requires_approval'>) => {
    const requiresApproval = expenseData.amount > 2000;
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      requires_approval: requiresApproval,
      status: requiresApproval ? 'pending_approval' : 'approved'
    };

    setExpenses(prev => [newExpense, ...prev]);

    if (!requiresApproval && expenseData.payment_method === 'cash') {
      setCashRegister(prev => ({
        ...prev,
        cash_expenses: prev.cash_expenses + expenseData.amount,
        expected_cash: prev.expected_cash - expenseData.amount
      }));
    }

    addAuditLog({
      user_id: 'current-user',
      user_name: expenseData.created_by_name,
      user_role: currentRole,
      action: 'EXPENSE_RECORDED',
      entity: 'expense',
      entity_id: newExpense.id,
      details_en: `Recorded expense of ${expenseData.amount} EGP (${expenseData.category})`,
      details_ar: `تسجيل مصروف بقيمة ${expenseData.amount} ج.م (${expenseData.category})`
    });
  };

  // Approve Expense
  const approveExpense = (expenseId: string, approverName: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;

    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return { ...e, status: 'approved', approved_by_name: approverName };
      }
      return e;
    }));

    if (exp.payment_method === 'cash') {
      setCashRegister(prev => ({
        ...prev,
        cash_expenses: prev.cash_expenses + exp.amount,
        expected_cash: prev.expected_cash - exp.amount
      }));
    }

    addAuditLog({
      user_id: 'current-user',
      user_name: approverName,
      user_role: currentRole,
      action: 'EXPENSE_APPROVED',
      entity: 'expense',
      entity_id: expenseId,
      details_en: `Approved expense of ${exp.amount} EGP`,
      details_ar: `اعتماد مصروف بقيمة ${exp.amount} ج.م`
    });
  };

  // Close Register Shift
  const closeCashRegister = (actualCountedCash: number, notes?: string) => {
    const varianceData = calculateCashRegisterVariance({
      openingBalance: cashRegister.opening_balance,
      cashSales: cashRegister.cash_sales,
      cashExpenses: cashRegister.cash_expenses,
      cashWithdrawals: cashRegister.cash_withdrawals,
      cashDeposits: cashRegister.cash_deposits,
      actualCountedCash
    });

    setCashRegister(prev => ({
      ...prev,
      status: 'closed',
      closed_at: new Date().toISOString(),
      actual_cash: actualCountedCash,
      variance: varianceData.variance,
      notes
    }));

    addAuditLog({
      user_id: 'current-user',
      user_name: cashRegister.opened_by_user_name,
      user_role: currentRole,
      action: 'CASH_REGISTER_CLOSED',
      entity: 'cash_register',
      entity_id: cashRegister.id,
      details_en: `Closed register. Expected: ${varianceData.expectedCash} EGP, Counted: ${actualCountedCash} EGP, Variance: ${varianceData.variance} EGP`,
      details_ar: `تقفيل الوردية. المتوقع: ${varianceData.expectedCash} ج.م، الفعلي: ${actualCountedCash} ج.م، الفارق: ${varianceData.variance} ج.م`
    });

    return varianceData;
  };

  // Add Customer
  const addCustomer = (customerData: Omit<Customer, 'id' | 'code' | 'created_at' | 'loyalty_points' | 'total_spent' | 'visits_count'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      code: `CST-${customers.length + 105}`,
      loyalty_points: 0,
      total_spent: 0,
      visits_count: 0,
      created_at: new Date().toISOString()
    };
    setCustomers(prev => [newCust, ...prev]);

    addAuditLog({
      user_id: 'current-user',
      user_name: 'Staff',
      user_role: currentRole,
      action: 'CUSTOMER_CREATED',
      entity: 'customer',
      entity_id: newCust.id,
      details_en: `Added new customer ${newCust.full_name}`,
      details_ar: `إضافة عميلة جديدة ${newCust.full_name}`
    });

    return newCust;
  };

  return {
    lang,
    toggleLanguage,
    currentBranchId,
    setCurrentBranchId,
    currentRole,
    setCurrentRole,
    activeModule,
    setActiveModule,
    branches,
    partners,
    employees,
    services,
    products,
    customers,
    appointments,
    cashRegister,
    expenses,
    auditLogs,
    notifications,
    invoices,
    inventoryMovements,
    enableTechnicians,
    setEnableTechnicians,
    // Actions
    updateAppointmentStatus,
    completeAppointment,
    createAppointment,
    completePosSale,
    adjustProductStock,
    recordPartnerDrawing,
    addExpense,
    approveExpense,
    closeCashRegister,
    addCustomer,
    addAuditLog
  };
}
