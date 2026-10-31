/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Gift,
  Crown,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';
import { MarketingCampaign, BeautyPackage, GiftCard } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface MarketingLoyaltyModuleProps {
  lang: 'ar' | 'en';
}

export const MarketingLoyaltyModule: React.FC<MarketingLoyaltyModuleProps> = ({ lang }) => {
  const { t, isRtl } = useI18n(lang);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'packages' | 'loyalty' | 'giftcards'>('campaigns');

  const campaigns: MarketingCampaign[] = [
    {
      id: 'cmp-1',
      name: 'Alexandria Bridal Season 2026',
      channel: 'instagram',
      start_date: '2026-10-01',
      end_date: '2026-11-15',
      budget: 8000,
      actual_spend: 5200,
      leads_count: 84,
      bookings_count: 22,
      revenue_generated: 41800,
      roi_percentage: 703,
      status: 'active'
    },
    {
      id: 'cmp-2',
      name: 'Dermapen & Skin Glow TikTok Campaign',
      channel: 'tiktok',
      start_date: '2026-10-10',
      end_date: '2026-10-31',
      budget: 4000,
      actual_spend: 3800,
      leads_count: 65,
      bookings_count: 14,
      revenue_generated: 39200,
      roi_percentage: 931,
      status: 'active'
    }
  ];

  const packages: BeautyPackage[] = [
    {
      id: 'pkg-bridal',
      name_en: 'Royal Bridal Signature Package',
      name_ar: 'الباقة الملكية المتكاملة للعروس',
      price: 3500,
      validity_days: 60,
      included_services: [
        { service_id: 'serv-bridal-makeup', service_name: 'Luxury Bridal Makeup', total_quantity: 1 },
        { service_id: 'serv-hair-styling', service_name: 'Hair Styling & Waves', total_quantity: 1 },
        { service_id: 'serv-deep-facial', service_name: 'Deep Facial Cleansing', total_quantity: 1 },
        { service_id: 'serv-eyebrows-style', service_name: 'Eyebrow Styling & Tint', total_quantity: 1 }
      ]
    },
    {
      id: 'pkg-glow',
      name_en: 'Monthly Skin Glow Pass (3 Sessions)',
      name_ar: 'باقة نضارة البشرة الشهرية (٣ جلسات)',
      price: 2400,
      validity_days: 90,
      included_services: [
        { service_id: 'serv-deep-facial', service_name: 'Deep Facial Cleansing', total_quantity: 2 },
        { service_id: 'serv-basic-facial', service_name: 'Basic Refreshing Facial', total_quantity: 1 }
      ]
    }
  ];

  const giftCards: GiftCard[] = [
    {
      id: 'gc-1',
      code: 'LUM-GIFT-5001',
      initial_value: 2000,
      current_balance: 1400,
      recipient_name: 'Menna El-Sayed',
      expiry_date: '2027-04-30',
      status: 'active'
    },
    {
      id: 'gc-2',
      code: 'LUM-GIFT-5002',
      initial_value: 1000,
      current_balance: 1000,
      recipient_name: 'Dalia Kamel',
      expiry_date: '2027-06-15',
      status: 'active'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_marketing}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'إدارة الحملات الإعلانية ومعدل العائد (ROI)، باقات العرائس، بطاقات الهدايا، وبرنامج النقاط'
              : 'Marketing campaigns with CAC & ROI, bridal packages, memberships, and gift cards'}
          </p>
        </div>

        <div className="bg-[#f5ede4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'campaigns' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {lang === 'ar' ? 'الحملات و ROI' : 'Campaigns'}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'packages' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {lang === 'ar' ? 'باقات العرائس' : 'Packages'}
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'loyalty' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {lang === 'ar' ? 'قواعد نقاط الولاء' : 'Loyalty Rules'}
          </button>
          <button
            onClick={() => setActiveTab('giftcards')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'giftcards' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            {lang === 'ar' ? 'كروت الهدايا' : 'Gift Cards'}
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(cmp => (
              <div
                key={cmp.id}
                className="bg-white rounded-2xl border border-[#ebdcd0] p-5 space-y-3.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5ede4] text-[#8b5a4b]">
                      {cmp.channel}
                    </span>
                    <h3 className="font-bold text-sm text-[#2e191e] mt-1.5">{cmp.name}</h3>
                    <p className="text-[11px] text-[#8c746e]">
                      {cmp.start_date} → {cmp.end_date}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#2e7d32] bg-[#eef8f1] px-2.5 py-1 rounded-xl">
                    +{cmp.roi_percentage}% ROI
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2.5 bg-[#fdfcfb] rounded-xl border border-[#ebdcd0]">
                    <span className="text-[10px] text-[#8c746e] block">{lang === 'ar' ? 'الإنفاق الفعلي' : 'Spend'}</span>
                    <span className="font-bold text-[#d9534f]">{cmp.actual_spend} {t.currency}</span>
                  </div>
                  <div className="p-2.5 bg-[#fdfcfb] rounded-xl border border-[#ebdcd0]">
                    <span className="text-[10px] text-[#8c746e] block">{lang === 'ar' ? 'الحجوزات' : 'Bookings'}</span>
                    <span className="font-bold text-[#352026]">{cmp.bookings_count}</span>
                  </div>
                  <div className="p-2.5 bg-[#fdfcfb] rounded-xl border border-[#ebdcd0]">
                    <span className="text-[10px] text-[#8c746e] block">{lang === 'ar' ? 'الإيراد المحقق' : 'Revenue'}</span>
                    <span className="font-bold text-[#2e7d32]">{cmp.revenue_generated.toLocaleString()} {t.currency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-[#ebdcd0] p-5 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#2e191e]">
                    {lang === 'ar' ? pkg.name_ar : pkg.name_en}
                  </h3>
                  <span className="text-[11px] text-[#8c746e]">
                    {lang === 'ar' ? `صلاحية: ${pkg.validity_days} يوم` : `Valid for ${pkg.validity_days} days`}
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-base font-bold text-[#352026]">{pkg.price} {t.currency}</span>
                  <span className="text-[10px] text-[#2e7d32] block font-semibold">
                    {lang === 'ar' ? 'وفر ٢٥٪ عن المنفصل' : 'Save 25%'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#fdfcfb] rounded-xl border border-[#eee4dc] space-y-1.5 text-xs">
                <span className="font-bold text-[#8b5a4b] block text-[11px]">
                  {lang === 'ar' ? 'الخدمات المشمولة بالباقة:' : 'Services Included:'}
                </span>
                {pkg.included_services.map((srv, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-[#2e191e]">• {srv.service_name}</span>
                    <span className="font-bold text-[#8c746e]">x{srv.total_quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-5 shadow-2xs space-y-4 max-w-2xl">
          <h3 className="font-bold text-sm text-[#352026]">
            {lang === 'ar' ? 'إعدادات وقواعد برنامج ولاء لوميير (Lumière Rewards)' : 'Lumière Loyalty Program Configuration'}
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl space-y-1">
              <span className="font-bold text-[#352026] block">
                {lang === 'ar' ? 'معادلة اكتساب النقاط' : 'Earning Rule'}
              </span>
              <p className="text-[#715c61] text-[11px]">
                {lang === 'ar' ? 'كل ١٠٠ جنيه مصري مدفوعة = ١ نقطة ولاء' : '100 EGP spent = 1 loyalty point earned'}
              </p>
            </div>

            <div className="p-4 bg-[#fcfaf7] border border-[#ebdcd0] rounded-xl space-y-1">
              <span className="font-bold text-[#352026] block">
                {lang === 'ar' ? 'معادلة استبدال النقاط' : 'Redemption Rule'}
              </span>
              <p className="text-[#715c61] text-[11px]">
                {lang === 'ar' ? '١ نقطة ولاء = ٢ جنيه مصري خصم في الـ POS' : '1 loyalty point = 2 EGP direct checkout discount'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'giftcards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {giftCards.map(gc => (
            <div
              key={gc.id}
              className="bg-gradient-to-r from-[#3d2027] to-[#6d3e49] text-white p-5 rounded-2xl shadow-md border border-[#522933] space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffdcc7]">
                    Lumière Gift Voucher
                  </span>
                  <div className="font-mono text-xs font-bold text-white mt-1">{gc.code}</div>
                </div>
                <Gift className="w-5 h-5 text-[#ffdcc7]" />
              </div>

              <div className="flex justify-between items-end pt-3 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-[#e8ded6] block">{lang === 'ar' ? 'المهدى إليها:' : 'Recipient:'}</span>
                  <span className="font-bold text-xs">{gc.recipient_name}</span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-[#e8ded6] block">{lang === 'ar' ? 'الرصيد المتاح:' : 'Balance:'}</span>
                  <span className="text-lg font-bold text-[#ffdcc7]">{gc.current_balance} {t.currency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
