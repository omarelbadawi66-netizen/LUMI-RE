/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Star,
  MapPin,
  Building,
  Clock,
  Phone,
  Shield,
  CheckCircle2,
  Save,
  MessageSquareQuote
} from 'lucide-react';
import { Branch, CustomerReview } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface SettingsReviewsModuleProps {
  lang: 'ar' | 'en';
  branches: Branch[];
}

export const SettingsReviewsModule: React.FC<SettingsReviewsModuleProps> = ({
  lang,
  branches
}) => {
  const { t, isRtl } = useI18n(lang);
  const [activeTab, setActiveTab] = useState<'settings' | 'reviews'>('settings');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings state
  const [businessName, setBusinessName] = useState('Lumière Beauty Center Alexandria');
  const [taxNumber, setTaxNumber] = useState('654-890-123');
  const [openingTime, setOpeningTime] = useState('10:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [vatRate, setVatRate] = useState<number>(0);

  const reviews: CustomerReview[] = [
    {
      id: 'rev-1',
      appointment_id: 'appt-4',
      customer_id: 'cust-4',
      customer_name: 'Hanya Zahran',
      technician_id: 'emp-nourhan',
      technician_name: 'Nourhan Tarek',
      service_name: 'Lash Lifting & Keratin Boost',
      rating: 5,
      feedback: 'أفضل مركز تجميل بالإسكندرية! شغل الرموش طبيعي جداً ومعاملة راقية واستقبال محترم.',
      created_at: '2026-10-30T11:40:00Z',
      is_complaint: false
    },
    {
      id: 'rev-2',
      appointment_id: 'appt-old',
      customer_id: 'cust-1',
      customer_name: 'Farida El-Gazzar',
      technician_id: 'emp-sarah',
      technician_name: 'Sarah Gamal',
      service_name: 'Luxury Bridal Makeup',
      rating: 5,
      feedback: 'سارة ممتازة ومحترفة جداً، المكياج ناعم وثابت طوال اليوم. شكراً لوميير!',
      created_at: '2026-10-25T17:00:00Z',
      is_complaint: false
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {activeTab === 'settings' ? t.nav_settings : t.nav_reviews}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'إعدادات الفروع، ساعات العمل، الفاتورة الضريبية، وآراء وتقييمات العميلات'
              : 'Branch configuration, business info, tax receipt details, and customer reviews'}
          </p>
        </div>

        <div className="bg-[#f5ede4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {t.nav_settings}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'reviews' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {t.nav_reviews}
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <form onSubmit={handleSave} className="space-y-5 max-w-2xl bg-white p-5 rounded-2xl border border-[#ebdcd0] shadow-2xs text-xs">
          {savedSuccess && (
            <div className="p-3 bg-[#eef8f1] border border-[#c8e6c9] rounded-xl text-xs text-[#1e8e3e] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-[#352026] block mb-1">
              {lang === 'ar' ? 'اسم المنشأة التجاري' : 'Business Legal Name'}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#352026] block mb-1">
                {lang === 'ar' ? 'رقم التسجيل الضريبي' : 'Tax Registration Number'}
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#352026] block mb-1">
                {lang === 'ar' ? 'العملة الأساسية' : 'Primary Currency'}
              </label>
              <input
                type="text"
                value="EGP (جنيه مصري)"
                disabled
                className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#352026] block mb-1">
                {lang === 'ar' ? 'ساعة فتح المركز' : 'Opening Time'}
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={e => setOpeningTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#352026] block mb-1">
                {lang === 'ar' ? 'ساعة إغلاق المركز' : 'Closing Time'}
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={e => setClosingTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#e5d6ca] bg-[#fbf7f4] text-[#352026] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#f2e7de] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3d2027] hover:bg-[#2c141a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#e5bda3]" />
              <span>{t.btn_save}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#2e191e]">{rev.customer_name}</h4>
                  <div className="text-xs text-[#8b5a4b] mt-0.5">
                    {rev.service_name} • {lang === 'ar' ? 'الأخصائية:' : 'Tech:'} {rev.technician_name}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-[#e67a00]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#715c61] leading-relaxed italic bg-[#fcfaf7] p-3 rounded-xl border border-[#eee4dc]">
                "{rev.feedback}"
              </p>

              <div className="text-[10px] text-[#8c746e]">
                {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
