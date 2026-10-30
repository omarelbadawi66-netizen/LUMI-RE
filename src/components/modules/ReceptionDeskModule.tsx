/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  Play,
  Check,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Appointment, Customer } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface ReceptionDeskModuleProps {
  lang: 'ar' | 'en';
  appointments: Appointment[];
  customers: Customer[];
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
  onOpenPosForAppointment: (appointment: Appointment) => void;
  onQuickNewAppointment: () => void;
}

export const ReceptionDeskModule: React.FC<ReceptionDeskModuleProps> = ({
  lang,
  appointments,
  customers,
  onUpdateStatus,
  onOpenPosForAppointment,
  onQuickNewAppointment
}) => {
  const { t, isRtl } = useI18n(lang);
  const [clientSearch, setClientSearch] = useState('');

  const todayAppts = appointments.filter(a => a.date === '2026-10-30');

  const filteredAppts = clientSearch
    ? todayAppts.filter(a => 
        a.customer_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        a.customer_phone.includes(clientSearch) ||
        a.code.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : todayAppts;

  return (
    <div className="space-y-5">
      {/* Fast Desk Header */}
      <div className="bg-gradient-to-r from-[#2c161d] to-[#45232d] text-white p-5 rounded-2xl shadow-md border border-[#4a2631] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#d8a47f]/20 text-[#fedec7] px-2 py-0.5 rounded">
              High Velocity Desk
            </span>
            <span className="text-xs text-[#e8ded6]">
              {lang === 'ar' ? 'مكتب الاستقبال السريع' : 'Reception Fast Flow'}
            </span>
          </div>
          <h2 className="font-serif-title text-2xl font-bold mt-1 text-white">
            {t.nav_reception}
          </h2>
          <p className="text-xs text-[#eedfd8] mt-0.5">
            {lang === 'ar'
              ? 'تسجيل وصول فوري بنقرة واحدة ← بدء الجلسة ← إنهائها ← تحصيل الدفع بالـ POS'
              : '1-click check-in arriving clients → start service → complete → launch POS invoice'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onQuickNewAppointment}
            className="px-4 py-2 bg-[#d8a47f] hover:bg-[#c99570] text-[#2c141a] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.btn_new_appointment}</span>
          </button>
        </div>
      </div>

      {/* Arriving Client Quick Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#ebdcd0] shadow-2xs">
        <div className="relative">
          <Search className="w-5 h-5 text-[#8b5a4b] absolute top-3 left-3 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'وصول عميلة الآن: ابحثي برقم الهاتف أو اسم العميلة أو كود الحجز...' : 'Arriving client: Search phone, name or booking code...'}
            className="w-full py-2.5 px-10 text-sm font-medium rounded-xl border border-[#e5d6ca] bg-[#fdfcfb] text-[#2e191e] outline-none placeholder-[#9c8983]"
          />
        </div>
      </div>

      {/* High-Velocity Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppts.map(appt => {
          return (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border p-4.5 space-y-4 shadow-2xs hover:shadow-xs transition-all ${
                appt.status === 'in_service'
                  ? 'border-[#3880ff] bg-[#f8fbff]'
                  : appt.status === 'checked_in'
                  ? 'border-[#ff9800] bg-[#fffbf5]'
                  : appt.status === 'completed'
                  ? 'border-[#4caf50] bg-[#f9fdf9]'
                  : 'border-[#ebdcd0]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f5ede4] text-[#4a2e35] font-bold text-center flex flex-col justify-center items-center border border-[#e8ded4] shrink-0">
                    <span className="text-xs">{appt.start_time}</span>
                    <span className="text-[9px] text-[#856b64]">{appt.duration_minutes}m</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2e191e]">{appt.customer_name}</span>
                      <span className="text-[10px] text-[#8c746e] font-mono">({appt.code})</span>
                    </div>
                    <div className="text-xs font-semibold text-[#8b5a4b] mt-0.5">
                      {lang === 'ar' ? appt.service_name_ar : appt.service_name_en}
                    </div>
                    <div className="text-[11px] text-[#715c61]">
                      {lang === 'ar' ? 'الأخصائية:' : 'Technician:'} {appt.technician_name} • {appt.customer_phone}
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <div className="text-sm font-bold text-[#2e191e]">{appt.net_price} {t.currency}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    appt.status === 'completed' ? 'bg-[#eef8f1] text-[#1e8e3e]' :
                    appt.status === 'in_service' ? 'bg-[#e8f0fe] text-[#1967d2]' :
                    appt.status === 'checked_in' ? 'bg-[#fff4e5] text-[#ed6c02]' :
                    'bg-[#f5ede4] text-[#8b5a4b]'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>

              {/* Instant 1-Click Action Steps */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f2e7de]">
                {/* Step 1: Check-in */}
                <button
                  onClick={() => onUpdateStatus(appt.id, 'checked_in')}
                  disabled={appt.status !== 'confirmed'}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    appt.status === 'confirmed'
                      ? 'bg-[#3d2027] text-white hover:bg-[#2c141a] cursor-pointer shadow-xs active:scale-98'
                      : appt.status === 'checked_in' || appt.status === 'in_service' || appt.status === 'completed'
                      ? 'bg-[#eef8f1] text-[#1e8e3e] cursor-default'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? '١. تسجيل وصول' : '1. Check-In'}</span>
                </button>

                {/* Step 2: Start / Complete */}
                {appt.status !== 'in_service' ? (
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'in_service')}
                    disabled={appt.status !== 'checked_in'}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      appt.status === 'checked_in'
                        ? 'bg-[#1967d2] text-white hover:bg-[#1557b0] cursor-pointer shadow-xs active:scale-98'
                        : appt.status === 'completed'
                        ? 'bg-[#eef8f1] text-[#1e8e3e] cursor-default'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? '٢. بدء الجلسة' : '2. Start'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'completed')}
                    className="py-2 px-1 rounded-xl text-xs font-bold bg-[#2e7d32] text-white hover:bg-[#256628] cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-1 animate-pulse"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إنهاء الجلسة' : 'Complete'}</span>
                  </button>
                )}

                {/* Step 3: Launch POS Invoice */}
                <button
                  onClick={() => onOpenPosForAppointment(appt)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    appt.payment_status === 'paid'
                      ? 'bg-[#eef8f1] text-[#1e8e3e] cursor-default'
                      : 'bg-[#8b5a4b] text-white hover:bg-[#724538] cursor-pointer shadow-xs active:scale-98'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    {appt.payment_status === 'paid' 
                      ? (lang === 'ar' ? 'تم الدفع' : 'Paid') 
                      : (lang === 'ar' ? '٣. سداد POS' : '3. POS Pay')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
