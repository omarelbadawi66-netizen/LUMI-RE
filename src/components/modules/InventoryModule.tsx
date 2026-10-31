/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  History,
  Sliders,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { Product, InventoryMovement } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface InventoryModuleProps {
  lang: 'ar' | 'en';
  products: Product[];
  inventoryMovements: InventoryMovement[];
  onAdjustStock: (productId: string, newStock: number, reason: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  lang,
  products,
  inventoryMovements,
  onAdjustStock
}) => {
  const { t, isRtl } = useI18n(lang);
  const [activeTab, setActiveTab] = useState<'products' | 'movements' | 'audit'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock);

  const filteredProducts = products.filter(p => {
    if (showLowStockOnly && p.current_stock > p.min_stock) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name_en.toLowerCase().includes(q) ||
           p.name_ar.includes(q) ||
           p.sku.toLowerCase().includes(q) ||
           p.brand.toLowerCase().includes(q);
  });

  const handleOpenAdjustModal = (product: Product) => {
    setAdjustingProduct(product);
    setNewStockInput(product.current_stock);
    setAdjustmentReason('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    onAdjustStock(adjustingProduct.id, newStockInput, adjustmentReason || 'Manual physical inventory count');
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_inventory}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'متابعة أرصدة الأصناف، خصومات استهلاك الجلسات، وسجل الحركات غير القابل للتعديل'
              : 'Track product stock, automated service consumption deductions, and immutable movement logs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lowStockProducts.length > 0 && (
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showLowStockOnly
                  ? 'bg-[#d9534f] text-white shadow-xs'
                  : 'bg-[#fff0f0] border border-[#ffcdd2] text-[#d9534f]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockProducts.length} {lang === 'ar' ? 'أصناف قريبة من النفاد' : 'Low Stock Alerts'}</span>
            </button>
          )}

          <div className="bg-[#f5ede4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'products' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
              }`}
            >
              {lang === 'ar' ? 'دليل الأصناف' : 'Stock List'}
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'movements' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
              }`}
            >
              {lang === 'ar' ? 'سجل الحركات (Ledger)' : 'Movements Ledger'}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'audit' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
              }`}
            >
              {lang === 'ar' ? 'جرد الخميس (السنون والخامات)' : 'Thursday Audit'}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Search & Filter */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#ebdcd0]">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-[#fbf7f4] border border-[#e5d6ca] rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-[#8c746e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث بالاسم، الكود، أو البراند...' : 'Search product, SKU or brand...'}
                className="w-full text-xs bg-transparent outline-none text-[#352026]"
              />
            </div>

            <div className="text-xs text-[#8c746e] font-semibold">
              {filteredProducts.length} {lang === 'ar' ? 'أصناف مسجلة' : 'products'}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-[#ebdcd0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-[#fcfaf7] border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                    <th className="py-3 px-3 text-start">{t.inv_col_sku}</th>
                    <th className="py-3 px-3 text-start">{t.inv_col_name}</th>
                    <th className="py-3 px-3 text-start">{t.inv_col_category}</th>
                    <th className="py-3 px-3 text-center">{t.inv_col_stock}</th>
                    <th className="py-3 px-3 text-end">{t.inv_col_cost}</th>
                    <th className="py-3 px-3 text-end">{t.inv_col_price}</th>
                    <th className="py-3 px-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ede4]">
                  {filteredProducts.map(prod => {
                    const isLow = prod.current_stock <= prod.min_stock;

                    return (
                      <tr key={prod.id} className="hover:bg-[#fdfaf7] transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-[#8b5a4b]">
                          {prod.sku}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#2e191e]">
                          <div>{lang === 'ar' ? prod.name_ar : prod.name_en}</div>
                          <div className="text-[10px] text-[#8c746e] font-normal">
                            {prod.brand} {prod.batch_number ? `• Batch: ${prod.batch_number}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#715c61]">{prod.category}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            isLow ? 'bg-[#ffedec] text-[#d32f2f] animate-pulse' : 'bg-[#eef8f1] text-[#1e8e3e]'
                          }`}>
                            {isLow && <AlertTriangle className="w-3 h-3" />}
                            <span>{prod.current_stock} {prod.unit}</span>
                          </span>
                          <span className="block text-[10px] text-[#8c746e] mt-0.5">
                            Min: {prod.min_stock} {prod.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-end text-[#715c61]">{prod.purchase_cost} {t.currency}</td>
                        <td className="py-3 px-3 text-end font-bold text-[#2e191e]">{prod.selling_price} {t.currency}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenAdjustModal(prod)}
                            className="px-2.5 py-1 rounded-lg bg-[#f5ede4] hover:bg-[#ede0d4] text-[#4a2e35] text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'تعديل جرد' : 'Adjust Stock'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Immutable Movement Ledger Tab */
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#352026] flex items-center gap-2">
              <History className="w-4 h-4 text-[#8b5a4b]" />
              <span>{lang === 'ar' ? 'سجل حركات المخزون غير القابل للتعديل' : 'Immutable Stock Movement History'}</span>
            </h3>
            <span className="text-xs text-[#8c746e]">
              {inventoryMovements.length} {lang === 'ar' ? 'حركة مسجلة' : 'movements'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'الوقت' : 'Timestamp'}</th>
                  <th className="py-2.5 px-3 text-start">{t.inv_col_name}</th>
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'نوع الحركة' : 'Type'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'التغيير' : 'Change'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الرصيد بعد' : 'New Stock'}</th>
                  <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ede4]">
                {inventoryMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#8c746e]">
                      {lang === 'ar' ? 'لا توجد حركات مخزون سابقة' : 'No movements logged yet.'}
                    </td>
                  </tr>
                ) : (
                  inventoryMovements.map(mov => (
                    <tr key={mov.id} className="hover:bg-[#fdfaf7] transition-colors">
                      <td className="py-3 px-3 text-[#8c746e] text-[11px]">
                        {new Date(mov.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#2e191e]">
                        {lang === 'ar' ? mov.product_name_ar : mov.product_name_en}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f5ede4] text-[#8b5a4b]">
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={mov.quantity_change < 0 ? 'text-[#d32f2f]' : 'text-[#2e7d32]'}>
                          {mov.quantity_change > 0 ? `+${mov.quantity_change}` : mov.quantity_change}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-[#2e191e]">
                        {mov.new_stock}
                      </td>
                      <td className="py-3 px-3 text-[#715c61] text-[11px]">
                        {mov.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thursday Weekly Consumables Audit as per Operational Study */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#3d2027] to-[#5b323c] text-white p-5 rounded-2xl border border-[#4d2831] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#e5bda3]/25 text-[#ffdcc7] px-2.5 py-0.5 rounded-full">
                  {lang === 'ar' ? 'نظام رقابة الهدر ومنع التسريب' : 'Zero-Wastage Governance'}
                </span>
                <span className="text-xs text-[#e8ded6]">
                  {lang === 'ar' ? 'خميس كل أسبوع' : 'Every Thursday'}
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold mt-1 text-white">
                {t.audit_weekly_title}
              </h3>
              <p className="text-xs text-[#eedfd8] max-w-xl">
                {t.audit_weekly_desc}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#2e7d32] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'الجرد مطابق ١٠٠٪' : '100% Balanced'}</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs text-[#352026] uppercase">
              {lang === 'ar' ? 'جدول مطابقة خامات الديرمابن والرموش مع الجلسات المنفذة' : 'Consumables vs Completed Sessions Audit Table'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                    <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'الصنف الخاضع للرقابة' : 'Monitored Item'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الرصيد الافتتاحي' : 'Opening'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الجلسات المنفذة بالسيستم' : 'System Sessions'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الرصيد المتوقع دفترياً' : 'Expected Stock'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'العد الفعلي بالدرج' : 'Physical Count'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الفارق / الهدر' : 'Discrepancy'}</th>
                    <th className="py-2.5 px-3 text-end">{lang === 'ar' ? 'حالة المطابقة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ede4]">
                  <tr className="hover:bg-[#fdfaf7]">
                    <td className="py-3 px-3 font-bold text-[#2e191e]">
                      {lang === 'ar' ? 'سنون ديرمابن معقمة ومغلفة (12/36 Pin)' : 'Sterile Dermapen Cartridges (12/36 Pin)'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">50 {lang === 'ar' ? 'سن' : 'pcs'}</td>
                    <td className="py-3 px-3 text-center text-[#8b5a4b] font-bold">6 {lang === 'ar' ? 'جلسات' : 'sessions'}</td>
                    <td className="py-3 px-3 text-center font-bold">44 {lang === 'ar' ? 'سن' : 'pcs'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">44 {lang === 'ar' ? 'سن' : 'pcs'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">0 ({lang === 'ar' ? 'لا يوجد هدر' : 'Zero Waste'})</td>
                    <td className="py-3 px-3 text-end">
                      <span className="text-[10px] font-bold bg-[#eef8f1] text-[#1e8e3e] px-2.5 py-0.5 rounded-full">
                        {lang === 'ar' ? 'مطابق تماماً' : 'Matched'}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#fdfaf7]">
                    <td className="py-3 px-3 font-bold text-[#2e191e]">
                      {lang === 'ar' ? 'أمبولات سيروم ميزوثيرابي نضارة 10ml' : 'Meso-Cocktail Rejuvenation Serum 10ml'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">20 {lang === 'ar' ? 'عبوة' : 'vials'}</td>
                    <td className="py-3 px-3 text-center text-[#8b5a4b] font-bold">2 {lang === 'ar' ? 'عبوات' : 'vials'}</td>
                    <td className="py-3 px-3 text-center font-bold">18 {lang === 'ar' ? 'عبوة' : 'vials'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">18 {lang === 'ar' ? 'عبوة' : 'vials'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">0 ({lang === 'ar' ? 'لا يوجد هدر' : 'Zero Waste'})</td>
                    <td className="py-3 px-3 text-end">
                      <span className="text-[10px] font-bold bg-[#eef8f1] text-[#1e8e3e] px-2.5 py-0.5 rounded-full">
                        {lang === 'ar' ? 'مطابق تماماً' : 'Matched'}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#fdfaf7]">
                    <td className="py-3 px-3 font-bold text-[#2e191e]">
                      {lang === 'ar' ? 'رموش حريرية طبيعية 3D (زوج)' : 'Silk 3D Mink Lashes (Pair)'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">15 {lang === 'ar' ? 'زوج' : 'pairs'}</td>
                    <td className="py-3 px-3 text-center text-[#8b5a4b] font-bold">7 {lang === 'ar' ? 'جلسات' : 'sessions'}</td>
                    <td className="py-3 px-3 text-center font-bold">8 {lang === 'ar' ? 'أزواج' : 'pairs'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">8 {lang === 'ar' ? 'أزواج' : 'pairs'}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e7d32]">0 ({lang === 'ar' ? 'لا يوجد هدر' : 'Zero Waste'})</td>
                    <td className="py-3 px-3 text-end">
                      <span className="text-[10px] font-bold bg-[#fff0f0] text-[#d32f2f] px-2.5 py-0.5 rounded-full">
                        {lang === 'ar' ? 'طلب شراء فوري' : 'Reorder Needed'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#715c61]">
                {lang === 'ar' ? 'اعتماد ومطابقة الشركاء: م. كريم منصور / د. ياسمين البدوي' : 'Partner Sign-off: Eng. Karim Mansour / Dr. Yasmine El-Badawi'}
              </span>
              <span className="font-bold text-[#8b5a4b]">
                {lang === 'ar' ? 'فرع الإسكندرية - سابا باشا الرئيسي' : 'Alexandria - Saba Pasha Main Branch'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {lang === 'ar' ? 'تعديل رصيد المخزون (جرد فعلي)' : 'Adjust Physical Stock'}
              </h3>
              <button 
                onClick={() => setAdjustingProduct(null)}
                className="text-[#8c746e] hover:text-[#352026]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3.5 text-xs">
              <div className="bg-[#fcfaf7] p-3 rounded-xl border border-[#ebdcd0] space-y-1">
                <div className="font-bold text-sm text-[#352026]">
                  {lang === 'ar' ? adjustingProduct.name_ar : adjustingProduct.name_en}
                </div>
                <div className="text-[11px] text-[#8c746e]">
                  {adjustingProduct.sku} • {adjustingProduct.brand} • {lang === 'ar' ? 'الرصيد الحالي:' : 'Current Stock:'} {adjustingProduct.current_stock} {adjustingProduct.unit}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'الرصيد الفعلي الجديد بعد الجرد' : 'New Physical Stock Count'} ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockInput}
                  onChange={e => setNewStockInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] font-bold text-base outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'سبب التعديل (إلزامي للرقابة والتدقيق)' : 'Reason for Adjustment (Audit Required)'}
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: جرد شهري دوري / تالف أثناء النقل' : 'e.g. Monthly physical audit count'}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-[#f4ebe2] text-[#4a2e35] font-semibold hover:bg-[#ede0d4]"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3d2027] text-white font-bold hover:bg-[#2c141a] shadow-xs active:scale-98"
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
