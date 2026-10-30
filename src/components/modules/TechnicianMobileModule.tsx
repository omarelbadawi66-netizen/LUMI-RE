/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  Clock,
  Play,
  Check,
  CheckCircle2,
  DollarSign,
  Package,
  ShieldAlert,
  User
} from 'lucide-react';
import { Appointment, Employee, Product } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface TechnicianMobileModuleProps {
  lang: 'ar' | 'en';
  appointments: Appointment[];
  employees: Employee[];
  products: Product[];
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => void;
}

export const TechnicianMobileModule: React.FC<TechnicianMobileModuleProps> = ({
  lang,
  appointments,
  employees,
  products,
  onUpdateStatus
}) => {
  const { t, isRtl } = useI18n(lang);
  const [selectedTechId, setSelectedTechId] = useState<string>('emp-sarah');

  const currentTech = employees.find(e => e.id === selectedTechId) || employees[0];

  const techAppointments = appointments.filter(a => a.technician_id === currentTech.id && a.date === '2026-10-30');

  const todayCommissions = techAppointments
    .filter(a => a.status === 'completed' && a.calculated_commission)
    .reduce((sum, a) => sum + (a.calculated_commission || 0), 0);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Privacy Notice Banner */}
      <div className="p-3 bg-[#fdfaf7] border border-[#ebdcd0] rounded-xl flex items-center justify-between text-xs text-[#715c61]">
        <span className="flex items-center gap-1.5 font-bold text-[#8b5a4b]">
          <Smartphone className="w-4 h-4" />
          <span>{lang === 'ar' ? 'واجهة الأخصائية الميدانية' : 'Technician Mobile Mode'}</span>
        </span>

        {/* Technician Profile Selector */}
        <select
          value={selectedTechId}
          onChange={e => setSelectedTechId(e.target.value)}
          className="text-xs bg-white border border-[#e5d6ca] rounded-lg px-2 py-1 text-[#352026] font-semibold outline-none"
        >
          {employees.filter(e => e.employment_type === 'technician').map(tech => (
            <option key={tech.id} value={tech.id}>{tech.full_name}</option>
          ))}
        </select>
      </div>

      {/* Technician Daily Card */}
      <div className="bg-gradient-to-tr from-[#3d2027] to-[#5e3842] text-white p-4.5 rounded-2xl shadow-md border border-[#522933] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center border border-white/10">
              {currentTech.full_name[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{currentTech.full_name}</h3>
              <p className="text-[11px] text-[#ffdcc7]">
                {lang === 'ar' ? currentTech.job_title_ar : currentTech.job_title_en}
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-[10px] text-[#e8ded6] block">{lang === 'ar' ? 'عمولات اليوم' : "Today's Commission"}</span>
            <span className="text-lg font-bold text-[#fedec7]">
              +{todayCommissions} {t.currency}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] pt-2 border-t border-white/10 text-[#eedfd8]">
          <span>{techAppointments.length} {lang === 'ar' ? 'جلسات مجدولة اليوم' : 'sessions today'}</span>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded font-bold">
            {currentTech.commission_model === 'hybrid' ? 'Base + 35%' : `${currentTech.commission_default_rate}% Comm`}
          </span>
        </div>
      </div>

      {/* Appointments Queue */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-[#352026] uppercase">
          {lang === 'ar' ? 'جلساتكِ لليوم (30 أكتوبر)' : "Today's Sessions"}
        </h4>

        {techAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ebdcd0] p-8 text-center text-xs text-[#8c746e]">
            {lang === 'ar' ? 'لا توجد جلسات أخرى متبقية لليوم' : 'No more sessions scheduled today.'}
          </div>
        ) : (
          techAppointments.map(appt => (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border p-4 space-y-3 shadow-2xs ${
                appt.status === 'in_service' ? 'border-[#3880ff] bg-[#f8fbff]' : 'border-[#ebdcd0]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8b5a4b]">{appt.start_time} - {appt.end_time}</span>
                    <span className="text-[10px] text-[#8c746e]">({appt.duration_minutes}m)</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2e191e] mt-1">{appt.customer_name}</h4>
                  <div className="text-xs font-semibold text-[#8b5a4b] mt-0.5">
                    {lang === 'ar' ? appt.service_name_ar : appt.service_name_en}
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  appt.status === 'completed' ? 'bg-[#eef8f1] text-[#1e8e3e]' :
                  appt.status === 'in_service' ? 'bg-[#e8f0fe] text-[#1967d2] animate-pulse' :
                  'bg-[#f5ede4] text-[#8b5a4b]'
                }`}>
                  {appt.status}
                </span>
              </div>

              {appt.notes && (
                <div className="text-[11px] text-[#715c61] bg-[#fcfaf7] p-2 rounded-lg border border-[#eee4dc]">
                  <span className="font-semibold">{lang === 'ar' ? 'ملاحظات العميلة:' : 'Client Notes:'} </span>
                  {appt.notes}
                </div>
              )}

              {/* Commission preview for completed or ongoing */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f2e7de]">
                <span className="text-[11px] text-[#8c746e]">
                  {lang === 'ar' ? 'العمولة المستحقة:' : 'Your Commission:'}
                </span>
                <span className="font-bold text-[#2e7d32]">
                  +{appt.calculated_commission || (appt.net_price * (currentTech.commission_default_rate / 100))} {t.currency}
                </span>
              </div>

              {/* Interactive Status Actions */}
              <div className="pt-1">
                {appt.status === 'confirmed' || appt.status === 'checked_in' ? (
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'in_service')}
                    className="w-full py-2 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-[#e5bda3]" />
                    <span>{lang === 'ar' ? 'بدء تقديم الجلسة' : 'Start Service'}</span>
                  </button>
                ) : appt.status === 'in_service' ? (
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'completed')}
                    className="w-full py-2 bg-[#2e7d32] hover:bg-[#256628] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs animate-pulse"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إنهاء الجلسة وخصم الخامات' : 'Complete & Deduct BOM'}</span>
                  </button>
                ) : (
                  <div className="text-center py-1 text-xs text-[#2e7d32] font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تمت الجلسة واحتساب العمولة' : 'Completed & Commission Booked'}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
