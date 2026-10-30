/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lumière Beauty Center ERP - Main Application Entrypoint
 * Alexandria, Egypt. Arabic / English RTL Bilingual.
 */

import React, { useState } from 'react';
import { useErpStore } from './erp/store/erpStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { DashboardModule } from './components/modules/DashboardModule';
import { AppointmentsModule } from './components/modules/AppointmentsModule';
import { PosModule } from './components/modules/PosModule';
import { ServicesModule } from './components/modules/ServicesModule';
import { CashRegisterModule } from './components/modules/CashRegisterModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { CustomersModule } from './components/modules/CustomersModule';
import { ReceptionDeskModule } from './components/modules/ReceptionDeskModule';
import { HrPayrollModule } from './components/modules/HrPayrollModule';
import { FinancePartnersModule } from './components/modules/FinancePartnersModule';
import { MarketingLoyaltyModule } from './components/modules/MarketingLoyaltyModule';
import { AuditLogModule } from './components/modules/AuditLogModule';
import { SettingsReviewsModule } from './components/modules/SettingsReviewsModule';
import { TechnicianMobileModule } from './components/modules/TechnicianMobileModule';
import { Customer, Appointment } from './types/erp';

export default function App() {
  const store = useErpStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const lowStockCount = store.products.filter(p => p.current_stock <= p.min_stock).length;
  const pendingAppointmentsCount = store.appointments.filter(a => a.status === 'confirmed').length;

  const handleOpenPosForAppointment = (appt: Appointment) => {
    store.setActiveModule('pos');
  };

  const handleBookForCustomer = (cust: Customer) => {
    store.setActiveModule('appointments');
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#241a1c] flex flex-col font-sans selection:bg-[#ecdcd1] selection:text-[#3d2027]">
      {/* Top Navigation Header */}
      <Header
        lang={store.lang}
        toggleLanguage={store.toggleLanguage}
        currentBranchId={store.currentBranchId}
        setCurrentBranchId={store.setCurrentBranchId}
        branches={store.branches}
        currentRole={store.currentRole}
        setCurrentRole={store.setCurrentRole}
        unreadNotificationsCount={store.notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenGlobalSearch={() => setIsSearchOpen(true)}
        onQuickNewAppointment={() => store.setActiveModule('appointments')}
        onQuickOpenPos={() => store.setActiveModule('pos')}
        enableTechnicians={store.enableTechnicians}
        onToggleTechnicianMode={() => store.setEnableTechnicians(!store.enableTechnicians)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          lang={store.lang}
          activeModule={store.activeModule}
          setActiveModule={store.setActiveModule}
          currentRole={store.currentRole}
          lowStockCount={lowStockCount}
          pendingAppointmentsCount={pendingAppointmentsCount}
        />

        {/* Dynamic Workspace Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-57px)]">
          {store.activeModule === 'dashboard' && (
            <DashboardModule
              lang={store.lang}
              appointments={store.appointments}
              customers={store.customers}
              employees={store.employees}
              products={store.products}
              services={store.services}
              expenses={store.expenses}
              cashRegister={store.cashRegister}
              onNavigateModule={store.setActiveModule}
              onOpenNewAppointment={() => store.setActiveModule('appointments')}
              onOpenPos={() => store.setActiveModule('pos')}
            />
          )}

          {store.activeModule === 'reception' && (
            <ReceptionDeskModule
              lang={store.lang}
              appointments={store.appointments}
              customers={store.customers}
              onUpdateStatus={store.updateAppointmentStatus}
              onOpenPosForAppointment={handleOpenPosForAppointment}
              onQuickNewAppointment={() => store.setActiveModule('appointments')}
            />
          )}

          {store.activeModule === 'appointments' && (
            <AppointmentsModule
              lang={store.lang}
              appointments={store.appointments}
              customers={store.customers}
              employees={store.employees}
              services={store.services}
              currentBranchId={store.currentBranchId}
              onUpdateStatus={store.updateAppointmentStatus}
              onCreateAppointment={store.createAppointment}
              onOpenPosForAppointment={handleOpenPosForAppointment}
              onOpenNewCustomerModal={() => store.setActiveModule('customers')}
            />
          )}

          {store.activeModule === 'pos' && (
            <PosModule
              lang={store.lang}
              customers={store.customers}
              services={store.services}
              products={store.products}
              currentBranchId={store.currentBranchId}
              onCompleteSale={store.completePosSale}
            />
          )}

          {store.activeModule === 'services' && (
            <ServicesModule
              lang={store.lang}
              services={store.services}
              products={store.products}
            />
          )}

          {store.activeModule === 'cash_register' && (
            <CashRegisterModule
              lang={store.lang}
              cashRegister={store.cashRegister}
              currentRole={store.currentRole}
              onCloseShift={store.closeCashRegister}
            />
          )}

          {store.activeModule === 'inventory' && (
            <InventoryModule
              lang={store.lang}
              products={store.products}
              inventoryMovements={store.inventoryMovements}
              onAdjustStock={store.adjustProductStock}
            />
          )}

          {store.activeModule === 'customers' && (
            <CustomersModule
              lang={store.lang}
              customers={store.customers}
              appointments={store.appointments}
              currentBranchId={store.currentBranchId}
              onAddCustomer={store.addCustomer}
              onBookAppointmentForCustomer={handleBookForCustomer}
            />
          )}

          {(store.activeModule === 'hr' || store.activeModule === 'payroll') && (
            <HrPayrollModule
              lang={store.lang}
              employees={store.employees}
              appointments={store.appointments}
            />
          )}

          {(store.activeModule === 'finance' || store.activeModule === 'expenses' || store.activeModule === 'purchasing') && (
            <FinancePartnersModule
              lang={store.lang}
              partners={store.partners}
              expenses={store.expenses}
              currentRole={store.currentRole}
              onRecordPartnerDrawing={store.recordPartnerDrawing}
              onAddExpense={store.addExpense}
              onApproveExpense={store.approveExpense}
            />
          )}

          {store.activeModule === 'marketing' && (
            <MarketingLoyaltyModule lang={store.lang} />
          )}

          {(store.activeModule === 'settings' || store.activeModule === 'reviews') && (
            <SettingsReviewsModule
              lang={store.lang}
              branches={store.branches}
            />
          )}

          {store.activeModule === 'audit_logs' && (
            <AuditLogModule
              lang={store.lang}
              auditLogs={store.auditLogs}
            />
          )}

          {store.activeModule === 'tech_mobile' && (
            <TechnicianMobileModule
              lang={store.lang}
              appointments={store.appointments}
              employees={store.employees}
              products={store.products}
              onUpdateStatus={store.updateAppointmentStatus}
            />
          )}
        </main>
      </div>

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={store.lang}
        customers={store.customers}
        appointments={store.appointments}
        services={store.services}
        products={store.products}
        onSelectCustomer={(c) => { store.setActiveModule('customers'); }}
        onSelectAppointment={(a) => { store.setActiveModule('appointments'); }}
        onSelectService={(s) => { store.setActiveModule('services'); }}
        onSelectProduct={(p) => { store.setActiveModule('inventory'); }}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        lang={store.lang}
        notifications={store.notifications}
        onNavigateModule={(mod) => store.setActiveModule(mod)}
      />
    </div>
  );
}
