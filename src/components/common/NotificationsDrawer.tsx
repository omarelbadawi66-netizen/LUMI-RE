/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { SystemNotification } from '../../types/erp';
import { useI18n } from '../../i18n/translations';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  notifications: SystemNotification[];
  onNavigateModule: (moduleName: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  notifications,
  onNavigateModule
}) => {
  const { t, isRtl } = useI18n(lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs animate-in fade-in">
      <div 
        className="w-full max-w-sm bg-white h-full shadow-2xl border-s border-[#e8ded4] flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#e8ded4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#915844]" />
            <h3 className="font-bold text-sm text-[#2d1b20]">
              {t.notifications} ({notifications.length})
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f5ede4] text-[#8c746e]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#9f8a84]">
              {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id}
                className="p-3 rounded-xl border border-[#ebdcd0] bg-[#fcfaf7] hover:bg-[#f6eee7] transition-colors cursor-pointer"
                onClick={() => {
                  if (n.link_module) onNavigateModule(n.link_module);
                  onClose();
                }}
              >
                <div className="flex items-start gap-2.5">
                  {n.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-[#d9534f] shrink-0 mt-0.5" />
                  ) : n.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-[#1976d2] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#352026]">
                      {lang === 'ar' ? n.title_ar : n.title_en}
                    </h4>
                    <p className="text-[11px] text-[#715c61] mt-0.5 leading-relaxed">
                      {lang === 'ar' ? n.message_ar : n.message_en}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#9b8580]">
                      <span className="capitalize">{n.module}</span>
                      <span className="font-semibold text-[#8b5a4b] flex items-center gap-1">
                        {lang === 'ar' ? 'عرض التفاصيل' : 'View module'}
                        <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[#e8ded4] bg-[#fcfaf7] text-center">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-[#f4ebe2] text-[#4a2e35] text-xs font-semibold rounded-xl hover:bg-[#ebdcd0] transition-colors"
          >
            {t.btn_close}
          </button>
        </div>
      </div>
    </div>
  );
};
