/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Partner, Expense, UserRole } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface FinancePartnersModuleProps {
  lang: 'ar' | 'en';
  partners: Partner[];
  expenses: Expense[];
  currentRole: UserRole;
  onRecordPartnerDrawing: (partnerId: string, amount: number, notes: string) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'status' | 'requires_approval'>) => void;
  onApproveExpense: (expenseId: string, approverName: string) => void;
}

export const FinancePartnersModule: React.FC<FinancePartnersModuleProps> = ({
  lang,
  partners,
  expenses,
  currentRole,
  onRecordPartnerDrawing,
  onAddExpense,
  onApproveExpense
}) => {
  const { t, isRtl } = useI18n(lang);
  const [activeTab, setActiveTab] = useState<'partners' | 'expenses' | 'pl'>('partners');

  // Drawing Modal State
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [drawingAmount, setDrawingAmount] = useState<number>(10000);
  const [drawingNotes, setDrawingNotes] = useState('');

  // New Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<Expense['category']>('beauty_supplies');
  const [expAmount, setExpAmount] = useState<number>(500);
  const [expMethod, setExpMethod] = useState<Expense['payment_method']>('cash');
  const [expDesc, setExpDesc] = useState('');

  const totalCapital = partners.reduce((sum, p) => sum + p.initial_capital + p.additional_contributions, 0);
  const totalDrawings = partners.reduce((sum, p) => sum + p.total_drawings, 0);

  // Month to date P&L Summary
  const plData = {
    grossServiceRevenue: 78500,
    retailProductRevenue: 6000,
    totalRevenue: 84500,
    technicianCommissions: 28500,
    productConsumablesCost: 8900,
    grossProfit: 47100,
    operatingExpenses: {
      rent: 14000,
      utilities: 4200,
      marketing: 4500,
      supplies: 3500,
      maintenance: 2450
    },
    totalOperatingExpenses: 28650,
    netOperatingProfit: 18450
  };

  const handleDrawingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || drawingAmount <= 0) return;
    onRecordPartnerDrawing(selectedPartnerId, drawingAmount, drawingNotes || 'Owner personal drawing');
    setIsDrawingModalOpen(false);
    setDrawingNotes('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;
    onAddExpense({
      branch_id: 'branch-stanley',
      category: expCategory,
      amount: expAmount,
      payment_method: expMethod,
      description_en: expDesc || 'Operating Expense',
      description_ar: expDesc || 'مصروف تشغيلي',
      date: '2026-10-30',
      created_by_name: 'Tamer Nabil'
    });
    setIsExpenseModalOpen(false);
    setExpDesc('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_finance}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'حسابات الشركاء وتوزيع الأرباح، قائمة الدخل P&L، والمصروفات ودورة الاعتمادات'
              : 'Partner equity & drawings, Profit & Loss statement, and operating expenses with approval workflows'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#f5ede4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'partners' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {t.partner_title}
          </button>
          <button
            onClick={() => setActiveTab('pl')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'pl' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {lang === 'ar' ? 'قائمة الدخل (P&L)' : 'Profit & Loss (P&L)'}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'expenses' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {t.nav_expenses}
          </button>
        </div>
      </div>

      {activeTab === 'partners' && (
        <div className="space-y-4">
          {/* Equity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map(partner => (
              <div
                key={partner.id}
                className="bg-white rounded-2xl border border-[#ebdcd0] p-5 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#f2e7de] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3d2027] to-[#8b5a4b] text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {partner.name_en[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#2e191e]">
                        {lang === 'ar' ? partner.name_ar : partner.name_en}
                      </h3>
                      <p className="text-xs text-[#8c746e]">
                        {lang === 'ar' ? 'شريك مؤسس' : 'Co-Founder Partner'} • {partner.ownership_percentage}% {t.partner_share}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-[#f5ede4] text-[#8b5a4b] px-2.5 py-1 rounded-xl">
                    {partner.ownership_percentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl">
                    <span className="text-[10px] text-[#8c746e] block">{lang === 'ar' ? 'رأس المال المكتتب' : 'Initial Capital'}</span>
                    <span className="font-bold text-[#2e191e] text-sm">{partner.initial_capital.toLocaleString()} {t.currency}</span>
                  </div>

                  <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl">
                    <span className="text-[10px] text-[#8c746e] block">{lang === 'ar' ? 'حصص إضافية' : 'Add. Capital'}</span>
                    <span className="font-bold text-[#2e7d32] text-sm">+{partner.additional_contributions.toLocaleString()} {t.currency}</span>
                  </div>

                  <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl">
                    <span className="text-[10px] text-[#8c746e] block">{t.partner_drawings}</span>
                    <span className="font-bold text-[#d9534f] text-sm">-{partner.total_drawings.toLocaleString()} {t.currency}</span>
                  </div>

                  <div className="p-3 bg-[#f5ede4] border border-[#e5d6ca] rounded-xl">
                    <span className="text-[10px] text-[#8b5a4b] font-bold block">{t.partner_balance}</span>
                    <span className="font-bold text-[#352026] text-sm">{partner.current_balance.toLocaleString()} {t.currency}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedPartnerId(partner.id); setIsDrawingModalOpen(true); }}
                  className="w-full py-2 bg-[#fcfaf7] hover:bg-[#f5ede4] border border-[#e5d6ca] text-[#352026] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8b5a4b]" />
                  <span>{t.btn_new_drawing}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Partnership Governance Notice */}
          <div className="p-4 bg-[#fcf8f5] border border-[#ebdcd0] rounded-2xl text-xs text-[#715c61] leading-relaxed">
            <span className="font-bold text-[#352026] block mb-1">
              {lang === 'ar' ? 'مبدأ حوكمة أرباح الشركاء والمسحوبات:' : 'Partner Equity & Drawings Governance:'}
            </span>
            {lang === 'ar'
              ? 'الشركة مؤسسة بنسبة ملكية ٥٠٪ لم. كريم منصور و ٥٠٪ لد. ياسمين البدوي مع قابلية تعديل النسب مستقبلاً. كل مسحوب شخصي ينعكس فوراً كقيد محاسبي مدين على الحساب الجاري للشريك ويسجل في سجل الرقابة والتدقيق لمنع أي لبس مالي.'
              : 'Configurable ownership split (50/50 initial). Every owner withdrawal creates an immutable ledger entry debiting the partner current capital balance with audit trail.'}
          </div>
        </div>
      )}

      {activeTab === 'pl' && (
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#352026]">
                {lang === 'ar' ? 'قائمة الأرباح والخسائر التقديرية - أكتوبر 2026' : 'Profit & Loss Statement - October 2026'}
              </h3>
              <p className="text-[11px] text-[#8c746e]">
                {lang === 'ar' ? 'فرع الإسكندرية الرئيسي (ستانلي)' : 'Alexandria Main Branch (Stanley)'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#2e7d32] bg-[#eef8f1] px-3 py-1 rounded-xl">
              Net Profit: {plData.netOperatingProfit.toLocaleString()} {t.currency}
            </span>
          </div>

          <div className="space-y-3 text-xs max-w-2xl divide-y divide-[#f5ede4]">
            {/* Revenue */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between font-bold text-[#352026]">
                <span>1. REVENUE (المبيعات والإيرادات)</span>
                <span>{plData.totalRevenue.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Service Sales (إيراد الجلسات)</span>
                <span>{plData.grossServiceRevenue.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Retail Products (مبيعات منتجات العناية)</span>
                <span>{plData.retailProductRevenue.toLocaleString()} {t.currency}</span>
              </div>
            </div>

            {/* Direct Costs */}
            <div className="pt-3 space-y-1.5">
              <div className="flex justify-between font-bold text-[#d9534f]">
                <span>2. DIRECT COSTS (التكاليف المباشرة للجلسات)</span>
                <span>-{(plData.technicianCommissions + plData.productConsumablesCost).toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Technician Commissions (عمولات الأخصائيات المكتسبة)</span>
                <span>-{plData.technicianCommissions.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>BOM Consumables Deducted (خامات ومستهلكات الجلسات)</span>
                <span>-{plData.productConsumablesCost.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2e7d32] pt-1">
                <span>GROSS PROFIT (إجمالي مجمل الربح)</span>
                <span>{plData.grossProfit.toLocaleString()} {t.currency}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="pt-3 space-y-1.5">
              <div className="flex justify-between font-bold text-[#d9534f]">
                <span>3. OPERATING EXPENSES (المصروفات التشغيلية والعمومية)</span>
                <span>-{plData.totalOperatingExpenses.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Facility Rent (إيجار مقر ستانلي)</span>
                <span>-{plData.operatingExpenses.rent.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Utilities & Internet (كهرباء ومياه وإنترنت)</span>
                <span>-{plData.operatingExpenses.utilities.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Digital Marketing & Ads (إعلانات إنستجرام وفيسبوك)</span>
                <span>-{plData.operatingExpenses.marketing.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-[#715c61] pl-4 rtl:pr-4">
                <span>Salon Supplies & Cleaning (نظافة وضيافة)</span>
                <span>-{(plData.operatingExpenses.supplies + plData.operatingExpenses.maintenance).toLocaleString()} {t.currency}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-3">
              <div className="flex justify-between font-bold text-sm text-[#2e7d32] bg-[#f0f9f1] p-3 rounded-xl border border-[#c8e6c9]">
                <span>NET PROFIT (صافي الربح التشغيلي القابل للتوزيع):</span>
                <span>{plData.netOperatingProfit.toLocaleString()} {t.currency}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#352026]">
                {t.nav_expenses}
              </h3>
              <p className="text-[11px] text-[#8c746e]">
                {lang === 'ar' ? 'المصروفات التي تتجاوز ٢,٠٠٠ ج.م تخضع لدورة اعتماد المدير المالي' : 'Expenses over 2,000 EGP require manager approval'}
              </p>
            </div>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#e5bda3]" />
              <span>{lang === 'ar' ? 'تسجيل مصروف جديد' : 'New Expense'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-[#fcfaf7] border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'التصنيف' : 'Category'}</th>
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'البيان' : 'Description'}</th>
                  <th className="py-2.5 px-3 text-end">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'طريقة السداد' : 'Payment'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الحالة والاعتماد' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ede4]">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#fdfaf7] transition-colors">
                    <td className="py-3 px-3 text-[#8c746e]">{exp.date}</td>
                    <td className="py-3 px-3 font-semibold text-[#8b5a4b] capitalize">
                      {exp.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#2e191e]">
                      <div>{lang === 'ar' ? exp.description_ar : exp.description_en}</div>
                      <div className="text-[10px] text-[#8c746e]">{lang === 'ar' ? 'سُجل بواسطة:' : 'By:'} {exp.created_by_name}</div>
                    </td>
                    <td className="py-3 px-3 text-end font-bold text-[#d9534f]">
                      {exp.amount.toLocaleString()} {t.currency}
                    </td>
                    <td className="py-3 px-3 text-center capitalize text-[#715c61]">
                      {exp.payment_method}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {exp.status === 'approved' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eef8f1] text-[#1e8e3e]">
                          {lang === 'ar' ? `معتمد (${exp.approved_by_name})` : `Approved (${exp.approved_by_name})`}
                        </span>
                      ) : (
                        <button
                          onClick={() => onApproveExpense(exp.id, 'Dr. Yasmine El-Badawi')}
                          className="px-2.5 py-1 bg-[#3d2027] text-white rounded-lg font-bold text-[10px] hover:bg-[#2c141a]"
                        >
                          {t.btn_approve}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Partner Drawing Modal */}
      {isDrawingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {t.btn_new_drawing}
              </h3>
              <button onClick={() => setIsDrawingModalOpen(false)} className="text-[#8c746e]">✕</button>
            </div>

            <form onSubmit={handleDrawingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'الشريك' : 'Partner'}
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {lang === 'ar' ? p.name_ar : p.name_en} ({t.partner_balance}: {p.current_balance.toLocaleString()} {t.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'مبلغ المسحوبات' : 'Drawing Amount'} ({t.currency})
                </label>
                <input
                  type="number"
                  min="1"
                  value={drawingAmount}
                  onChange={e => setDrawingAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] font-bold text-base outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'البيان والملاحظات' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={drawingNotes}
                  onChange={e => setDrawingNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'مسحوبات أرباح شخصية' : 'Personal profit drawing'}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                <button
                  type="button"
                  onClick={() => setIsDrawingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4ebe2] text-[#4a2e35] font-semibold"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3d2027] text-white font-bold hover:bg-[#2c141a]"
                >
                  {t.btn_save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {lang === 'ar' ? 'تسجيل مصروف تشغيلي جديد' : 'Record Operating Expense'}
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-[#8c746e]">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#352026] block mb-1">{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
                <select
                  value={expCategory}
                  onChange={e => setExpCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                >
                  <option value="beauty_supplies">Beauty Supplies (مستلزمات تجميل)</option>
                  <option value="cleaning">Cleaning & Hospitality (نظافة وضيافة)</option>
                  <option value="maintenance">Maintenance (صيانة)</option>
                  <option value="marketing">Marketing & Ads (تسويق)</option>
                  <option value="electricity">Utilities (مرافق)</option>
                  <option value="other">Other (أخرى)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">{lang === 'ar' ? 'المبلغ' : 'Amount'} ({t.currency})</label>
                <input
                  type="number"
                  min="1"
                  value={expAmount}
                  onChange={e => setExpAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] font-bold text-base outline-none"
                  required
                />
                {expAmount > 2000 && (
                  <span className="text-[10px] text-[#ed6c02] font-semibold block mt-1">
                    * {lang === 'ar' ? 'المصروف يتجاوز ٢,٠٠٠ ج.م وسيتطلب اعتماد المدير المالي' : 'Requires Manager Approval (> 2,000 EGP)'}
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">{lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}</label>
                <select
                  value={expMethod}
                  onChange={e => setExpMethod(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                >
                  <option value="cash">{t.pos_cash} (من الخزينة)</option>
                  <option value="visa">{t.pos_visa}</option>
                  <option value="bank_transfer">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">{lang === 'ar' ? 'بيان المصروف' : 'Description'}</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder={lang === 'ar' ? 'شراء عبوات قطن ومطهرات' : 'Sanitizers and supplies'}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4ebe2] text-[#4a2e35] font-semibold"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3d2027] text-white font-bold hover:bg-[#2c141a]"
                >
                  {t.btn_save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
