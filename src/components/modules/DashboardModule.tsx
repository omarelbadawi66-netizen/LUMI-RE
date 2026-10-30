/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  Sparkles,
  CreditCard,
  UserCheck,
  Package,
  Award,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Appointment, Customer, Employee, Product, Service, Expense, CashRegisterSession } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface DashboardModuleProps {
  lang: 'ar' | 'en';
  appointments: Appointment[];
  customers: Customer[];
  employees: Employee[];
  products: Product[];
  services: Service[];
  expenses: Expense[];
  cashRegister: CashRegisterSession;
  onNavigateModule: (moduleName: string) => void;
  onOpenNewAppointment: () => void;
  onOpenPos: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  lang,
  appointments,
  customers,
  employees,
  products,
  services,
  expenses,
  cashRegister,
  onNavigateModule,
  onOpenNewAppointment,
  onOpenPos
}) => {
  const { t, isRtl } = useI18n(lang);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Key Calculations
  const todayAppts = appointments.filter(a => a.date === '2026-10-30');
  const todayRevenue = todayAppts
    .filter(a => a.payment_status === 'paid')
    .reduce((sum, a) => sum + a.net_price, 0);

  const completedToday = todayAppts.filter(a => a.status === 'completed').length;

  const monthlyRevenue = 84500; // Realistic month-to-date in EGP
  const monthlyExpenses = 28650;
  const monthlyNetProfit = monthlyRevenue - monthlyExpenses;

  const totalCommissionsDue = appointments
    .filter(a => a.status === 'completed' && a.calculated_commission)
    .reduce((sum, a) => sum + (a.calculated_commission || 0), 0) + 12450; // Month to date

  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock);

  // Top services by demand
  const topServices = [
    { name: lang === 'ar' ? 'مكياج زفاف ملكي كامل (Bridal)' : 'Luxury Bridal Makeup', count: 28, revenue: 50400, margin: '52%' },
    { name: lang === 'ar' ? 'جلسة تنظيف بشرة عميق' : 'Deep Facial Cleansing', count: 34, revenue: 40800, margin: '46%' },
    { name: lang === 'ar' ? 'مكياج سواريه ناعم' : 'Soft Soirée Makeup', count: 25, revenue: 23750, margin: '58%' },
    { name: lang === 'ar' ? 'رفع وتكثيف الرموش بالكيراتين' : 'Lash Lifting & Tinting', count: 28, revenue: 16800, margin: '62%' }
  ];

  // Technician performance
  const techPerformance = [
    { name: 'Sarah Gamal', title: lang === 'ar' ? 'أخصائية مكياج' : 'Senior Makeup', sales: 48500, comm: 16975, appts: 26 },
    { name: 'Mariam Soliman', title: lang === 'ar' ? 'عناية بالبشرة' : 'Skin Specialist', sales: 32400, comm: 12960, appts: 32 },
    { name: 'Nourhan Tarek', title: lang === 'ar' ? 'رموش وحواجب' : 'Lashes & Brows', sales: 18200, comm: 6370, appts: 29 },
    { name: 'Hoda Radwan', title: lang === 'ar' ? 'تصفيف شعر' : 'Hair Stylist', sales: 14500, comm: 4350, appts: 22 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#381e25] to-[#5a333d] text-white p-5 rounded-2xl shadow-md border border-[#4d2831]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#e8c0a8]/25 text-[#ffdcc7] font-semibold px-2 py-0.5 rounded-full">
              {lang === 'ar' ? 'فرع الإسكندرية - سابا باشا الرئيسي' : 'Alexandria - Saba Pasha Main Branch'}
            </span>
            <span className="text-[11px] text-[#e8ded6]">
              30 Oct 2026 • 12:00 PM
            </span>
          </div>
          <h1 className="font-serif-title text-2xl font-bold mt-1 text-white">
            {t.brand_name} — {t.nav_dashboard}
          </h1>
          <p className="text-xs text-[#eedfd8] mt-0.5">
            {lang === 'ar' ? 'متابعة شاملة وفورية للإيرادات، المواعيد، حركة المخزون، ونسب الأرباح' : 'Real-time overview of revenue, bookings, inventory consumption, and profits'}
          </p>
        </div>

        {/* Date Filter Tabs & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white/10 backdrop-blur-xs p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs">
            {(['today', 'week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  dateRange === range
                    ? 'bg-white text-[#381e25] font-bold shadow-xs'
                    : 'text-[#eedfd8] hover:bg-white/10'
                }`}
              >
                {range === 'today' ? (lang === 'ar' ? 'اليوم' : 'Today') :
                 range === 'week' ? (lang === 'ar' ? 'هذا الأسبوع' : 'This Week') :
                 range === 'month' ? (lang === 'ar' ? 'هذا الشهر' : 'This Month') :
                 (lang === 'ar' ? 'هذا العام' : 'This Year')}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="px-3.5 py-1.5 bg-[#d8a47f] hover:bg-[#c99570] text-[#2c141a] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.btn_new_appointment}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Today's Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8c746e] uppercase tracking-wider">
              {t.kpi_today_revenue}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#f5ede4] flex items-center justify-center text-[#8b5a4b]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#2d1a1e]">
              {todayRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-[#8c746e] font-semibold">{t.currency}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#2e7d32] font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% {lang === 'ar' ? 'مقارنة بأمس' : 'vs yesterday'}</span>
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8c746e] uppercase tracking-wider">
              {t.kpi_monthly_net_profit}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#edf7ed] flex items-center justify-center text-[#2e7d32]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#2e7d32]">
              {monthlyNetProfit.toLocaleString()}
            </span>
            <span className="text-xs text-[#8c746e] font-semibold">{t.currency}</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8c746e]">
            {lang === 'ar' ? `من إجمالي إيراد ${monthlyRevenue.toLocaleString()} ج.م` : `Out of ${monthlyRevenue.toLocaleString()} EGP revenue`}
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8c746e] uppercase tracking-wider">
              {t.kpi_cash_in_drawer}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fff4e5] flex items-center justify-center text-[#ed6c02]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#2d1a1e]">
              {cashRegister.expected_cash.toLocaleString()}
            </span>
            <span className="text-xs text-[#8c746e] font-semibold">{t.currency}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8c746e]">
            <span>{lang === 'ar' ? 'الوردية مفتوحة' : 'Shift Open'}</span>
            <button 
              onClick={() => onNavigateModule('cash_register')}
              className="text-[#8b5a4b] font-bold hover:underline"
            >
              {lang === 'ar' ? 'الخزينة' : 'Register'} →
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-4 rounded-2xl border transition-shadow ${
          lowStockProducts.length > 0
            ? 'bg-[#fff8f7] border-[#f5c6cb]'
            : 'bg-white border-[#ebdcd0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8c746e] uppercase tracking-wider">
              {t.kpi_low_stock_alerts}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-[#ffedec] text-[#d32f2f]' : 'bg-[#f5ede4] text-[#8b5a4b]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-[#d32f2f]' : 'text-[#2d1a1e]'}`}>
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-[#8c746e] font-semibold">
              {lang === 'ar' ? 'أصناف بحاجة للشراء' : 'Items to reorder'}
            </span>
          </div>
          <div className="mt-2 text-[11px]">
            <button
              onClick={() => onNavigateModule('inventory')}
              className="text-[#d32f2f] font-bold hover:underline"
            >
              {lang === 'ar' ? 'مراجعة طلبات الشراء' : 'Review inventory'} →
            </button>
          </div>
        </div>
      </div>

      {/* Business Intelligence Anomalies & Insights Card */}
      <div className="bg-[#fcf7f3] border border-[#ebd8cb] rounded-2xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#b07447]" />
            <h3 className="text-xs font-bold text-[#352026] uppercase tracking-wider">
              {t.title_business_anomalies}
            </h3>
          </div>
          <span className="text-[11px] bg-white text-[#8b5a4b] px-2.5 py-0.5 rounded-full border border-[#e3d0c2] font-semibold">
            {lang === 'ar' ? 'تحليل ذكاء الأعمال الحي' : 'Live BI Analytics'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl border border-[#ebdcd0] text-xs space-y-1">
            <div className="font-semibold text-[#2d1a1e] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#b07447]" />
              <span>{lang === 'ar' ? 'الأعلى ربحية هذا الشهر' : 'Highest Margin Service'}</span>
            </div>
            <p className="text-[11px] text-[#715c61]">
              {lang === 'ar' 
                ? 'مكياج الزفاف الملكي وجلسات التنظيف العميق حققت أعلى هامش مساهمة (٥٢٪) بإجمالي ٥٠,٤٠٠ ج.م.' 
                : 'Luxury Bridal Makeup and Deep Facial generated highest contribution margin (52%) with 50,400 EGP revenue.'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#ebdcd0] text-xs space-y-1">
            <div className="font-semibold text-[#2d1a1e] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>{lang === 'ar' ? 'معدل عودة العميلات (Retention)' : 'Customer Retention'}</span>
            </div>
            <p className="text-[11px] text-[#715c61]">
              {lang === 'ar'
                ? '٧٨٪ من عميلات فرع سابا باشا هذا الشهر هن عميلات متكررات، خاصة في جلسات التنظيف والمكياج.'
                : '78% of clients in Saba Pasha branch this month are returning visitors, primarily for Facial and Makeup sessions.'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#ebdcd0] text-xs space-y-1">
            <div className="font-semibold text-[#d32f2f] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تنبيه استهلاك خامات' : 'Consumables Alert'}</span>
            </div>
            <p className="text-[11px] text-[#715c61]">
              {lang === 'ar'
                ? 'رموش 3D الحريرية وماسكات الكولاجين قاربت على النفاد بعد حجوزات نهاية الأسبوع المكثفة.'
                : '3D Silk Lashes and Collagen masks will run out after this weekend bookings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Bookings Stream & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Appointments Stream (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#352026]">
                {lang === 'ar' ? 'جدول مواعيد اليوم الحية (سابا باشا)' : "Today's Live Bookings (Saba Pasha)"}
              </h3>
              <p className="text-[11px] text-[#8c746e]">
                {todayAppts.length} {lang === 'ar' ? 'مواعيد مسجلة اليوم' : 'scheduled appointments'}
              </p>
            </div>
            <button
              onClick={() => onNavigateModule('appointments')}
              className="text-xs font-semibold text-[#8b5a4b] hover:underline"
            >
              {lang === 'ar' ? 'عرض جدول التقويم الكامل' : 'View Full Calendar'} →
            </button>
          </div>

          <div className="space-y-2.5">
            {todayAppts.map(appt => (
              <div 
                key={appt.id}
                className="p-3 rounded-xl border border-[#eee4db] hover:border-[#dbc7b8] bg-[#fdfcfb] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center py-1 rounded-lg bg-[#f5ede4] text-[#4a2e35] shrink-0">
                    <span className="block text-xs font-bold">{appt.start_time}</span>
                    <span className="block text-[9px] text-[#856b64]">{appt.duration_minutes}m</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2e191e]">{appt.customer_name}</span>
                      <span className="text-[10px] text-[#8c746e] font-mono">({appt.code})</span>
                    </div>
                    <div className="text-[11px] text-[#6e595e] flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-[#8b5a4b]">
                        {lang === 'ar' ? appt.service_name_ar : appt.service_name_en}
                      </span>
                      <span>•</span>
                      <span>{appt.technician_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="text-end">
                    <span className="text-xs font-bold text-[#2e191e]">{appt.net_price} {t.currency}</span>
                    <span className={`block text-[10px] font-semibold ${
                      appt.payment_status === 'paid' ? 'text-[#2e7d32]' : 'text-[#ed6c02]'
                    }`}>
                      {appt.payment_status === 'paid' ? (lang === 'ar' ? 'مدفوع' : 'Paid') : (lang === 'ar' ? 'بانتظار السداد' : 'Unpaid')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${
                    appt.status === 'completed'
                      ? 'bg-[#eef8f1] text-[#1e8e3e]'
                      : appt.status === 'in_service'
                      ? 'bg-[#e8f0fe] text-[#1967d2] animate-pulse'
                      : appt.status === 'confirmed'
                      ? 'bg-[#fef7e0] text-[#b06000]'
                      : 'bg-[#f1f3f4] text-[#5f6368]'
                  }`}>
                    {appt.status === 'completed' ? t.status_completed :
                     appt.status === 'in_service' ? t.status_in_service :
                     appt.status === 'confirmed' ? t.status_confirmed :
                     appt.status === 'checked_in' ? t.status_checked_in : appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services Breakdown (1 col) */}
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-bold text-sm text-[#352026]">
              {t.title_top_services}
            </h3>
            <p className="text-[11px] text-[#8c746e]">
              {lang === 'ar' ? 'حسب الإيراد وهامش المساهمة' : 'By revenue and contribution margin'}
            </p>
          </div>

          <div className="space-y-3">
            {topServices.map((srv, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#352026] truncate max-w-[170px]">{srv.name}</span>
                  <span className="font-bold text-[#8b5a4b]">{srv.revenue.toLocaleString()} {t.currency}</span>
                </div>
                <div className="w-full bg-[#f5ede4] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#8b5a4b] to-[#c78d6b] h-full rounded-full" 
                    style={{ width: `${Math.min(100, (srv.revenue / 55000) * 100)}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8c746e]">
                  <span>{srv.count} {lang === 'ar' ? 'جلسة منفذة' : 'completed sessions'}</span>
                  <span className="font-bold text-[#2e7d32]">{srv.margin} {lang === 'ar' ? 'هامش ربح' : 'margin'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#ebdcd0]">
            <button
              onClick={() => onNavigateModule('services')}
              className="w-full py-2 bg-[#f9f5f0] hover:bg-[#f3ede4] text-[#4a2e35] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              {lang === 'ar' ? 'إدارة دليل الخدمات والوصفات (BOM)' : 'Manage Services & BOM Recipes'}
            </button>
          </div>
        </div>
      </div>

      {/* Technician Leaderboard & Commissions */}
      <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#352026]">
              {t.title_technician_performance}
            </h3>
            <p className="text-[11px] text-[#8c746e]">
              {lang === 'ar' ? 'العمولات محسوبة تلقائياً وفق العقود (نسبة، ثابت، وهجين)' : 'Commissions calculated automatically per contracts'}
            </p>
          </div>
          <button
            onClick={() => onNavigateModule('payroll')}
            className="text-xs font-semibold text-[#8b5a4b] hover:underline"
          >
            {lang === 'ar' ? 'مراجعة كشوف الرواتب' : 'Review Payroll'} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                <th className="py-2.5 px-3 text-start">{t.hr_emp_name}</th>
                <th className="py-2.5 px-3 text-start">{t.hr_job_title}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'عدد الجلسات' : 'Sessions'}</th>
                <th className="py-2.5 px-3 text-end">{lang === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</th>
                <th className="py-2.5 px-3 text-end">{t.hr_comm_earned}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e7de]">
              {techPerformance.map((tech, idx) => (
                <tr key={idx} className="hover:bg-[#fdfaf7] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#2f1b21] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f4ebe2] text-[#8b5a4b] font-bold text-xs flex items-center justify-center">
                      {tech.name[0]}
                    </div>
                    <span>{tech.name}</span>
                  </td>
                  <td className="py-3 px-3 text-[#715c61]">{tech.title}</td>
                  <td className="py-3 px-3 text-center font-medium">{tech.appts}</td>
                  <td className="py-3 px-3 text-end font-semibold text-[#2f1b21]">{tech.sales.toLocaleString()} {t.currency}</td>
                  <td className="py-3 px-3 text-end font-bold text-[#2e7d32]">
                    +{tech.comm.toLocaleString()} {t.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
