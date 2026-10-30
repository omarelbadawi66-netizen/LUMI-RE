/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  UserCheck, 
  Bell, 
  Search, 
  PlusCircle, 
  CreditCard,
  Sparkles,
  ChevronDown,
  CalendarCheck
} from 'lucide-react';
import { Branch, UserRole } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface HeaderProps {
  lang: 'ar' | 'en';
  toggleLanguage: () => void;
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  branches: Branch[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenGlobalSearch: () => void;
  onQuickNewAppointment: () => void;
  onQuickOpenPos: () => void;
  enableTechnicians?: boolean;
  onToggleTechnicianMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  toggleLanguage,
  currentBranchId,
  setCurrentBranchId,
  branches,
  currentRole,
  setCurrentRole,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenGlobalSearch,
  onQuickNewAppointment,
  onQuickOpenPos,
  enableTechnicians = false,
  onToggleTechnicianMode
}) => {
  const { t, isRtl } = useI18n(lang);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; labelEn: string; labelAr: string }[] = [
    { role: 'business_owner', labelEn: 'Business Owner (Co-Founder)', labelAr: 'شريك مالك (مؤسس)' },
    { role: 'branch_manager', labelEn: 'Branch Manager', labelAr: 'مديرة الفرع' },
    { role: 'receptionist', labelEn: 'Front Desk Receptionist', labelAr: 'موظفة الاستقبال' },
    { role: 'technician', labelEn: 'Beauty Technician', labelAr: 'أخصائية تجميل' },
    { role: 'accountant', labelEn: 'Senior Accountant', labelAr: 'محاسب مالي' },
    { role: 'inventory_manager', labelEn: 'Inventory Manager', labelAr: 'مسؤول المخزون' },
    { role: 'hr_manager', labelEn: 'HR Manager', labelAr: 'مدير الموارد البشرية' }
  ];

  const currentRoleLabel = rolesList.find(r => r.role === currentRole)?.[lang === 'ar' ? 'labelAr' : 'labelEn'] || currentRole;
  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e8ded4] shadow-xs px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Branch Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/aistudio/D4AACD6D-721E-4640-894D-689652E16B08_e4c2c296.png" 
              alt="Lumière Beauty Center"
              className="h-10 w-10 object-contain rounded-full border border-[#d8c2b0] shadow-xs" 
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-title text-lg font-bold tracking-wider text-[#352026]">
                  LUMIÈRE
                </span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#f5ede4] text-[#8c594d] font-semibold">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-[#7d696a]">
                {t.brand_tagline} • <span className="font-medium text-[#4a343a]">Alexandria</span>
              </p>
            </div>
          </div>

          {/* Branch Selector Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => { setBranchDropdownOpen(!branchDropdownOpen); setRoleDropdownOpen(false); }}
              className="flex items-center gap-1.5 text-xs font-medium bg-[#fcf9f6] hover:bg-[#f6eee7] text-[#4a343a] border border-[#e5d6ca] rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#b07d62]" />
              <span className="max-w-[130px] truncate">{lang === 'ar' ? currentBranch.name_ar : currentBranch.name_en}</span>
              <ChevronDown className="w-3 h-3 text-[#9d8980]" />
            </button>

            {branchDropdownOpen && (
              <div className={`absolute top-full mt-1.5 w-64 bg-white border border-[#e5d6ca] rounded-xl shadow-lg p-1.5 z-50 ${isRtl ? 'right-0' : 'left-0'}`}>
                <div className="px-2 py-1 text-[11px] font-semibold text-[#8c746e] uppercase">
                  {lang === 'ar' ? 'اختر الفرع الحالي' : 'Select Active Branch'}
                </div>
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setCurrentBranchId(b.id); setBranchDropdownOpen(false); }}
                    className={`w-full text-start px-2.5 py-2 rounded-lg text-xs flex items-center justify-between ${
                      b.id === currentBranchId ? 'bg-[#f5ede4] text-[#4a2e35] font-semibold' : 'text-[#5c4a4e] hover:bg-[#fbf7f4]'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{lang === 'ar' ? b.name_ar : b.name_en}</div>
                      <div className="text-[10px] text-[#8c7873]">{b.city} • {b.rooms_count} {lang === 'ar' ? 'أجنحة' : 'Suites'}</div>
                    </div>
                    {b.is_main && (
                      <span className="text-[9px] bg-[#d9ab80]/20 text-[#8c502b] px-1.5 py-0.5 rounded font-bold">
                        {lang === 'ar' ? 'الرئيسي' : 'Main'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar (Ctrl+K) */}
        <div className="flex-1 max-w-sm hidden md:block">
          <button
            onClick={onOpenGlobalSearch}
            className="w-full flex items-center justify-between text-xs text-[#8c7b7d] bg-[#f9f5f1] hover:bg-[#f3ede7] border border-[#e8ded4] rounded-xl px-3 py-2 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-[#a68c81] group-hover:text-[#52333b] shrink-0" />
              <span className="truncate">{lang === 'ar' ? 'بحث سريع (عميلات، مواعيد، خدمات...)' : 'Quick search (clients, bookings...)'}</span>
            </div>
            <kbd className="hidden lg:inline-block bg-white text-[#6b5558] border border-[#ded3ca] rounded px-1.5 py-0.5 text-[10px] font-mono shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Action Controls & User Role */}
        <div className="flex items-center gap-2">
          {/* Direct Operation vs Technician Mode Indicator/Toggle */}
          {onToggleTechnicianMode && (
            <button
              onClick={onToggleTechnicianMode}
              className={`hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                !enableTechnicians
                  ? 'bg-[#eef8f1] text-[#1e8e3e] border-[#c8e6c9] hover:bg-[#e2f3e6]'
                  : 'bg-[#f5ede4] text-[#8b5a4b] border-[#e3d0c2] hover:bg-[#ede0d4]'
              }`}
              title={lang === 'ar' ? 'التبديل بين وضع التشغيل المباشر أو تفعيل نظام الأخصائيات والعمولات' : 'Toggle between direct operation and technician commissions'}
            >
              <span className={`w-2 h-2 rounded-full ${!enableTechnicians ? 'bg-[#2e7d32] animate-pulse' : 'bg-[#8b5a4b]'}`} />
              <span>
                {!enableTechnicians
                  ? (lang === 'ar' ? 'بدء تشغيل مباشر (بدون أخصائيات)' : 'Direct Mode (No Technicians)')
                  : (lang === 'ar' ? 'نظام الأخصائيات مفعل' : 'Technicians Enabled')}
              </span>
            </button>
          )}

          {/* Quick New Appointment */}
          <button
            onClick={onQuickNewAppointment}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#42222a] hover:bg-[#30161d] text-[#faede7] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-98"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#e5bda3]" />
            <span>{t.btn_new_appointment}</span>
          </button>

          {/* Quick POS */}
          <button
            onClick={onQuickOpenPos}
            className="inline-flex items-center gap-1.5 bg-[#8b5a4b] hover:bg-[#724538] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-98"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#ffd7be]" />
            <span className="hidden sm:inline">{t.nav_pos}</span>
            <span className="sm:hidden">POS</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-[#61494f] hover:bg-[#f6eee7] transition-colors"
            title={t.notifications}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#c84646] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Role Switcher (Simulates RBAC for Owner, Reception, Tech, Accountant) */}
          <div className="relative">
            <button
              onClick={() => { setRoleDropdownOpen(!roleDropdownOpen); setBranchDropdownOpen(false); }}
              className="flex items-center gap-1.5 text-xs bg-[#f4ebe2] hover:bg-[#ede0d4] text-[#3e262c] border border-[#dcc9bc] rounded-lg px-2.5 py-1.5 transition-colors font-medium"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#915844]" />
              <span className="max-w-[110px] truncate">{currentRoleLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#876f68]" />
            </button>

            {roleDropdownOpen && (
              <div className={`absolute top-full mt-1.5 w-60 bg-white border border-[#e5d6ca] rounded-xl shadow-lg p-1.5 z-50 ${isRtl ? 'left-0' : 'right-0'}`}>
                <div className="px-2 py-1 text-[11px] font-semibold text-[#8c746e] uppercase">
                  {lang === 'ar' ? 'تبديل دور المستخدم (صلاحيات RBAC)' : 'Switch User Role (RBAC Simulation)'}
                </div>
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { setCurrentRole(r.role); setRoleDropdownOpen(false); }}
                    className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      r.role === currentRole ? 'bg-[#f5ede4] text-[#4a2e35] font-bold' : 'text-[#5c4a4e] hover:bg-[#fbf7f4]'
                    }`}
                  >
                    <span>{lang === 'ar' ? r.labelAr : r.labelEn}</span>
                    {r.role === 'business_owner' && (
                      <Sparkles className="w-3 h-3 text-[#b97a4d]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle (AR / EN) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-bold bg-[#fcf9f6] hover:bg-[#f6eee7] text-[#4a343a] border border-[#e5d6ca] rounded-lg px-2.5 py-1.5 transition-colors"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#a87458]" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
