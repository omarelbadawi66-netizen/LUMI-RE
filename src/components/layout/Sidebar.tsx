/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  Sparkles,
  Package,
  Truck,
  Receipt,
  UserCheck,
  Calculator,
  PieChart,
  Megaphone,
  Star,
  ShieldCheck,
  Settings,
  Smartphone,
  ChevronRight,
  Flame,
  Clock
} from 'lucide-react';
import { UserRole } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface SidebarProps {
  lang: 'ar' | 'en';
  activeModule: string;
  setActiveModule: (mod: string) => void;
  currentRole: UserRole;
  lowStockCount: number;
  pendingAppointmentsCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  count?: number;
  countVariant?: 'warning' | 'default';
}

interface NavSection {
  titleEn: string;
  titleAr: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  activeModule,
  setActiveModule,
  currentRole,
  lowStockCount,
  pendingAppointmentsCount
}) => {
  const { t, isRtl } = useI18n(lang);

  // Grouped Navigation Items
  const navSections: NavSection[] = [
    {
      titleEn: 'Operations & Desk',
      titleAr: 'العمليات والاستقبال',
      items: [
        { id: 'dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
        { id: 'reception', label: t.nav_reception, icon: Clock, badge: 'Fast' },
        { 
          id: 'appointments', 
          label: t.nav_calendar, 
          icon: Calendar,
          count: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : undefined
        },
        { id: 'pos', label: t.nav_pos, icon: CreditCard, highlight: true },
        { id: 'cash_register', label: t.nav_cash_register, icon: Banknote }
      ]
    },
    {
      titleEn: 'Clients & Catalog',
      titleAr: 'العملاء والخدمات والمخزون',
      items: [
        { id: 'customers', label: t.nav_customers, icon: Users },
        { id: 'services', label: t.nav_services, icon: Sparkles },
        { 
          id: 'inventory', 
          label: t.nav_inventory, 
          icon: Package,
          count: lowStockCount > 0 ? lowStockCount : undefined,
          countVariant: 'warning'
        }
      ]
    },
    {
      titleEn: 'HR & Finance',
      titleAr: 'الموارد البشرية والمالية',
      items: [
        { id: 'hr', label: t.nav_hr_attendance, icon: UserCheck },
        { id: 'payroll', label: t.nav_payroll, icon: Calculator },
        { id: 'purchasing', label: t.nav_purchasing, icon: Truck },
        { id: 'expenses', label: t.nav_expenses, icon: Receipt },
        { id: 'finance', label: t.nav_finance, icon: PieChart }
      ]
    },
    {
      titleEn: 'Marketing & Security',
      titleAr: 'التسويق والحوكمة والرقابة',
      items: [
        { id: 'marketing', label: t.nav_marketing, icon: Megaphone },
        { id: 'reviews', label: t.nav_reviews, icon: Star },
        { id: 'audit_logs', label: t.nav_audit_logs, icon: ShieldCheck },
        { id: 'tech_mobile', label: t.nav_tech_mobile, icon: Smartphone, badge: 'Staff' },
        { id: 'settings', label: t.nav_settings, icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#fcfaf7] border-e border-[#e8dfd6] h-[calc(100vh-57px)] sticky top-[57px] flex flex-col justify-between overflow-y-auto no-print select-none">
      <div className="p-3 space-y-4">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold text-[#8f756f] uppercase tracking-wider">
              {lang === 'ar' ? sec.titleAr : sec.titleEn}
            </div>
            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#3d2027] text-[#f7ede7] shadow-xs'
                      : 'text-[#574347] hover:bg-[#f2e7de] hover:text-[#2d161c]'
                  } ${item.highlight && !isActive ? 'bg-[#f4ebe2]/70 font-semibold text-[#8b5a4b]' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#e5bda3]' : item.highlight ? 'text-[#8b5a4b]' : 'text-[#8f756f]'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-[#5e3842] text-[#fedec7]' : 'bg-[#eadace] text-[#704639]'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        item.countVariant === 'warning'
                          ? 'bg-[#d9534f] text-white animate-pulse'
                          : isActive ? 'bg-[#e5bda3] text-[#3d2027]' : 'bg-[#3d2027] text-white'
                      }`}>
                        {item.count}
                      </span>
                    )}

                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isRtl ? 'rotate-180' : ''
                    } ${isActive ? 'text-[#e5bda3] opacity-100' : 'text-[#ab948e]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Branding Info */}
      <div className="p-3 border-t border-[#e8dfd6] bg-[#f7f2ec] text-[11px] text-[#7d696a]">
        <div className="flex items-center justify-between font-medium">
          <span>Lumière Alex v2.4</span>
          <span className="text-[#a87458]">EGP • Africa/Cairo</span>
        </div>
        <div className="text-[10px] text-[#9c8983] mt-0.5">
          {lang === 'ar' ? 'نظام إدارة شامل ومترابط' : 'Unified Beauty Center ERP'}
        </div>
      </div>
    </aside>
  );
};
