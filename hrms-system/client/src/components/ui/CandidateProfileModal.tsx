import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Briefcase, DollarSign, FileText, UserCheck, ShieldCheck, ExternalLink, Award, User, Heart, Layers, Building, Edit3, Save, RotateCcw, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { API } from '../../services/api';
import { showToast } from '../Toast';
import { formatName } from '../../utils/formatName';
import { BSC_DEPARTMENTS, getSectionsForDepartment } from '../../utils/bscDepartments';

interface CandidateProfileModalProps {
  candidate: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function CandidateProfileModal({ candidate, isOpen, onClose, onUpdated }: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'employment' | 'documents'>('overview');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentCand, setCurrentCand] = useState<any | null>(candidate);

  // Form Edit State
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setCurrentCand(candidate);
    if (candidate) {
      setForm({
        name: candidate.name || candidate.candName || '',
        phone: candidate.phone || candidate.candPhone || '',
        email: candidate.email || candidate.candEmail || '',
        status: candidate.status || candidate.offerStatus || 'New',
        department: candidate.department || 'Mens',
        section: candidate.section || '',
        desig: candidate.desig || candidate.designation || candidate.finalDesignation || '',
        salary: candidate.salary || candidate.salaryOffered || candidate.offeredSalary || '',
        incentive: candidate.incentive || candidate.incentiveOffered || '',
        offeredDoj: candidate.offeredDoj || candidate.estDoj || candidate.doj || '',
        branch: candidate.branch || 'BSC EXCLUSIVE DAVANAGERE',
        gender: candidate.gender || 'MALE',
        dob: candidate.dob ? candidate.dob.split('T')[0] : '',
        qualification: candidate.qualification || '',
        experience: candidate.experience || '',
        retailExperience: candidate.retailExperience || candidate.retail_experience || '',
        previousCompany: candidate.previousCompany || candidate.previous_company || '',
        previousSalary: candidate.previousSalary || candidate.previous_salary || '',
        remarks: candidate.remarks || candidate.offerRemarks || ''
      });
    }
  }, [candidate]);

  if (!isOpen || !currentCand) return null;

  const fileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return API.fileUrl ? API.fileUrl(url) : url;
  };

  const name = formatName(currentCand.name || currentCand.candName || 'Candidate Profile');
  const appNo = currentCand.appNo || currentCand.empNo || currentCand.app_no || (currentCand.id ? `APP-${currentCand.id}` : '—');
  const desig = currentCand.desig || currentCand.designation || currentCand.finalDesignation || 'Candidate';
  const dept = currentCand.department || 'Retail Sales';
  const section = currentCand.section || 'Unassigned';
  const photo = fileUrl(currentCand.photoUrl);

  const availableSections = getSectionsForDepartment(form.department || dept);

  const handleSaveCompleteCandidate = async () => {
    setSaving(true);
    try {
      const appNoKey = currentCand.appNo || currentCand.empNo || currentCand.app_no || currentCand.id;

      const combinedSalary = form.incentive
        ? `${form.salary}|${form.incentive}`
        : form.salary;

      const payload = {
        name: form.name,
        fullName: form.name,
        phone: form.phone,
        email: form.email,
        status: form.status,
        department: form.department,
        section: form.section || null, // Optional floor section
        desig: form.desig,
        designation: form.desig,
        salary: combinedSalary,
        offeredDoj: form.offeredDoj,
        branch: form.branch,
        gender: form.gender,
        dob: form.dob,
        qualification: form.qualification,
        experience: form.experience,
        retailExperience: form.retailExperience,
        previousCompany: form.previousCompany,
        previousSalary: form.previousSalary,
        remarks: form.remarks
      };

      await API.updateCandidate(appNoKey, payload);

      showToast('Candidate profile, status, and department updated successfully!', 'success');

      setCurrentCand({
        ...currentCand,
        ...payload
      });

      setIsEditing(false);

      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      showToast('Failed to update candidate: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E2D4E]/70 backdrop-blur-md transition-all animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#EDE8DE] rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-2 border-[#C9952A]/50">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1E2D4E] via-[#162340] to-[#0F172A] text-white p-5 sm:p-6 border-b-2 border-[#C9952A]/40 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-gold px-3.5 py-1.5 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5"
                title="Edit Status, Department, Designation & Details"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cancel Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 shadow-md"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Enlarged Photo / Avatar */}
            <div className="relative shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#C9952A] shadow-2xl bg-white p-1"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#1E2D4E] to-[#2A3F6D] text-white font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-[#C9952A] shadow-2xl">
                  {currentCand.initials || name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Header Details */}
            <div className="text-center sm:text-left space-y-1.5 min-w-0 pr-24">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-black text-white text-xl sm:text-2xl tracking-tight">{name}</h2>
                <StatusBadge status={currentCand.status || currentCand.offerStatus || 'New'} size="sm" />
              </div>

              <div className="text-xs text-[#C9952A] font-extrabold font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-amber-300">{appNo}</span>
                <span>•</span>
                <span className="text-white font-bold">{desig}</span>
                <span>•</span>
                <span className="text-white/80 font-normal">Department: {dept}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-white/80">
                {currentCand.phone && (
                  <a href={`tel:${currentCand.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-amber-300 font-bold border border-white/10">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentCand.phone}</span>
                  </a>
                )}
                {currentCand.email && (
                  <a href={`mailto:${currentCand.email}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/90 font-semibold border border-white/10">
                    <Mail className="w-3.5 h-3.5 text-[#C9952A]" />
                    <span>{currentCand.email}</span>
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
            { id: 'overview', label: '👤 Candidate Overview' },
            { id: 'screening', label: '📋 Shortlisting & Screening Answers' },
            { id: 'employment', label: '💼 Experience & Qualification' },
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {!isEditing ? (
            /* VIEW MODE */
            <>
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-black text-[#777777]">Pipeline Status</span>
                      <div className="text-sm font-black text-[#1E2D4E]">
                        <StatusBadge status={currentCand.status || currentCand.offerStatus || 'New'} size="sm" />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-black text-[#777777]">Target Department</span>
                      <div className="text-base font-extrabold text-[#1E2D4E]">{dept}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-black text-[#777777]">Assigned Floor Section</span>
                      <div className="text-base font-extrabold text-[#C9952A]">{section}</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-3">
                    <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#C9952A]" />
                      <span>Role Placement & Compensation</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Designation Role</span><span className="font-extrabold text-[#1E2D4E] text-sm">{desig}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Offered Salary</span><span className="font-extrabold text-emerald-800 text-sm font-mono">{currentCand.salary ? `₹${currentCand.salary}` : '—'}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Estimated DOJ</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.offeredDoj || currentCand.estDoj || currentCand.doj || '—'}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Store Branch</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.branch || 'BSC EXCLUSIVE DAVANAGERE'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'screening' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-3">
                    <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C9952A]" />
                      <span>Recruiter Screening & Remarks</span>
                    </h4>
                    <div className="p-4 rounded-xl bg-[#F9F7F4] border border-[#e2dfd7] text-xs font-semibold text-[#1E2D4E]">
                      {currentCand.remarks || currentCand.offerRemarks || 'No screening notes recorded.'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                    <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#C9952A]" />
                      <span>Work Experience & Background</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Total Work Experience</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.experience || '—'}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Retail Industry Experience</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.retailExperience || currentCand.retail_experience || '—'}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Previous Company</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.previousCompany || currentCand.previous_company || '—'}</span></div>
                      <div><span className="text-[#777777] block text-[10.5px] font-bold">Highest Qualification</span><span className="font-extrabold text-[#1E2D4E]">{currentCand.qualification || '—'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-white border border-[#e2dfd7] shadow-xs space-y-4">
                    <h4 className="font-black text-[#1E2D4E] uppercase text-xs tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C9952A]" />
                      <span>Verified Documents & Uploads</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fileUrl(currentCand.photoUrl) && (
                        <a
                          href={fileUrl(currentCand.photoUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center justify-between font-bold group"
                        >
                          <span>📷 Profile Photo</span>
                          <ExternalLink className="w-4 h-4 text-[#C9952A] group-hover:text-white" />
                        </a>
                      )}
                      {fileUrl(currentCand.aadhaarUrl || currentCand.aadharUrl || currentCand.aadhaar_url || currentCand.aadhar_url) && (
                        <a
                          href={fileUrl(currentCand.aadhaarUrl || currentCand.aadharUrl || currentCand.aadhaar_url || currentCand.aadhar_url)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center justify-between font-bold group"
                        >
                          <span>📄 Aadhaar Card Document</span>
                          <ExternalLink className="w-4 h-4 text-[#C9952A] group-hover:text-white" />
                        </a>
                      )}
                      {fileUrl(currentCand.resumeUrl) && (
                        <a
                          href={fileUrl(currentCand.resumeUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center justify-between font-bold group"
                        >
                          <span>📑 Candidate Resume / CV</span>
                          <ExternalLink className="w-4 h-4 text-[#C9952A] group-hover:text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* EDIT FORM MODE */
            <div className="space-y-4 animate-fade-in bg-white p-5 rounded-2xl border border-[#C9952A]/40 shadow-md">
              <h3 className="font-black text-[#1E2D4E] text-sm uppercase tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C9952A]" />
                <span>Edit Candidate Status, Department, Designation & Section</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Candidate Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-black text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  >
                    <option value="New">🌱 New Candidate</option>
                    <option value="Shortlisted">📋 Shortlisted</option>
                    <option value="1st Call">📞 1st Call Completed</option>
                    <option value="2nd Call">📞 2nd Call Completed</option>
                    <option value="Interview Scheduled">📅 Interview Scheduled</option>
                    <option value="Offer Issued">📄 Offer Issued</option>
                    <option value="Joined">🎉 Joined (Active Staff)</option>
                    <option value="Hold">⏸ On Hold</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Target Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value, section: '' })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  >
                    {BSC_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1 flex items-center justify-between">
                    <span>Floor Section</span>
                    <span className="text-[10px] text-[#777777] uppercase font-bold">(Optional)</span>
                  </label>
                  {availableSections.length > 0 ? (
                    <select
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#C9952A] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                    >
                      <option value="">-- Optional / Unassigned --</option>
                      {availableSections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Optional section (e.g. Ethnic Wear)"
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#C9952A] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Designation Role</label>
                  <input
                    type="text"
                    value={form.desig}
                    onChange={(e) => setForm({ ...form, desig: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Full Candidate Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Offered Monthly Salary (₹)</label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-mono font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-bold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#1E2D4E] uppercase mb-1">Recruiter & Screening Remarks</label>
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dfd7] text-xs font-semibold text-[#1E2D4E] outline-none focus:ring-2 focus:ring-[#C9952A]/40"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9F7F4] border-t border-[#e2dfd7] flex items-center justify-between">
          <div className="text-[11px] text-[#777777] font-bold">
            BSC EXCLUSIVE RECRUITMENT CRM
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#e2dfd7] bg-white font-extrabold text-xs text-[#555555]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompleteCandidate}
                  disabled={saving}
                  className="btn-gold text-xs px-6 py-2 shadow-md flex items-center gap-1.5 font-black"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Candidate Details'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary text-xs px-6 py-2 shadow-md"
              >
                Close Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
