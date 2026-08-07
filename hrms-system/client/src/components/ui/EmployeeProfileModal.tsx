import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Briefcase, DollarSign, FileText, UserCheck, ShieldCheck, ExternalLink, Award, User, Heart, Layers, Building } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { API } from '../../services/api';
import { formatName } from '../../utils/formatName';

interface EmployeeProfileModalProps {
  employee: any | null;
  onClose: () => void;
}

export default function EmployeeProfileModal({ employee, onClose }: EmployeeProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'professional' | 'documents'>('overview');

  if (!employee) return null;

  const fileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return API.fileUrl ? API.fileUrl(url) : url;
  };

  const empName = formatName(employee.name || employee.fullName || 'Employee Profile');
  const empCode = employee.employeeCode || employee.empNo || employee.appNo || (employee.id ? `EMP-${employee.id}` : '—');
  const desig = employee.desig || employee.designation || 'Staff Member';
  const dept = employee.department || 'Retail Sales';
  const section = employee.section || 'Unassigned';
  const photo = fileUrl(employee.photoUrl);

  const parseSalary = (val: any) => {
    if (!val) return { base: 0, incentive: 0, total: 0 };
    const str = String(val).trim();
    if (str.includes('|')) {
      const parts = str.split('|');
      const base = parseFloat(parts[0]) || 0;
      const inc = parseFloat(parts[1]) || 0;
      return { base, incentive: inc, total: base + inc };
    }
    if (str.includes('+')) {
      const parts = str.split('+');
      const base = parseFloat(parts[0].replace(/[^0-9.]/g, '')) || 0;
      const inc = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
      return { base, incentive: inc, total: base + inc };
    }
    const base = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    return { base, incentive: 0, total: base };
  };

  const sal = parseSalary(employee.salary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E2D4E]/70 backdrop-blur-md transition-all animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#EDE8DE] rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-2 border-[#C9952A]/50">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1E2D4E] via-[#162340] to-[#0F172A] text-white p-5 sm:p-6 border-b-2 border-[#C9952A]/40 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 shadow-md"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Enlarged Photo / Avatar Picture */}
            <div className="relative shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={empName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#C9952A] shadow-2xl bg-white p-1"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#1E2D4E] to-[#2A3F6D] text-white font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-[#C9952A] shadow-2xl">
                  {employee.initials || empName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md border-2 border-white">
                Active Staff
              </span>
            </div>

            {/* Header Text Details */}
            <div className="text-center sm:text-left space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-black text-white text-xl sm:text-2xl tracking-tight">{empName}</h2>
                <StatusBadge status={employee.status || 'Joined'} size="sm" />
              </div>

              <div className="text-xs text-[#C9952A] font-extrabold font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-amber-300">{empCode}</span>
                <span>•</span>
                <span className="text-white font-bold">{desig}</span>
                <span>•</span>
                <span className="text-white/80 font-normal">Department: {dept}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-white/80">
                {employee.phone && (
                  <a href={`tel:${employee.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-amber-300 font-bold border border-white/10">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{employee.phone}</span>
                  </a>
                )}
                {employee.email && (
                  <a href={`mailto:${employee.email}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/90 font-semibold border border-white/10">
                    <Mail className="w-3.5 h-3.5 text-[#C9952A]" />
                    <span>{employee.email}</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-emerald-300 font-bold">
                  <Layers className="w-3.5 h-3.5" /> Section: {section}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 p-2 sm:px-6 bg-white border-b border-[#e2dfd7] overflow-x-auto text-xs font-bold scrollbar-none sticky top-0 z-10 shadow-xs">
          {[
            { id: 'overview', label: '👤 Employment Overview' },
            { id: 'personal', label: '📋 Personal & Contact Details' },
            { id: 'professional', label: '💼 Experience & Background' },
            { id: 'documents', label: '📄 Verified Documents' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-xs font-black ${
                activeTab === t.id
                  ? 'bg-[#1E2D4E] text-[#C9952A] shadow-md ring-1 ring-[#C9952A]/30'
                  : 'text-[#555555] hover:bg-[#F9F7F4] hover:text-[#1E2D4E]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-[#777777]">Base Monthly Salary</span>
                  <div className="text-lg font-mono font-black text-emerald-800">
                    {sal.base > 0 ? `₹ ${sal.base.toLocaleString('en-IN')}` : (employee.salary || '—')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-[#777777]">Date of Joining (DOJ)</span>
                  <div className="text-base font-extrabold text-[#1E2D4E]">
                    {employee.offeredDoj || employee.estDoj || employee.actualDoj || employee.date || '—'}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-[#777777]">Assigned Section</span>
                  <div className="text-base font-extrabold text-[#C9952A]">{section}</div>
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-3">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#C9952A]" />
                  <span>Compensation & Package Breakdown</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F9F7F4] p-3 rounded-xl border border-[#e2dfd7]">
                    <div className="text-[9px] uppercase font-black text-[#777777] mb-0.5">Base Salary</div>
                    <div className="text-base font-bold text-[#1E2D4E] font-mono">₹{sal.base.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                    <div className="text-[9px] uppercase font-black text-emerald-800 mb-0.5">Monthly Incentive</div>
                    <div className="text-base font-bold text-emerald-700 font-mono">{sal.incentive > 0 ? `+₹${sal.incentive.toLocaleString('en-IN')}` : 'Included'}</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <div className="text-[9px] uppercase font-black text-amber-900 mb-0.5">Total Package</div>
                    <div className="text-base font-black text-slate-900 font-mono">₹{sal.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              {/* Organization Placement */}
              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-3">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C9952A]" />
                  <span>Store Floor & Department Assignment</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Department</span><span className="font-extrabold text-[#1E2D4E] text-sm">{dept}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Floor Section</span><span className="font-extrabold text-[#C9952A] text-sm">{section}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Designation Role</span><span className="font-extrabold text-[#1E2D4E]">{desig}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Reporting Manager</span><span className="font-extrabold text-[#1E2D4E]">{employee.reportingManager || employee.reporting_manager || 'Store Manager'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Store Branch</span><span className="font-extrabold text-[#1E2D4E]">{employee.branch || 'BSC EXCLUSIVE DAVANAGERE'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Shift Schedule</span><span className="font-extrabold text-emerald-800">General Shift (10:00 AM – 09:00 PM)</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C9952A]" />
                  <span>Personal Profile & Identification</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Full Name</span><span className="font-extrabold text-[#1E2D4E] text-sm">{empName}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Gender</span><span className="font-extrabold text-[#1E2D4E]">{employee.gender || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Date of Birth (DOB)</span><span className="font-extrabold text-[#1E2D4E]">{employee.dob || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Blood Group</span><span className="font-black text-rose-700">{employee.bloodGroup || employee.blood_group || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Religion & Caste</span><span className="font-extrabold text-[#1E2D4E]">{employee.religion || '—'} {employee.caste ? `(${employee.caste})` : ''}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Languages Spoken</span><span className="font-extrabold text-[#1E2D4E]">{employee.languagesKnown || employee.languages_known || 'Kannada, English, Hindi'}</span></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9952A]" />
                  <span>Contact Address & Family Background</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Mobile Phone</span><span className="font-extrabold text-[#1E2D4E]">{employee.phone || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Email Address</span><span className="font-extrabold text-[#1E2D4E]">{employee.email || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Father's Details</span><span className="font-extrabold text-[#1E2D4E]">{employee.fatherDetails || employee.father_details || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Mother's Details</span><span className="font-extrabold text-[#1E2D4E]">{employee.motherDetails || employee.mother_details || '—'}</span></div>
                  <div className="sm:col-span-2"><span className="text-[#777777] block text-[10.5px] font-bold">Residential Address</span><span className="font-extrabold text-[#1E2D4E]">{employee.address || employee.cityState || 'Davanagere, Karnataka'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSIONAL & EXPERIENCE */}
          {activeTab === 'professional' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C9952A]" />
                  <span>Work Experience & Prior Employment</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Total Experience</span><span className="font-extrabold text-[#1E2D4E]">{employee.experience || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Retail Industry Experience</span><span className="font-extrabold text-[#1E2D4E]">{employee.retailExperience || employee.retail_experience || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Previous Company</span><span className="font-extrabold text-[#1E2D4E]">{employee.previousCompany || employee.previous_company || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Previous Role / Designation</span><span className="font-extrabold text-[#1E2D4E]">{employee.previousDesignation || employee.previous_designation || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Previous Base Salary</span><span className="font-extrabold text-[#1E2D4E]">{employee.previousSalary || employee.previous_salary || '—'}</span></div>
                  <div><span className="text-[#777777] block text-[10.5px] font-bold">Highest Qualification</span><span className="font-extrabold text-[#1E2D4E]">{employee.qualification || '—'}</span></div>
                </div>
                <div className="pt-2 border-t border-[#e2dfd7]/60">
                  <span className="text-[#777777] block text-[10.5px] mb-1 font-bold uppercase">Executive HR Remarks:</span>
                  <div className="p-3.5 rounded-xl bg-[#F9F7F4] border border-[#e2dfd7] text-xs font-semibold text-[#1E2D4E] italic">
                    {employee.remarks || 'No executive remarks recorded.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9952A]" />
                  <span>Onboarded Documents & Verification Links</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employee.photoUrl && (
                    <a
                      href={fileUrl(employee.photoUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center justify-between font-bold group"
                    >
                      <span>📷 Staff Profile Photo</span>
                      <ExternalLink className="w-4 h-4 text-[#C9952A] group-hover:text-white" />
                    </a>
                  )}
                  {employee.resumeUrl && (
                    <a
                      href={fileUrl(employee.resumeUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center justify-between font-bold group"
                    >
                      <span>📄 Employee Resume / CV</span>
                      <ExternalLink className="w-4 h-4 text-[#C9952A] group-hover:text-white" />
                    </a>
                  )}
                </div>
                {!employee.photoUrl && !employee.resumeUrl && (
                  <div className="p-8 text-center text-[#777777] font-semibold italic">
                    No uploaded document files found for this profile.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9F7F4] border-t border-[#e2dfd7] flex items-center justify-between">
          <div className="text-[11px] text-[#777777] font-bold">
            BSC EXCLUSIVE HRMS • AUTHORIZED EMPLOYEE REGISTER
          </div>
          <button
            onClick={onClose}
            className="btn-primary text-xs px-6 py-2 shadow-md"
          >
            Close Profile Overview
          </button>
        </div>
      </div>
    </div>
  );
}
