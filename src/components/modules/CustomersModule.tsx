/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Tag,
  Star,
  Clock,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { Customer, Appointment } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface CustomersModuleProps {
  lang: 'ar' | 'en';
  customers: Customer[];
  appointments: Appointment[];
  currentBranchId: string;
  onAddCustomer: (data: Omit<Customer, 'id' | 'code' | 'created_at' | 'loyalty_points' | 'total_spent' | 'visits_count'>) => Customer;
  onBookAppointmentForCustomer: (customer: Customer) => void;
}

export const CustomersModule: React.FC<CustomersModuleProps> = ({
  lang,
  customers,
  appointments,
  currentBranchId,
  onAddCustomer,
  onBookAppointmentForCustomer
}) => {
  const { t, isRtl } = useI18n(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('Alexandria');
  const [sourceInput, setSourceInput] = useState<Customer['source']>('instagram');
  const [notesInput, setNotesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('VIP');

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) ||
           c.phone.includes(q) ||
           c.code.toLowerCase().includes(q) ||
           c.tags.some(tag => tag.toLowerCase().includes(q));
  });

  const customerAppointments = selectedCustomer 
    ? appointments.filter(a => a.customer_id === selectedCustomer.id)
    : [];

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    const newCust = onAddCustomer({
      full_name: nameInput.trim(),
      phone: phoneInput.trim(),
      whatsapp: phoneInput.trim(),
      address: addressInput,
      preferred_language: lang,
      source: sourceInput,
      notes: notesInput,
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      status: 'active',
      branch_id: currentBranchId
    });

    setSelectedCustomer(newCust);
    setIsAddModalOpen(false);
    setNameInput('');
    setPhoneInput('');
    setNotesInput('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_customers}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'إدارة ملفات العميلات، برنامج الولاء، رحلة الزيارات، ومصادر الاستقطاب'
              : 'Client CRM, loyalty points balance, visit journey timeline, and acquisition channels'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 text-[#e5bda3]" />
          <span>{t.btn_new_customer}</span>
        </button>
      </div>

      {/* Main Grid: Customer Directory (5 cols) & Customer Profile Details (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Customer Directory */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3.5 shadow-2xs">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-[#fbf7f4] border border-[#e5d6ca] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-[#8c746e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم، الهاتف، أو الـ Tag...' : 'Search by name, phone or tag...'}
              className="w-full text-xs bg-transparent outline-none text-[#352026]"
            />
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {filteredCustomers.map(cust => {
              const isSelected = selectedCustomer?.id === cust.id;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#f7efe8] border-[#8b5a4b] shadow-xs'
                      : 'border-[#ebdcd0] hover:bg-[#fbf7f4] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#f4ebe2] text-[#8b5a4b] font-bold text-xs flex items-center justify-center shrink-0">
                      {cust.full_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#2e191e] truncate">
                        {cust.full_name}
                      </div>
                      <div className="text-[11px] text-[#8c746e] flex items-center gap-2 mt-0.5">
                        <span>{cust.phone}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#8b5a4b]">{cust.loyalty_points} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5ede4] text-[#8b5a4b]">
                      {cust.tags[0] || 'Client'}
                    </span>
                    <span className="block text-[10px] text-[#8c746e] mt-1">
                      {cust.visits_count} {lang === 'ar' ? 'زيارات' : 'visits'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Profile & Timeline */}
        {selectedCustomer ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ebdcd0] p-5 space-y-4 shadow-2xs">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebdcd0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3d2027] to-[#8b5a4b] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedCustomer.full_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#2e191e]">
                      {selectedCustomer.full_name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded font-mono">
                      {selectedCustomer.code}
                    </span>
                  </div>
                  <div className="text-xs text-[#715c61] flex items-center gap-2 mt-0.5">
                    <span>{selectedCustomer.phone}</span>
                    <span>•</span>
                    <span>{selectedCustomer.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/2${selectedCustomer.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#eef8f1] hover:bg-[#d7f1de] text-[#1e8e3e] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => onBookAppointmentForCustomer(selectedCustomer)}
                  className="px-3.5 py-1.5 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#e5bda3]" />
                  <span>{t.btn_new_appointment}</span>
                </button>
              </div>
            </div>

            {/* Loyalty & Financial Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#8c746e] uppercase">
                  {t.pos_loyalty_points}
                </span>
                <div className="mt-1 text-lg font-bold text-[#8b5a4b]">
                  {selectedCustomer.loyalty_points}
                </div>
                <span className="text-[10px] text-[#715c61]">
                  = {selectedCustomer.loyalty_points * 2} {t.currency} {lang === 'ar' ? 'خصم متاح' : 'discount'}
                </span>
              </div>

              <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#8c746e] uppercase">
                  {lang === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}
                </span>
                <div className="mt-1 text-lg font-bold text-[#2e7d32]">
                  {selectedCustomer.total_spent.toLocaleString()} {t.currency}
                </div>
                <span className="text-[10px] text-[#715c61]">
                  {selectedCustomer.visits_count} {lang === 'ar' ? 'زيارات سابقة' : 'visits'}
                </span>
              </div>

              <div className="p-3 bg-[#fdfcfb] border border-[#ebdcd0] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#8c746e] uppercase">
                  {lang === 'ar' ? 'مصدر الاستقطاب' : 'Acquisition'}
                </span>
                <div className="mt-1 text-sm font-bold text-[#2e191e] capitalize">
                  {selectedCustomer.source}
                </div>
                <span className="text-[10px] text-[#8c746e]">
                  {selectedCustomer.preferred_language === 'ar' ? 'عربي' : 'English'}
                </span>
              </div>
            </div>

            {/* Notes & Tags */}
            <div className="p-3 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#8b5a4b] font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'الوسوم والملاحظات الخاصة بالعميلة:' : 'Tags & Preferences:'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCustomer.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              {selectedCustomer.notes && (
                <p className="text-[11px] text-[#715c61] italic pt-1">
                  "{selectedCustomer.notes}"
                </p>
              )}
            </div>

            {/* Visit History Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#352026] uppercase">
                {lang === 'ar' ? 'سجل الزيارات والجلسات المنفذة' : 'Visit & Appointment History'} ({customerAppointments.length})
              </h4>

              <div className="space-y-2">
                {customerAppointments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8c746e]">
                    {lang === 'ar' ? 'لا توجد جلسات مسجلة لهذه العميلة حتى الآن' : 'No prior appointments recorded.'}
                  </div>
                ) : (
                  customerAppointments.map(a => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-[#f2e7de] bg-[#fdfcfb] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#2e191e]">
                          {lang === 'ar' ? a.service_name_ar : a.service_name_en}
                        </div>
                        <div className="text-[11px] text-[#8c746e] flex items-center gap-2 mt-0.5">
                          <span>{a.date} at {a.start_time}</span>
                          <span>•</span>
                          <span>{a.technician_name}</span>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="font-bold text-[#2e191e]">{a.net_price} {t.currency}</span>
                        <span className={`block text-[10px] font-semibold ${
                          a.status === 'completed' ? 'text-[#2e7d32]' : 'text-[#8b5a4b]'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {t.btn_new_customer}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8c746e] hover:text-[#352026]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'اسم العميلة بالكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: نورهان الشريف' : 'e.g. Nourhan El-Sherif'}
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'رقم الهاتف (واتساب)' : 'Phone (WhatsApp)'}
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'المنطقة / العنوان' : 'Area / Address'}
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => setAddressInput(e.target.value)}
                    placeholder="Kafr Abdo, Alex"
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'مصدر العميل' : 'Source'}
                  </label>
                  <select
                    value={sourceInput}
                    onChange={e => setSourceInput(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="referral">Referral / Friends</option>
                    <option value="walk_in">Walk-in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'الوسوم (مفصولة بفواصل)' : 'Tags (comma separated)'}
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="VIP, Bride, Sensitive"
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#352026] block mb-1">
                  {lang === 'ar' ? 'ملاحظات وتفضيلات خاصة' : 'Notes & Skin Type'}
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'نوع البشرة، الألوان المفضلة...' : 'Preferences, skin type...'}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
