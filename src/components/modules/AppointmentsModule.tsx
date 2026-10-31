/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Sparkles,
  MapPin,
  CheckCircle2,
  Play,
  Check,
  CreditCard,
  XCircle,
  AlertCircle,
  Filter,
  CheckSquare,
  MessageCircle
} from 'lucide-react';
import { Appointment, Customer, Employee, Service } from '../../types/erp';
import { useI18n } from '../../i18n/translations';
import { minutesToTimeString, timeStringToMinutes } from '../../erp/engine/rules';

interface AppointmentsModuleProps {
  lang: 'ar' | 'en';
  appointments: Appointment[];
  customers: Customer[];
  employees: Employee[];
  services: Service[];
  currentBranchId: string;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
  onCreateAppointment: (data: Omit<Appointment, 'id' | 'code' | 'created_at'>) => { success: boolean; error?: string };
  onOpenPosForAppointment: (appointment: Appointment) => void;
  onOpenNewCustomerModal: () => void;
}

export const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({
  lang,
  appointments,
  customers,
  employees,
  services,
  currentBranchId,
  onUpdateStatus,
  onCreateAppointment,
  onOpenPosForAppointment,
  onOpenNewCustomerModal
}) => {
  const { t, isRtl } = useI18n(lang);
  const [selectedDate, setSelectedDate] = useState('2026-10-30');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State for New Booking
  const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || '');
  const [formServiceId, setFormServiceId] = useState(services[0]?.id || '');
  const [formTechnicianId, setFormTechnicianId] = useState(employees[0]?.id || '');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formDate, setFormDate] = useState('2026-10-30');
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a => {
    if (a.date !== selectedDate) return false;
    if (selectedTech !== 'all' && a.technician_id !== selectedTech) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    return true;
  });

  const technicians = employees.filter(e => e.employment_type === 'technician');

  // Submit New Booking
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const customer = customers.find(c => c.id === formCustomerId);
    const service = services.find(s => s.id === formServiceId);
    const technician = formTechnicianId !== 'none' ? employees.find(e => e.id === formTechnicianId) : null;

    if (!customer || !service) {
      setFormError(lang === 'ar' ? 'يرجى اختيار العميلة والخدمة' : 'Please select customer and service');
      return;
    }

    const techName = technician ? technician.full_name : (lang === 'ar' ? 'إدارة المركز (تشغيل مباشر)' : 'Direct Center Operation');

    const startMin = timeStringToMinutes(formStartTime);
    const endMin = startMin + service.duration_minutes;
    const endTime = minutesToTimeString(endMin);

    const price = service.price;
    const netPrice = Math.max(0, price - formDiscount);

    const res = onCreateAppointment({
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      branch_id: currentBranchId,
      service_id: service.id,
      service_name_en: service.name_en,
      service_name_ar: service.name_ar,
      technician_id: technician ? technician.id : undefined,
      technician_name: techName,
      date: formDate,
      start_time: formStartTime,
      end_time: endTime,
      duration_minutes: service.duration_minutes,
      price,
      discount: formDiscount,
      net_price: netPrice,
      status: 'confirmed',
      payment_status: 'pending',
      notes: formNotes
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to create booking');
    } else {
      setIsNewModalOpen(false);
      setFormNotes('');
      setFormDiscount(0);
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_calendar}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar' ? 'إدارة المواعيد اليومية، منع التعارض، ومتابعة مراحل الجلسة' : 'Manage daily schedule, prevent double-bookings, and track session status'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs bg-[#fbf7f4] border border-[#e5d6ca] rounded-xl px-3 py-2 text-[#352026] font-medium outline-none"
          />

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3.5 py-2 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-[#e5bda3]" />
            <span>{t.btn_new_appointment}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#ebdcd0]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#8c746e] uppercase flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {t.btn_filter}:
          </span>

          {/* Technician Filter */}
          <select
            value={selectedTech}
            onChange={e => setSelectedTech(e.target.value)}
            className="text-xs bg-[#fbf7f4] border border-[#e5d6ca] rounded-lg px-2.5 py-1 text-[#352026] outline-none"
          >
            <option value="all">{lang === 'ar' ? 'جميع الأخصائيات' : 'All Technicians'}</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.full_name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs bg-[#fbf7f4] border border-[#e5d6ca] rounded-lg px-2.5 py-1 text-[#352026] outline-none"
          >
            <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="confirmed">{t.status_confirmed}</option>
            <option value="checked_in">{t.status_checked_in}</option>
            <option value="in_service">{t.status_in_service}</option>
            <option value="completed">{t.status_completed}</option>
            <option value="cancelled">{t.status_cancelled}</option>
          </select>
        </div>

        <div className="text-xs text-[#8c746e] font-medium">
          {filteredAppointments.length} {lang === 'ar' ? 'موعد معروض' : 'appointments shown'}
        </div>
      </div>

      {/* Appointments List / Grid */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ebdcd0] p-12 text-center text-xs text-[#8c746e] space-y-3">
            <CalendarIcon className="w-10 h-10 text-[#d8c2b0] mx-auto" />
            <p className="font-semibold text-sm text-[#352026]">
              {lang === 'ar' ? 'لا توجد مواعيد مسجلة لهذا التاريخ أو الفلتر' : 'No appointments scheduled for this date or filter'}
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-[#8b5a4b] text-white rounded-xl font-bold text-xs hover:bg-[#724538]"
            >
              {t.btn_new_appointment}
            </button>
          </div>
        ) : (
          filteredAppointments.map(appt => (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border transition-all p-4.5 shadow-2xs hover:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                appt.status === 'in_service' ? 'border-[#3880ff] bg-[#f8fbff]' : 'border-[#ebdcd0]'
              }`}
            >
              {/* Left Column: Time & Client & Service */}
              <div className="flex items-start gap-4">
                <div className="w-16 text-center py-2 px-1 rounded-xl bg-[#f5ede4] text-[#4a2e35] shrink-0 border border-[#e8ded4]">
                  <span className="block text-sm font-bold">{appt.start_time}</span>
                  <span className="block text-[10px] text-[#856b64]">{appt.end_time}</span>
                  <span className="inline-block mt-1 text-[9px] font-bold bg-white text-[#8b5a4b] px-1 rounded">
                    {appt.duration_minutes}m
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2d1a1e]">{appt.customer_name}</span>
                    <span className="text-[11px] text-[#8c746e] font-mono">({appt.code})</span>
                    <span className="text-[11px] text-[#8c746e]">{appt.customer_phone}</span>
                  </div>

                  <div className="text-xs font-semibold text-[#8b5a4b] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? appt.service_name_ar : appt.service_name_en}</span>
                  </div>

                  <div className="text-[11px] text-[#715c61] flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#a87458]" />
                      <span>{appt.technician_name}</span>
                    </span>
                    {appt.room_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#a87458]" />
                        <span>{appt.room_name}</span>
                      </span>
                    )}
                  </div>

                  {appt.notes && (
                    <div className="text-[11px] text-[#8a7277] italic bg-[#faf5f0] px-2 py-0.5 rounded-md inline-block">
                      "{appt.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Workflow Actions */}
              <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#f2e7de]">
                <div className="text-start lg:text-end">
                  <div className="text-sm font-bold text-[#2d1a1e]">
                    {appt.net_price} {t.currency}
                    {appt.discount > 0 && (
                      <span className="text-[11px] text-[#d9534f] line-through ml-1 font-normal">
                        {appt.price} {t.currency}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-bold ${
                    appt.payment_status === 'paid' ? 'text-[#2e7d32]' : 'text-[#ed6c02]'
                  }`}>
                    {appt.payment_status === 'paid' ? (lang === 'ar' ? 'تم الدفع بالكامل' : 'Paid in Full') : (lang === 'ar' ? 'بانتظار السداد' : 'Payment Pending')}
                  </div>
                  {appt.deposit_amount ? (
                    <span className="text-[10px] block font-bold text-[#8b5a4b] mt-0.5">
                      {lang === 'ar' ? `عربون: ${appt.deposit_amount} ج.م (${appt.deposit_method?.toUpperCase()})` : `Deposit: ${appt.deposit_amount} EGP (${appt.deposit_method})`}
                    </span>
                  ) : null}
                </div>

                {/* Workflow Status Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* WhatsApp Deposit / Confirmation Link */}
                  <a
                    href={`https://wa.me/2${appt.customer_phone}?text=${encodeURIComponent(
                      lang === 'ar'
                        ? `أهلاً بكِ في مركز لوميير للتجميل (فرع سابا باشا)! موعدكِ مسجل يوم ${appt.date} الساعة ${appt.start_time} لجلسة ${appt.service_name_ar}. لتأكيد الحجز نرجو تحويل العربون (إنستاباي على: lumiere.alex@instapay). يسعدنا تشريفكِ!`
                        : `Hello from Lumière Beauty Center (Saba Pasha Branch)! Your booking is on ${appt.date} at ${appt.start_time} for ${appt.service_name_en}. To confirm, please transfer deposit via InstaPay: lumiere.alex@instapay.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-[#eef8f1] hover:bg-[#d7f1de] text-[#1e8e3e] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    title={lang === 'ar' ? 'مراسلة عبر واتساب لتأكيد الحجز والعربون' : 'WhatsApp Deposit Reminder'}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateStatus(appt.id, 'checked_in')}
                      className="px-2.5 py-1.5 bg-[#f5ede4] hover:bg-[#ede0d4] text-[#4a2e35] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      title={t.btn_check_in}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8b5a4b]" />
                      <span>{t.btn_check_in}</span>
                    </button>
                  )}

                  {appt.status === 'checked_in' && (
                    <button
                      onClick={() => onUpdateStatus(appt.id, 'in_service')}
                      className="px-2.5 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1967d2] text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.btn_start_service}</span>
                    </button>
                  )}

                  {appt.status === 'in_service' && (
                    <button
                      onClick={() => onUpdateStatus(appt.id, 'completed')}
                      className="px-3 py-1.5 bg-[#2e7d32] hover:bg-[#256628] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-xs active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.btn_complete_service}</span>
                    </button>
                  )}

                  {/* POS Checkout Shortcut if unpaid */}
                  {appt.payment_status !== 'paid' && (
                    <button
                      onClick={() => onOpenPosForAppointment(appt)}
                      className="px-2.5 py-1.5 bg-[#8b5a4b] hover:bg-[#724538] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                      title={t.btn_open_pos}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t.btn_open_pos}</span>
                    </button>
                  )}

                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <button
                      onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                      className="p-1.5 rounded-lg text-[#9e8b86] hover:text-[#d32f2f] hover:bg-[#ffedec] transition-colors"
                      title={lang === 'ar' ? 'إلغاء الموعد' : 'Cancel appointment'}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Appointment Modal with Double-Booking Prevention */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#ebdcd0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
              <h3 className="font-bold text-sm text-[#352026]">
                {t.btn_new_appointment}
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-[#9e8b86] hover:text-[#352026] text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#fff0f0] border border-[#ffcdd2] rounded-xl text-xs text-[#d32f2f] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Customer Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#352026]">{t.pos_client_selection}</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsNewModalOpen(false); onOpenNewCustomerModal(); }}
                    className="text-[#8b5a4b] font-bold hover:underline"
                  >
                    + {t.btn_new_customer}
                  </button>
                </div>
                <select
                  value={formCustomerId}
                  onChange={e => setFormCustomerId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone}) - {c.loyalty_points} {lang === 'ar' ? 'نقطة' : 'pts'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selector */}
              <div>
                <label className="font-bold text-[#352026] block mb-1">{t.appt_col_service}</label>
                <select
                  value={formServiceId}
                  onChange={e => setFormServiceId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  required
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.name_ar : s.name_en} ({s.duration_minutes} min) — {s.price} {t.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technician Selector */}
              <div>
                <label className="font-bold text-[#352026] block mb-1">{t.appt_col_technician}</label>
                <select
                  value={formTechnicianId}
                  onChange={e => setFormTechnicianId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                >
                  <option value="none">
                    {lang === 'ar' ? 'بدون أخصائية (إشراف وتشغيل مباشر من إدارة المركز)' : 'No Technician (Direct Center Operation)'}
                  </option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.full_name} ({tech.job_title_en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'تاريخ الحجز' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'وقت البدء' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Discount & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {t.pos_discount} ({t.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDiscount}
                    onChange={e => setFormDiscount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352026] block mb-1">
                    {lang === 'ar' ? 'ملاحظات وتفضيلات' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: بشرة حساسة / عروس' : 'e.g. Sensitive skin'}
                    className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ebdcd0]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
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
