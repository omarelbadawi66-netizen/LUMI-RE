/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { AuditLog } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface AuditLogModuleProps {
  lang: 'ar' | 'en';
  auditLogs: AuditLog[];
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({
  lang,
  auditLogs
}) => {
  const { t, isRtl } = useI18n(lang);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return log.action.toLowerCase().includes(q) ||
           log.entity.toLowerCase().includes(q) ||
           log.user_name.toLowerCase().includes(q) ||
           log.details_en.toLowerCase().includes(q) ||
           log.details_ar.includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-xl font-bold text-[#352026]">
              {t.nav_audit_logs}
            </h2>
            <span className="text-[10px] font-bold bg-[#eef8f1] text-[#1e8e3e] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Immutable Audit Trail</span>
            </span>
          </div>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'سجل رقابي غير قابل للتعديل أو الحذف يوثق كل العمليات المالية والخصومات والمواعيد'
              : 'Immutable regulatory log recording all sales, discounts, inventory changes, and commissions'}
          </p>
        </div>

        <div className="text-xs text-[#8c746e] font-semibold">
          {auditLogs.length} {lang === 'ar' ? 'عملية موثقة' : 'logged events'}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#ebdcd0] flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-[#8c746e]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={lang === 'ar' ? 'بحث في سجل الرقابة...' : 'Search audit events...'}
          className="w-full text-xs bg-transparent outline-none text-[#352026]"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#ebdcd0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                <th className="py-3 px-3 text-start">{lang === 'ar' ? 'الوقت' : 'Timestamp'}</th>
                <th className="py-3 px-3 text-start">{lang === 'ar' ? 'المستخدم والدور' : 'User & Role'}</th>
                <th className="py-3 px-3 text-start">{lang === 'ar' ? 'نوع العملية' : 'Action Code'}</th>
                <th className="py-3 px-3 text-start">{lang === 'ar' ? 'البيان والتفاصيل' : 'Details'}</th>
                <th className="py-3 px-3 text-end">{lang === 'ar' ? 'الكيان' : 'Entity ID'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ede4]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#fdfaf7] transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-[#8c746e] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#2e191e]">
                    <div className="font-semibold">{log.user_name}</div>
                    <span className="text-[10px] text-[#8b5a4b] uppercase font-mono">{log.user_role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f5ede4] text-[#8b5a4b] font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#352026] text-xs">
                    <div>{lang === 'ar' ? log.details_ar : log.details_en}</div>
                    {log.old_value && log.new_value && (
                      <div className="text-[10px] text-[#8c746e] mt-0.5 font-mono">
                        {log.old_value} → {log.new_value}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-end font-mono text-[11px] text-[#8c746e]">
                    {log.entity}:{log.entity_id.slice(-6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
