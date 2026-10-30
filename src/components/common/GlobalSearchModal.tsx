/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  User, 
  Sparkles, 
  Package, 
  CreditCard,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { Customer, Appointment, Service, Product } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  customers: Customer[];
  appointments: Appointment[];
  services: Service[];
  products: Product[];
  onSelectCustomer: (c: Customer) => void;
  onSelectAppointment: (a: Appointment) => void;
  onSelectService: (s: Service) => void;
  onSelectProduct: (p: Product) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  customers,
  appointments,
  services,
  products,
  onSelectCustomer,
  onSelectAppointment,
  onSelectService,
  onSelectProduct
}) => {
  const { t, isRtl } = useI18n(lang);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCustomers = q ? customers.filter(c => 
    c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || c.code.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const filteredAppointments = q ? appointments.filter(a =>
    a.code.toLowerCase().includes(q) ||
    a.customer_name.toLowerCase().includes(q) ||
    a.service_name_en.toLowerCase().includes(q) ||
    a.service_name_ar.includes(q)
  ).slice(0, 4) : [];

  const filteredServices = q ? services.filter(s =>
    s.name_en.toLowerCase().includes(q) ||
    s.name_ar.includes(q) ||
    s.code.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const filteredProducts = q ? products.filter(p =>
    p.name_en.toLowerCase().includes(q) ||
    p.name_ar.includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.barcode.includes(q)
  ).slice(0, 4) : [];

  const totalResults = filteredCustomers.length + filteredAppointments.length + filteredServices.length + filteredProducts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#ded2c6] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-[#e8ded4] p-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#915844] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتبي للبحث عن عميلة، موعد، خدمة، أو منتج بالمخزون...' : 'Type to search customers, appointments, services, products...'}
            className="w-full text-sm outline-none bg-transparent placeholder-[#9f8a84] text-[#2f1c21]"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#9f8a84] hover:bg-[#f5ede4]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-[#f5ede4] text-[#714d3f] px-2 py-1 rounded font-mono border border-[#e3d4c6]">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-[#8f7972] space-y-1">
              <p className="font-medium text-[#4d3339]">
                {lang === 'ar' ? 'البحث الشامل لمركز لوميير' : 'Lumière Global Search'}
              </p>
              <p className="text-[11px] text-[#9c8983]">
                {lang === 'ar' ? 'يمكنكِ البحث بأرقام الهواتف أو أسماء الخدمات أو باركود المنتجات.' : 'Search by phone numbers, service names, customer names or barcodes.'}
              </p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-[#9f8a84]">
              {lang === 'ar' ? `لم يتم العثور على نتائج مطابقة لـ "${query}"` : `No matching results for "${query}"`}
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#915844] uppercase tracking-wider mb-1 px-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'العميلات' : 'Customers'} ({filteredCustomers.length})</span>
              </div>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectCustomer(c); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#fbf7f4] text-start border border-transparent hover:border-[#ebdcd0] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#301c22]">{c.full_name}</div>
                      <div className="text-[11px] text-[#85716c]">{c.phone} • {c.code} • {c.address}</div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#f5ede4] text-[#8c594d] px-2 py-0.5 rounded-full">
                      {c.loyalty_points} {lang === 'ar' ? 'نقطة' : 'pts'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {filteredAppointments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#915844] uppercase tracking-wider mb-1 px-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'المواعيد والحجوزات' : 'Appointments'} ({filteredAppointments.length})</span>
              </div>
              <div className="space-y-1">
                {filteredAppointments.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { onSelectAppointment(a); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#fbf7f4] text-start border border-transparent hover:border-[#ebdcd0] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#301c22]">
                        {a.code} - {a.customer_name} ({lang === 'ar' ? a.service_name_ar : a.service_name_en})
                      </div>
                      <div className="text-[11px] text-[#85716c]">{a.date} at {a.start_time} • {a.technician_name}</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-[#3d2027] text-white px-2 py-0.5 rounded-full">
                      {a.price} {t.currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {filteredServices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#915844] uppercase tracking-wider mb-1 px-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'دليل الخدمات' : 'Services'} ({filteredServices.length})</span>
              </div>
              <div className="space-y-1">
                {filteredServices.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectService(s); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#fbf7f4] text-start border border-transparent hover:border-[#ebdcd0] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#301c22]">
                        {lang === 'ar' ? s.name_ar : s.name_en}
                      </div>
                      <div className="text-[11px] text-[#85716c]">{s.duration_minutes} min • {s.category}</div>
                    </div>
                    <span className="text-xs font-bold text-[#301c22]">{s.price} {t.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#915844] uppercase tracking-wider mb-1 px-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'المخزون والمنتجات' : 'Products & Stock'} ({filteredProducts.length})</span>
              </div>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectProduct(p); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#fbf7f4] text-start border border-transparent hover:border-[#ebdcd0] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#301c22]">
                        {lang === 'ar' ? p.name_ar : p.name_en}
                      </div>
                      <div className="text-[11px] text-[#85716c]">{p.sku} • {p.brand} • In Stock: {p.current_stock} {p.unit}</div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      p.current_stock <= p.min_stock ? 'bg-[#ffedec] text-[#d93025]' : 'bg-[#eef8f1] text-[#1e8e3e]'
                    }`}>
                      {p.current_stock} {p.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
