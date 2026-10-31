/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Calculator,
  UserCheck,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  DollarSign,
  Printer,
  FileText,
  Percent,
  Plus
} from 'lucide-react';
import { Employee, AttendanceRecord, Appointment } from '../../types/erp';
import { useI18n } from '../../i18n/translations';
import { calculatePayrollNetSalary } from '../../erp/engine/rules';

interface HrPayrollModuleProps {
  lang: 'ar' | 'en';
  employees: Employee[];
  appointments: Appointment[];
}

export const HrPayrollModule: React.FC<HrPayrollModuleProps> = ({
  lang,
  employees,
  appointments
}) => {
  const { t, isRtl } = useI18n(lang);
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll'>('payroll');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(employees[0] || null);

  // Compute live technician commissions earned for each employee
  const getTechnicianCommissions = (empId: string) => {
    return appointments
      .filter(a => a.technician_id === empId && a.status === 'completed' && a.calculated_commission)
      .reduce((sum, a) => sum + (a.calculated_commission || 0), 0) + 1200; // adding month to date prior baseline
  };

  // Sample attendance records for today
  const attendanceList = [
    { empId: 'emp-sarah', name: 'Sarah Gamal', role: 'Senior Makeup', checkIn: '09:45', status: 'present', late: 0, overtime: 60 },
    { empId: 'emp-mariam', name: 'Mariam Soliman', role: 'Skin Specialist', checkIn: '10:05', status: 'late', late: 15, overtime: 0 },
    { empId: 'emp-dina', name: 'Dina Fouad', role: 'Brows & Skin', checkIn: '09:50', status: 'present', late: 0, overtime: 30 },
    { empId: 'emp-nourhan', name: 'Nourhan Tarek', role: 'Lashes & Brows', checkIn: '10:00', status: 'present', late: 0, overtime: 0 },
    { empId: 'emp-salma', name: 'Salma Ezzat', role: 'Front Desk', checkIn: '08:55', status: 'present', late: 0, overtime: 0 },
    { empId: 'emp-tamer', name: 'Tamer Nabil', role: 'Finance', checkIn: '09:00', status: 'present', late: 0, overtime: 0 }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4.5 rounded-2xl border border-[#ebdcd0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-xl font-bold text-[#352026]">
            {t.nav_payroll} & {t.nav_hr_attendance}
          </h2>
          <p className="text-xs text-[#8c746e] mt-0.5">
            {lang === 'ar'
              ? 'محرك احتساب الرواتب والعمولات (نسبة / ثابت / هجين)، الحضور والانصراف، وكشوف المرتبات'
              : 'Technician commission engine (Percentage/Fixed/Hybrid), daily attendance, and payslip generation'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-[#f5ede4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'payroll' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'كشوف الرواتب والعمولات' : 'Payroll & Commissions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'employees' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فريق العمل' : 'Staff Directory'}</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'bg-[#3d2027] text-white shadow-xs' : 'text-[#4a2e35]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'حضور اليوم' : "Today's Attendance"}</span>
          </button>
        </div>
      </div>

      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Payroll Summary Table */}
          <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#352026]">
                  {lang === 'ar' ? 'كشف رواتب شهر أكتوبر 2026 (فرع سابا باشا)' : 'Payroll Statement - October 2026 (Saba Pasha)'}
                </h3>
                <p className="text-[11px] text-[#8c746e]">
                  {lang === 'ar' ? 'احتساب تلقائي للعمولات المكتسبة والبدلات والخصومات' : 'Automated calculation of base salaries, earned commissions and net pay'}
                </p>
              </div>

              <span className="text-xs font-bold bg-[#eef8f1] text-[#1e8e3e] px-3 py-1 rounded-xl">
                {lang === 'ar' ? 'جاهز للاعتماد' : 'Ready for Approval'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-[#fcfaf7] border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                    <th className="py-2.5 px-3 text-start">{t.hr_emp_name}</th>
                    <th className="py-2.5 px-3 text-start">{t.hr_model}</th>
                    <th className="py-2.5 px-3 text-end">{t.hr_base_salary}</th>
                    <th className="py-2.5 px-3 text-end">{t.hr_comm_earned}</th>
                    <th className="py-2.5 px-3 text-end">{lang === 'ar' ? 'بدلات وإضافي' : 'Allowances'}</th>
                    <th className="py-2.5 px-3 text-end">{lang === 'ar' ? 'خصومات' : 'Deductions'}</th>
                    <th className="py-2.5 px-3 text-end font-bold">{t.hr_net_salary}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'قسيمة الراتب' : 'Payslip'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ede4]">
                  {employees.map(emp => {
                    const commission = getTechnicianCommissions(emp.id);
                    const calc = calculatePayrollNetSalary({
                      baseSalary: emp.base_salary,
                      allowances: emp.base_salary > 0 ? 500 : 0,
                      commissionEarned: commission,
                      overtimeMinutes: 120,
                      bonuses: 300,
                      deductions: 100,
                      advances: 0
                    });

                    return (
                      <tr key={emp.id} className="hover:bg-[#fdfaf7] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#2e191e]">
                          <div>{emp.full_name}</div>
                          <div className="text-[10px] text-[#8c746e] font-normal">{lang === 'ar' ? emp.job_title_ar : emp.job_title_en}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f5ede4] text-[#8b5a4b]">
                            {emp.commission_model === 'hybrid' ? t.hr_model_hybrid :
                             emp.commission_model === 'commission_only' ? t.hr_model_comm_only :
                             t.hr_model_fixed}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-end text-[#715c61]">
                          {emp.base_salary > 0 ? `${emp.base_salary.toLocaleString()} ${t.currency}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-end font-semibold text-[#2e7d32]">
                          {commission > 0 ? `+${commission.toLocaleString()} ${t.currency}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-end text-[#715c61]">
                          +{calc.allowances + calc.overtimePay + calc.bonuses} {t.currency}
                        </td>
                        <td className="py-3 px-3 text-end text-[#d9534f]">
                          -{calc.totalDeductions} {t.currency}
                        </td>
                        <td className="py-3 px-3 text-end font-bold text-sm text-[#2e191e]">
                          {calc.netSalary.toLocaleString()} {t.currency}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedPayslipEmp(emp)}
                            className="px-2.5 py-1 rounded-lg bg-[#3d2027] text-white hover:bg-[#2c141a] text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FileText className="w-3 h-3 text-[#e5bda3]" />
                            <span>{lang === 'ar' ? 'عرض القسيمة' : 'Payslip'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Payslip Modal */}
          {selectedPayslipEmp && (
            <div className="bg-white rounded-2xl border border-[#ebdcd0] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebdcd0] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8b5a4b]" />
                  <h3 className="font-bold text-sm text-[#352026]">
                    {lang === 'ar' ? `قسيمة الراتب المعتمدة: ${selectedPayslipEmp.full_name}` : `Certified Payslip: ${selectedPayslipEmp.full_name}`}
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#f5ede4] hover:bg-[#ede0d4] text-[#4a2e35] text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8b5a4b]" />
                  <span>{t.btn_print}</span>
                </button>
              </div>

              {/* Payslip Card */}
              <div className="p-4 bg-[#fdfcfb] border border-[#eee4dc] rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#f2e7de] pb-3">
                  <div>
                    <span className="text-[#8c746e] block text-[10px]">{t.hr_emp_name}</span>
                    <span className="font-bold text-[#2e191e]">{selectedPayslipEmp.full_name}</span>
                  </div>
                  <div>
                    <span className="text-[#8c746e] block text-[10px]">{t.hr_job_title}</span>
                    <span className="font-semibold text-[#2e191e]">{selectedPayslipEmp.job_title_en}</span>
                  </div>
                  <div>
                    <span className="text-[#8c746e] block text-[10px]">{t.hr_model}</span>
                    <span className="font-semibold text-[#8b5a4b]">{selectedPayslipEmp.commission_model}</span>
                  </div>
                  <div>
                    <span className="text-[#8c746e] block text-[10px]">{lang === 'ar' ? 'فترة الاستحقاق' : 'Pay Period'}</span>
                    <span className="font-bold text-[#2e191e]">October 2026</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span>{t.hr_base_salary}</span>
                    <span className="font-semibold">{selectedPayslipEmp.base_salary} {t.currency}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[#2e7d32]">
                    <span>{t.hr_comm_earned} (Services Completed)</span>
                    <span className="font-bold">+{getTechnicianCommissions(selectedPayslipEmp.id)} {t.currency}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Allowances & Bonuses</span>
                    <span className="font-semibold">+800 {t.currency}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[#d9534f]">
                    <span>Social Insurance & Deductions</span>
                    <span className="font-semibold">-100 {t.currency}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-[#ded2c6] text-sm font-bold text-[#2e191e]">
                    <span>NET SALARY PAYABLE:</span>
                    <span>
                      {(selectedPayslipEmp.base_salary + getTechnicianCommissions(selectedPayslipEmp.id) + 700)} {t.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map(emp => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#f4ebe2] text-[#8b5a4b] font-bold text-sm flex items-center justify-center shrink-0">
                    {emp.full_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2e191e]">{emp.full_name}</h4>
                    <p className="text-xs text-[#8c746e]">
                      {lang === 'ar' ? emp.job_title_ar : emp.job_title_en} • {emp.department}
                    </p>
                    <p className="text-[11px] text-[#715c61]">{emp.phone} • {emp.email}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f5ede4] text-[#8b5a4b]">
                  {emp.employment_type}
                </span>
              </div>

              <div className="p-2.5 bg-[#fcfaf7] rounded-xl border border-[#ebdcd0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8c746e] block text-[10px]">{t.hr_model}</span>
                  <span className="font-bold text-[#2e191e] capitalize">{emp.commission_model}</span>
                </div>
                <div className="text-end">
                  <span className="text-[#8c746e] block text-[10px]">{t.hr_base_salary}</span>
                  <span className="font-bold text-[#2e191e]">{emp.base_salary} {t.currency}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 text-[10px]">
                {emp.skills.map((s, idx) => (
                  <span key={idx} className="bg-[#f5ede4] text-[#8b5a4b] font-semibold px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-[#ebdcd0] p-4.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#352026]">
              {lang === 'ar' ? 'سجل حضور وانصراف الموظفات اليوم (30 أكتوبر 2026)' : "Staff Attendance Roster (30 Oct 2026)"}
            </h3>
            <span className="text-xs font-semibold text-[#2e7d32]">
              6 {lang === 'ar' ? 'حاضرات' : 'Present'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-[#fcfaf7] border-b border-[#ebdcd0] text-[11px] font-bold text-[#8c746e] uppercase">
                  <th className="py-2.5 px-3 text-start">{t.hr_emp_name}</th>
                  <th className="py-2.5 px-3 text-start">{t.hr_job_title}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'وقت الحضور' : 'Check-In'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'دقائق التأخير' : 'Late (min)'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'ساعات إضافية' : 'Overtime'}</th>
                  <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ede4]">
                {attendanceList.map((att, idx) => (
                  <tr key={idx} className="hover:bg-[#fdfaf7] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#2e191e]">{att.name}</td>
                    <td className="py-3 px-3 text-[#715c61]">{att.role}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2e191e]">{att.checkIn}</td>
                    <td className="py-3 px-3 text-center">
                      {att.late > 0 ? (
                        <span className="text-[#d9534f] font-bold">+{att.late}m</span>
                      ) : (
                        <span className="text-[#2e7d32]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-[#715c61]">
                      {att.overtime > 0 ? `+${att.overtime}m` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        att.status === 'present' ? 'bg-[#eef8f1] text-[#1e8e3e]' : 'bg-[#fff0f0] text-[#d32f2f]'
                      }`}>
                        {att.status === 'present' ? (lang === 'ar' ? 'حاضرة' : 'Present') : (lang === 'ar' ? 'متأخرة' : 'Late')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
