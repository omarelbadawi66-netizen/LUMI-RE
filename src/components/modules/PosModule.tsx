/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Package,
  Printer,
  CheckCircle2,
  AlertCircle,
  Coins,
  Receipt,
  User,
  ShoppingBag
} from 'lucide-react';
import { Customer, Service, Product, SaleItem, PaymentSplit, PaymentMethod, SaleInvoice } from '../../types/erp';
import { useI18n } from '../../i18n/translations';
import { processPosSaleCalculation } from '../../erp/engine/rules';

interface PosModuleProps {
  lang: 'ar' | 'en';
  customers: Customer[];
  services: Service[];
  products: Product[];
  currentBranchId: string;
  onCompleteSale: (saleData: {
    customerId: string;
    customerName: string;
    branchId: string;
    cashierName: string;
    items: SaleItem[];
    discount: number;
    payments: PaymentSplit[];
    pointsToRedeem?: number;
    appointmentId?: string;
  }) => { success: boolean; invoice?: SaleInvoice; error?: string };
}

export const PosModule: React.FC<PosModuleProps> = ({
  lang,
  customers,
  services,
  products,
  currentBranchId,
  onCompleteSale
}) => {
  const { t, isRtl } = useI18n(lang);

  const [activeCatalogTab, setActiveCatalogTab] = useState<'services' | 'products'>('services');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Split payment state
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [visaAmount, setVisaAmount] = useState<number>(0);
  const [instaPayAmount, setInstaPayAmount] = useState<number>(0);
  const [walletAmount, setWalletAmount] = useState<number>(0);

  const [lastInvoice, setLastInvoice] = useState<SaleInvoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Add Service to Cart
  const handleAddService = (service: Service) => {
    setPosError(null);
    const existingIndex = cartItems.findIndex(i => i.item_id === service.id && i.type === 'service');
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCartItems(updated);
    } else {
      const newItem: SaleItem = {
        id: `sale-item-${Date.now()}`,
        type: 'service',
        item_id: service.id,
        name_en: service.name_en,
        name_ar: service.name_ar,
        quantity: 1,
        unit_price: service.price,
        discount: 0,
        total: service.price
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Add Product to Cart
  const handleAddProduct = (product: Product) => {
    setPosError(null);
    if (product.current_stock <= 0) {
      setPosError(lang === 'ar' ? `المنتج ${product.name_ar} نافد من المخزون!` : `Product ${product.name_en} is out of stock!`);
      return;
    }

    const existingIndex = cartItems.findIndex(i => i.item_id === product.id && i.type === 'product');
    if (existingIndex > -1) {
      if (cartItems[existingIndex].quantity >= product.current_stock) {
        setPosError(lang === 'ar' ? 'الكمية المطلوبة تتجاوز المخزون المتاح!' : 'Requested quantity exceeds available stock!');
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCartItems(updated);
    } else {
      const newItem: SaleItem = {
        id: `sale-item-${Date.now()}`,
        type: 'product',
        item_id: product.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        quantity: 1,
        unit_price: product.selling_price,
        discount: 0,
        total: product.selling_price
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].total = newQty * updated[index].unit_price;
    }
    setCartItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  // Compile active split payments
  const payments: PaymentSplit[] = [];
  if (cashAmount > 0) payments.push({ method: 'cash', amount: cashAmount });
  if (visaAmount > 0) payments.push({ method: 'visa', amount: visaAmount });
  if (instaPayAmount > 0) payments.push({ method: 'instapay', amount: instaPayAmount });
  if (walletAmount > 0) payments.push({ method: 'vodafone_cash', amount: walletAmount });

  // Real-time calculation
  const calc = processPosSaleCalculation({
    items: cartItems,
    discountAmount,
    pointsToRedeem,
    payments
  });

  // Quick fill remaining balance to cash
  const handlePayFullCash = () => {
    setVisaAmount(0);
    setInstaPayAmount(0);
    setWalletAmount(0);
    setCashAmount(calc.total);
  };

  // Quick fill remaining balance to Card
  const handlePayFullCard = () => {
    setCashAmount(0);
    setInstaPayAmount(0);
    setWalletAmount(0);
    setVisaAmount(calc.total);
  };

  // Checkout submission
  const handleCheckout = () => {
    setPosError(null);
    if (cartItems.length === 0) {
      setPosError(lang === 'ar' ? 'سلة المبيعات فارغة!' : 'Cart is empty!');
      return;
    }

    if (!selectedCustomer) {
      setPosError(lang === 'ar' ? 'يرجى تحديد العميلة' : 'Please select customer');
      return;
    }

    const res = onCompleteSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.full_name,
      branchId: currentBranchId,
      cashierName: 'Salma Ezzat',
      items: cartItems,
      discount: discountAmount,
      pointsToRedeem,
      payments
    });

    if (!res.success) {
      setPosError(res.error || 'Sale processing failed');
    } else if (res.invoice) {
      setLastInvoice(res.invoice);
      setShowReceiptModal(true);
      // Reset POS cart
      setCartItems([]);
      setDiscountAmount(0);
      setPointsToRedeem(0);
      setCashAmount(0);
      setVisaAmount(0);
      setInstaPayAmount(0);
      setWalletAmount(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: Product & Service Catalog (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-4 shadow-2xs">
        {/* Catalog Tabs & Search */}
        <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCatalogTab('services')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCatalogTab === 'services'
                  ? 'bg-[#3d2027] text-white shadow-xs'
                  : 'bg-[#f5ede4] text-[#4a2e35] hover:bg-[#ede0d4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e5bda3]" />
              <span>{lang === 'ar' ? 'جلسات التجميل' : 'Beauty Services'} ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveCatalogTab('products')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCatalogTab === 'products'
                  ? 'bg-[#3d2027] text-white shadow-xs'
                  : 'bg-[#f5ede4] text-[#4a2e35] hover:bg-[#ede0d4]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#e5bda3]" />
              <span>{lang === 'ar' ? 'منتجات العناية والمبيعات' : 'Retail Products'} ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[620px] overflow-y-auto p-1">
          {activeCatalogTab === 'services' ? (
            services.map(s => (
              <button
                key={s.id}
                onClick={() => handleAddService(s)}
                className="p-3 rounded-xl border border-[#ebdcd0] hover:border-[#8b5a4b] bg-[#fdfcfb] hover:bg-[#fbf5f0] text-start transition-all flex flex-col justify-between group active:scale-98"
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#8b5a4b] tracking-wider">
                    {s.duration_minutes}m • {s.category}
                  </div>
                  <div className="font-bold text-xs text-[#2e191e] mt-1 group-hover:text-[#8b5a4b]">
                    {lang === 'ar' ? s.name_ar : s.name_en}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#f2e7de] pt-2">
                  <span className="text-xs font-bold text-[#352026]">{s.price} {t.currency}</span>
                  <span className="text-[10px] bg-[#f5ede4] text-[#8b5a4b] px-1.5 py-0.5 rounded font-bold">
                    + {t.btn_add}
                  </span>
                </div>
              </button>
            ))
          ) : (
            products.map(p => (
              <button
                key={p.id}
                onClick={() => handleAddProduct(p)}
                disabled={p.current_stock <= 0}
                className={`p-3 rounded-xl border text-start transition-all flex flex-col justify-between group active:scale-98 ${
                  p.current_stock <= 0
                    ? 'opacity-50 border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-[#ebdcd0] hover:border-[#8b5a4b] bg-[#fdfcfb] hover:bg-[#fbf5f0]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8c746e]">
                    <span>{p.brand}</span>
                    <span className={p.current_stock <= p.min_stock ? 'text-[#d32f2f]' : 'text-[#2e7d32]'}>
                      {p.current_stock} {p.unit}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#2e191e] mt-1 group-hover:text-[#8b5a4b] line-clamp-2">
                    {lang === 'ar' ? p.name_ar : p.name_en}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#f2e7de] pt-2">
                  <span className="text-xs font-bold text-[#352026]">{p.selling_price} {t.currency}</span>
                  <span className="text-[10px] bg-[#f5ede4] text-[#8b5a4b] px-1.5 py-0.5 rounded font-bold">
                    + {t.btn_add}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Cart, Customer, Split Payments & Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-4 shadow-2xs">
        {/* Customer Selection & Loyalty Points Info */}
        <div className="p-3 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8c746e] uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {t.pos_client_selection}
            </span>
            {selectedCustomer && (
              <span className="text-[10px] font-bold bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded-full">
                {selectedCustomer.loyalty_points} {t.pos_loyalty_points}
              </span>
            )}
          </div>

          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full p-2 text-xs font-medium rounded-lg border border-[#e3d4c6] bg-white text-[#352026] outline-none"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.phone}) - {c.loyalty_points} pts
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#352026] uppercase">
              {t.pos_cart} ({cartItems.length})
            </span>
            {cartItems.length > 0 && (
              <button 
                onClick={() => setCartItems([])}
                className="text-[11px] text-[#d9534f] hover:underline"
              >
                {lang === 'ar' ? 'تفريغ السلة' : 'Clear cart'}
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-[#f5ede4] border border-[#ebdcd0] rounded-xl p-2 bg-[#fdfcfb]">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9f8a84]">
                {t.pos_empty_cart}
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-[#2e191e] truncate">
                      {lang === 'ar' ? item.name_ar : item.name_en}
                    </div>
                    <div className="text-[11px] text-[#8c746e]">
                      {item.unit_price} {t.currency} × {item.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-[#f5ede4] rounded-lg p-0.5">
                      <button 
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="p-1 rounded text-[#4a2e35] hover:bg-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="p-1 rounded text-[#4a2e35] hover:bg-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-16 text-end font-bold text-[#2e191e]">
                      {item.total} {t.currency}
                    </span>

                    <button 
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-[#8c746e] hover:text-[#d32f2f]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discounts & Points Redemption */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="font-semibold text-[#6e595e] block mb-1">
              {t.pos_discount} ({t.currency})
            </label>
            <input
              type="number"
              min="0"
              value={discountAmount}
              onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 rounded-lg border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6e595e] block mb-1">
              {t.pos_redeem_points} ({pointsToRedeem * 2} {t.currency})
            </label>
            <input
              type="number"
              min="0"
              max={selectedCustomer?.loyalty_points || 0}
              value={pointsToRedeem}
              onChange={e => setPointsToRedeem(Math.min(selectedCustomer?.loyalty_points || 0, Math.max(0, Number(e.target.value))))}
              className="w-full p-2 rounded-lg border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none text-xs"
            />
          </div>
        </div>

        {/* Split Payments Entry */}
        <div className="space-y-2 border-t border-[#ebdcd0] pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#352026] uppercase">
              {t.pos_payments}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePayFullCash}
                className="text-[10px] font-bold bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded hover:bg-[#ede0d4]"
              >
                100% {t.pos_cash}
              </button>
              <button
                type="button"
                onClick={handlePayFullCard}
                className="text-[10px] font-bold bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded hover:bg-[#ede0d4]"
              >
                100% {t.pos_visa}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Cash */}
            <div className="p-2 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl">
              <span className="block font-medium text-[#715c61] mb-1">{t.pos_cash}</span>
              <input
                type="number"
                min="0"
                value={cashAmount}
                onChange={e => setCashAmount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg border border-[#ded3c8] bg-white text-[#352026] font-bold outline-none"
              />
            </div>

            {/* Visa / Card */}
            <div className="p-2 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl">
              <span className="block font-medium text-[#715c61] mb-1">{t.pos_visa}</span>
              <input
                type="number"
                min="0"
                value={visaAmount}
                onChange={e => setVisaAmount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg border border-[#ded3c8] bg-white text-[#352026] font-bold outline-none"
              />
            </div>

            {/* InstaPay */}
            <div className="p-2 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl">
              <span className="block font-medium text-[#715c61] mb-1">{t.pos_instapay}</span>
              <input
                type="number"
                min="0"
                value={instaPayAmount}
                onChange={e => setInstaPayAmount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg border border-[#ded3c8] bg-white text-[#352026] font-bold outline-none"
              />
            </div>

            {/* Mobile Wallet */}
            <div className="p-2 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl">
              <span className="block font-medium text-[#715c61] mb-1">{t.pos_wallet}</span>
              <input
                type="number"
                min="0"
                value={walletAmount}
                onChange={e => setWalletAmount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg border border-[#ded3c8] bg-white text-[#352026] font-bold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="space-y-1.5 bg-[#f5ede4] p-3 rounded-xl text-xs text-[#4a2e35]">
          <div className="flex justify-between">
            <span>{t.pos_subtotal}</span>
            <span>{calc.subtotal} {t.currency}</span>
          </div>
          {(calc.discount > 0 || calc.pointsDiscount > 0) && (
            <div className="flex justify-between text-[#d9534f] font-semibold">
              <span>{lang === 'ar' ? 'إجمالي الخصم واستبدال النقاط' : 'Total Discounts'}</span>
              <span>-{(calc.discount + calc.pointsDiscount)} {t.currency}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-[#2d1a1e] pt-1 border-t border-[#ded2c6]">
            <span>{t.pos_total}</span>
            <span>{calc.total} {t.currency}</span>
          </div>

          <div className="flex justify-between text-[11px] pt-1">
            <span>{t.pos_paid}</span>
            <span className="font-bold">{calc.paidAmount} {t.currency}</span>
          </div>

          {calc.remainingBalance > 0 && (
            <div className="flex justify-between font-bold text-[#d9534f]">
              <span>{t.pos_remaining}</span>
              <span>{calc.remainingBalance} {t.currency}</span>
            </div>
          )}

          {calc.changeAmount > 0 && (
            <div className="flex justify-between font-bold text-[#2e7d32]">
              <span>{t.pos_change}</span>
              <span>{calc.changeAmount} {t.currency}</span>
            </div>
          )}
        </div>

        {posError && (
          <div className="p-2.5 bg-[#fff0f0] border border-[#ffcdd2] rounded-xl text-xs text-[#d32f2f] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{posError}</span>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || !calc.isFullyPaid}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
            cartItems.length > 0 && calc.isFullyPaid
              ? 'bg-[#3d2027] hover:bg-[#2c141a] text-white cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#e5bda3]" />
          <span>{t.pos_complete_payment} ({calc.total} {t.currency})</span>
        </button>
      </div>

      {/* Thermal Printable Receipt Modal */}
      {showReceiptModal && lastInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3 no-print">
              <h3 className="font-bold text-sm text-[#352026] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                <span>{lang === 'ar' ? 'تم إصدار الفاتورة بنجاح' : 'Invoice Issued Successfully'}</span>
              </h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-[#8c746e] hover:text-[#352026]"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div id="printable-receipt" className="text-center font-mono text-xs space-y-2 p-2 bg-white">
              <h2 className="font-bold text-base tracking-wider">{t.receipt_title}</h2>
              <p className="text-[10px]">{t.receipt_address}</p>
              <p className="text-[10px]">{t.receipt_phone}</p>
              <p className="text-[10px]">{t.receipt_tax_no}</p>
              <div className="border-t border-b border-dashed border-gray-400 py-1 my-2">
                <div className="flex justify-between text-[11px]">
                  <span>Inv: {lastInvoice.invoice_number}</span>
                  <span>{new Date(lastInvoice.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Client: {lastInvoice.customer_name}</span>
                  <span>Cashier: {lastInvoice.cashier_name}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 text-start">
                {lastInvoice.items.map(it => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{it.name_en} x{it.quantity}</span>
                    <span>{it.total} EGP</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-end">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL:</span>
                  <span>{lastInvoice.total} EGP</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Paid:</span>
                  <span>{lastInvoice.paid_amount} EGP</span>
                </div>
                {lastInvoice.change_amount > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span>Change:</span>
                    <span>{lastInvoice.change_amount} EGP</span>
                  </div>
                )}
                <div className="text-[10px] text-center pt-2 italic">
                  Points Earned: +{lastInvoice.points_earned} pts
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-[10px] text-center">
                {t.receipt_footer}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#ebdcd0] no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#3d2027] text-white text-xs font-bold hover:bg-[#2c141a] flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.btn_print}</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
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
