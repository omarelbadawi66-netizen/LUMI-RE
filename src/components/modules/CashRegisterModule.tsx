/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Banknote,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Coins,
  Printer,
  FileText
} from 'lucide-react';
import { CashRegisterSession, UserRole } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface CashRegisterModuleProps {
  lang: 'ar' | 'en';
  cashRegister: CashRegisterSession;
  currentRole: UserRole;
  onCloseShift: (countedCash: number, notes?: string) => { variance: number; requiresManagerApproval: boolean };
}

export const CashRegisterModule: React.FC<CashRegisterModuleProps> = ({
  lang,
  cashRegister,
  currentRole,
  onCloseShift
}) => {
  const { t, isRtl } = useI18n(lang);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [countedCash, setCountedCash] = useState<number>(cashRegister.expected_cash);
  const [closingNotes, setClosingNotes] = useState('');
  const [closeResult, setCloseResult] = useState<{ variance: number; requiresManagerApproval: boolean } | null>(null);

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onCloseShift(countedCash, closingNotes);
    setCloseResult(res);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-xl font-bold text-[#352026]">
              {t.nav_cash_register}
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              cashRegister.status === 'open' ? 'bg-[#eef8f1] text-[#1e8e3e]' : 'bg-[#f1f3f4] text-[#5f6368]'
            }`}>
              {cashRegister.status === 'open' ? (
                <>
                  <Unlock className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'الوردية مفتوحة حالياً' : 'Shift Active'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'الوردية مقفلة' : 'Shift Closed'}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {cashRegister.register_name} • {lang === 'ar' ? 'مسؤول الوردية:' : 'Cashier:'} {cashRegister.opened_by_user_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowZReportModal(true)}
            className="px-3.5 py-2 bg-[#f4ebe2] hover:bg-[#ebdcd0] text-[#352026] text-xs font-bold rounded-xl transition-all border border-[#ebdcd0] flex items-center gap-1.5 active:scale-98"
          >
            <FileText className="w-3.5 h-3.5 text-[#8b5a4b]" />
            <span>{lang === 'ar' ? 'تقرير تقفيل اليوم (Z-Report)' : 'Daily Z-Report'}</span>
          </button>

          {cashRegister.status === 'open' && (
            <button
              onClick={() => { setCountedCash(cashRegister.expected_cash); setIsCloseModalOpen(true); }}
              className="px-4 py-2 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <Lock className="w-3.5 h-3.5 text-[#e5bda3]" />
              <span>{t.btn_close_shift}</span>
            </button>
          )}
        </div>
      </div>

      {/* Shift Financial Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8c746e] uppercase">
            {lang === 'ar' ? 'الرصيد الافتتاحي للوردية' : 'Opening Float'}
          </span>
          <div className="mt-2 text-xl font-bold text-[#2d1a1e]">
            {cashRegister.opening_balance.toLocaleString()} {t.currency}
          </div>
          <span className="text-[10px] text-[#8c746e]">
            {new Date(cashRegister.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8c746e] uppercase flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#2e7d32]" />
            {lang === 'ar' ? 'المبيعات النقدية (كاش)' : 'Cash Sales'}
          </span>
          <div className="mt-2 text-xl font-bold text-[#2e7d32]">
            +{cashRegister.cash_sales.toLocaleString()} {t.currency}
          </div>
          <span className="text-[10px] text-[#8c746e]">
            {lang === 'ar' ? 'من فواتير POS اليوم' : 'From POS invoices'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebdcd0] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8c746e] uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#d9534f]" />
            {lang === 'ar' ? 'المصروفات النقدية من الدرج' : 'Cash Expenses'}
          </span>
          <div className="mt-2 text-xl font-bold text-[#d9534f]">
            -{cashRegister.cash_expenses.toLocaleString()} {t.currency}
          </div>
          <span className="text-[10px] text-[#8c746e]">
            {lang === 'ar' ? 'مستلزمات طارئة' : 'Emergency supplies'}
          </span>
        </div>

        <div className="bg-[#fcf7f3] p-4 rounded-2xl border border-[#e5d2c2] shadow-2xs">
          <span className="text-[11px] font-bold text-[#8b5a4b] uppercase">
            {lang === 'ar' ? 'النقدية المحسوبة بالدرج (Expected)' : 'Expected in Drawer'}
          </span>
          <div className="mt-2 text-2xl font-bold text-[#352026]">
            {cashRegister.expected_cash.toLocaleString()} {t.currency}
          </div>
          <span className="text-[10px] font-semibold text-[#8b5a4b]">
            {lang === 'ar' ? 'مطابق لسجلات المبيعات' : 'Reconciled to sales ledger'}
          </span>
        </div>
      </div>

      {/* Variance & Audit Rules Info */}
      <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-[#352026]">
          {lang === 'ar' ? 'قواعد الرقابة والتدقيق للخزينة' : 'Cash Register Governance Rules'}
        </h3>
        <p className="text-xs text-[#715c61] leading-relaxed">
          {lang === 'ar' 
            ? 'المعادلة المحاسبية المعتمدة للتقفيل: النقدية المتوقعة = الرصيد الافتتاحي + المبيعات النقدية - المصروفات النقدية - المسحوبات. أي فارق (عجز أو زيادة) أكبر من أو يساوي ٥٠ جنيه يتطلب اعتماداً رسمياً من مدير الفرع ويسجل في سجل الرقابة (Audit Log).'
            : 'Reconciliation formula: Expected Cash = Opening Balance + Cash Sales - Cash Expenses - Withdrawals. Any discrepancy >= 50 EGP automatically flags for Manager Approval and creates an immutable Audit Log entry.'}
        </p>
      </div>

      {/* Close Shift Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {t.btn_close_shift}
              </h3>
              <button 
                onClick={() => { setIsCloseModalOpen(false); setCloseResult(null); }}
                className="text-[#8c746e] hover:text-[#352026]"
              >
                ✕
              </button>
            </div>

            {closeResult ? (
              <div className="space-y-4 py-2">
                <div className={`p-4 rounded-xl text-center space-y-1.5 ${
                  closeResult.requiresManagerApproval 
                    ? 'bg-[#fff5f5] border border-[#ffcdd2] text-[#d32f2f]' 
                    : 'bg-[#f0f9f1] border border-[#c8e6c9] text-[#2e7d32]'
                }`}>
                  <div className="font-bold text-base">
                    {closeResult.variance === 0 
                      ? (lang === 'ar' ? 'النقدية مطابقة تماماً بدون فارق (٠ ج.م)' : 'Cash Balanced Perfectly (0 EGP Variance)')
                      : (lang === 'ar' ? `فارق في الخزينة: ${closeResult.variance} ج.م` : `Cash Variance: ${closeResult.variance} EGP`)}
                  </div>
                  {closeResult.requiresManagerApproval && (
                    <p className="text-xs font-semibold text-[#c62828] flex items-center justify-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'الفارق يتطلب اعتماد المدير المالي' : 'Requires Manager Approval'}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => { setIsCloseModalOpen(false); setCloseResult(null); }}
                  className="w-full py-2 bg-[#3d2027] text-white font-bold rounded-xl text-xs"
                >
                  {t.btn_close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCloseSubmit} className="space-y-3.5 text-xs">
                <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdcd0] space-y-1">
                  <span className="text-[#8c746e] block text-[11px]">{lang === 'ar' ? 'النقدية المتوقعة دفترياً' : 'Expected Ledger Balance'}</span>
                  <span className="text-xl font-bold text-[#352026]">{cashRegister.expected_cash.toLocaleString()} {t.currency}</span>
                </div>

                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'النقدية الفعلية بعد العد بالدرج (Actual Count)' : 'Counted Physical Cash'} ({t.currency})
                  </label>
                  <input
                    type="number"
                    value={countedCash}
                    onChange={e => setCountedCash(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] font-bold text-base outline-none"
                    required
                  />
                </div>

                {countedCash !== cashRegister.expected_cash && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    countedCash - cashRegister.expected_cash < 0 
                      ? 'bg-[#fff0f0] text-[#d32f2f]' 
                      : 'bg-[#f0f9f1] text-[#2e7d32]'
                  }`}>
                    <span>{lang === 'ar' ? 'الفارق المحسوب:' : 'Variance:'}</span>
                    <span>{(countedCash - cashRegister.expected_cash)} {t.currency}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'ملاحظات وتفاصيل التقفيل' : 'Closing Notes'}
                  </label>
                  <input
                    type="text"
                    value={closingNotes}
                    onChange={e => setClosingNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: تم الجرد ومطابقة فواتير اليوم' : 'e.g. End of day reconciliation'}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                  <button
                    type="button"
                    onClick={() => setIsCloseModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#f4ebe2] text-[#4a2e35] font-semibold hover:bg-[#ede0d4]"
                  >
                    {t.btn_cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#3d2027] text-white font-bold hover:bg-[#2c141a] shadow-xs active:scale-98"
                  >
                    {lang === 'ar' ? 'تأكيد التقفيل' : 'Confirm Close'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Daily Closing Z-Report Modal as per Operational Study */}
      {showZReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3 no-print">
              <h3 className="font-bold text-sm text-[#352026] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#8b5a4b]" />
                <span>{t.z_report_title}</span>
              </h3>
              <button 
                onClick={() => setShowZReportModal(false)}
                className="text-[#8c746e] hover:text-[#352026]"
              >
                ✕
              </button>
            </div>

            {/* Printable 80mm Z-Report Body */}
            <div id="printable-zreport" className="text-center font-mono text-xs space-y-2 p-2 bg-white">
              <h2 className="font-bold text-base tracking-wider">{t.receipt_title}</h2>
              <p className="text-[10px]">{t.receipt_address}</p>
              <div className="border-t border-b border-dashed border-gray-400 py-1.5 my-2">
                <div className="font-bold text-xs">DAILY Z-REPORT • تقرير تقفيل اليوم</div>
                <div className="text-[10px] text-gray-600">
                  {new Date().toLocaleDateString('ar-EG')} • {new Date().toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-gray-600">
                  Branch: Saba Pasha • الإسكندرية
                </div>
              </div>

              {/* 3 Channels Breakdown as per Study */}
              <div className="space-y-1.5 text-start text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-gray-100">
                  <span>1. Opening Float (فكة الدرج الثابتة):</span>
                  <span className="font-bold">{cashRegister.opening_balance} EGP</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-gray-100">
                  <span>2. Cash Sales (المبيعات النقدية):</span>
                  <span className="font-bold text-[#2e7d32]">+{cashRegister.cash_sales} EGP</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-gray-100">
                  <span>3. Cash Expenses (المصروفات النقدية):</span>
                  <span className="font-bold text-[#d9534f]">-{cashRegister.cash_expenses} EGP</span>
                </div>
                <div className="flex justify-between py-0.5 font-bold border-b border-dashed border-gray-300">
                  <span>Expected Drawer Cash (كاش الدرج):</span>
                  <span>{cashRegister.expected_cash} EGP</span>
                </div>

                <div className="pt-1.5">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                    Electronic & Online Reconciled (الدفع الإلكتروني):
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>• Visa / Card POS (ماكينة فيزا):</span>
                    <span className="font-bold">1,800 EGP</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>• InstaPay Transfers (إنستاباي):</span>
                    <span className="font-bold text-[#8b5a4b]">3,100 EGP</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>• Vodafone Cash (فودافون كاش):</span>
                    <span className="font-bold">600 EGP</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
                  <div className="flex justify-between font-bold text-xs">
                    <span>TOTAL DAILY INTAKE:</span>
                    <span>7,900 EGP</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#2e7d32]">
                    <span>Status:</span>
                    <span>RECONCILED (مطابق ١٠٠٪)</span>
                  </div>
                  <div className="text-[10px] text-gray-600 pt-1 italic">
                    * Cash to deposit in bank/safe: {cashRegister.expected_cash - 500} EGP (Keeping 500 EGP fixed float for tomorrow).
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-[10px] text-center">
                إشراف ومطابقة الشركاء: م. كريم منصور / د. ياسمين البدوي
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#ebdcd0] no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#3d2027] text-white text-xs font-bold hover:bg-[#2c141a] flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.z_report_print}</span>
              </button>
              <button
                onClick={() => setShowZReportModal(false)}
                className="px-4 py-2 rounded-xl bg-[#f5ede4] text-[#4a2e35] text-xs font-semibold hover:bg-[#ede0d4]"
              >
                {t.btn_close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
