/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Package,
  Clock,
  Layers,
  ChevronDown,
  Info,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Service, Product } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface ServicesModuleProps {
  lang: 'ar' | 'en';
  services: Service[];
  products: Product[];
}

export const ServicesModule: React.FC<ServicesModuleProps> = ({
  lang,
  services,
  products
}) => {
  const { t, isRtl } = useI18n(lang);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(services[0]?.id || null);

  const categories = [
    { id: 'all', labelEn: 'All Services', labelAr: 'جميع الخدمات' },
    { id: 'makeup', labelEn: 'Makeup', labelAr: 'المكياج والسواريه' },
    { id: 'deep_facial', labelEn: 'Facial & Skin', labelAr: 'العناية بالبشرة والتنظيف' },
    { id: 'lashes', labelEn: 'Lashes & Brows', labelAr: 'الرموش وتنسيق الحواجب' },
    { id: 'hair_styling', labelEn: 'Hair Styling', labelAr: 'تصفيف الشعر' }
  ];

  const filteredServices = services.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'makeup') return s.category === 'makeup' || s.category === 'soft_makeup';
    if (selectedCategory === 'deep_facial') return s.category === 'deep_facial' || s.category === 'basic_facial' || s.category === 'skin_prep';
    if (selectedCategory === 'lashes') return s.category === 'lashes' || s.category === 'brows' || s.category === 'eyebrows_styling';
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_services}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar' 
              ? 'قائمة الخدمات، قواعد العمولات، ونظام وصفات الخامات المستهلكة (Bill of Materials) لكل جلسة' 
              : 'Services catalog, technician commission rules, and automated Bill of Materials (BOM) consumable recipes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#f5ede4] text-[#8b5a4b] px-3 py-1.5 rounded-xl">
            {services.length} {lang === 'ar' ? 'خدمة مفعلة' : 'Active Services'}
          </span>
        </div>
      </div>

      {/* BOM Notice */}
      <div className="p-3.5 bg-[#fdfaf7] border border-[#ebdcd0] rounded-xl text-xs text-[#6e585e] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#8b5a4b] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#352026]">{t.inv_bom_recipe}: </span>
          {t.inv_auto_deduct_note}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-[#3d2027] text-white shadow-xs'
                : 'bg-white border border-[#ebdcd0] text-[#5e494d] hover:bg-[#fbf7f4]'
            }`}
          >
            {lang === 'ar' ? c.labelAr : c.labelEn}
          </button>
        ))}
      </div>

      {/* Services Cards with Interactive BOM Recipe Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map(srv => {
          const isExpanded = expandedServiceId === srv.id;

          return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-[#f5ede4] text-[#8b5a4b] px-2 py-0.5 rounded">
                      {srv.code}
                    </span>
                    <span className="text-[11px] text-[#8c746e] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {srv.duration_minutes} min
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#2e191e] mt-1.5">
                    {lang === 'ar' ? srv.name_ar : srv.name_en}
                  </h3>
                  <p className="text-[11px] text-[#715c61] mt-0.5 leading-relaxed">
                    {lang === 'ar' ? srv.description_ar : srv.description_en}
                  </p>
                </div>

                <div className="text-end shrink-0">
                  <div className="text-base font-bold text-[#2e191e]">{srv.price} {t.currency}</div>
                  <div className="text-[10px] text-[#8c746e]">
                    {lang === 'ar' ? 'التكلفة المقدرة:' : 'Est. cost:'} {srv.cost} {t.currency}
                  </div>
                </div>
              </div>

              {/* Commission Rule Badge */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-[#fcfaf7] rounded-xl border border-[#ebdcd0]">
                <span className="text-[#715c61] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#8b5a4b]" />
                  <span>{lang === 'ar' ? 'عمولة الأخصائية:' : 'Technician Commission:'}</span>
                </span>
                <span className="font-bold text-[#2e7d32]">
                  {srv.commission_type === 'percentage'
                    ? `${srv.commission_percentage}% (${(srv.price * (srv.commission_percentage || 0) / 100)} ${t.currency})`
                    : `${srv.commission_fixed_amount} ${t.currency} (${lang === 'ar' ? 'مبلغ ثابت' : 'Fixed'})`}
                </span>
              </div>

              {/* Collapsible BOM Recipe Section */}
              <div className="border-t border-[#f2e7de] pt-2">
                <button
                  onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#8b5a4b] hover:text-[#5a333d] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{t.inv_bom_recipe} ({srv.recipe_items.length} {lang === 'ar' ? 'خامات' : 'consumables'})</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#fdfcfb] border border-[#eee4dc] space-y-2 text-xs">
                    {srv.recipe_items.length === 0 ? (
                      <div className="text-[11px] text-[#9c8983] italic">
                        {lang === 'ar' ? 'لا توجد خامات مستهلكة محددة لهذه الخدمة' : 'No specific physical consumables linked to this service.'}
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f5ede4]">
                        {srv.recipe_items.map((it, idx) => {
                          const product = products.find(p => p.id === it.product_id);

                          return (
                            <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                              <div>
                                <span className="font-semibold text-[#2e191e]">
                                  {product ? (lang === 'ar' ? product.name_ar : product.name_en) : it.product_id}
                                </span>
                                {product && (
                                  <span className="text-[10px] text-[#8c746e] block">
                                    {lang === 'ar' ? 'المخزون الحالي:' : 'Current Stock:'} {product.current_stock} {product.unit}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-[#8b5a4b] bg-[#f5ede4] px-2 py-0.5 rounded">
                                {it.quantity} {it.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
