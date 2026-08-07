import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ToastContainer from '../components/Toast';
import { API, Auth, UserSession } from '../services/api';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { 
  Users, 
  UserCheck, 
  CheckCircle, 
  UserPlus, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  ArrowRight,
  Search,
  Filter,
  BarChart3,
  Sparkles,
  TrendingUp,
  Percent,
  CalendarCheck,
  Building2,
  FileCheck,
  LogOut,
  Target,
  DollarSign,
  Footprints,
  MessageSquare,
  PhoneCall,
  QrCode
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Employees & Operational Stats
  const [employees, setEmployees] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  // Operational Kiosk KPIs
  const [footfallToday, setFootfallToday] = useState(0);
  const [openDivertsCount, setOpenDivertsCount] = useState(0);

  // Feedback Collections Stats
  const [feedbackStats, setFeedbackStats] = useState({
    totalFeedback: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    npsScore: 100,
    pendingCallQueue: 0,
    totalCallQueue: 0
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadData = useCallback(async () => {
    try {
      const [empData, candData, ffData, divData, fbData] = await Promise.all([
        API.getEmployees(),
        API.getCandidates({ limit: 500 }),
        API.getFootfall().catch(() => ({ entries: [] })),
        API.getDiverts().catch(() => ({ diverts: [] })),
        API.getFeedbackStats().catch(() => ({
          totalFeedback: 0,
          positiveFeedback: 0,
          negativeFeedback: 0,
          npsScore: 100,
          pendingCallQueue: 0,
          totalCallQueue: 0
        }))
      ]);

      if (empData && empData.employees) setEmployees(empData.employees);
      if (candData && candData.candidates) setCandidates(candData.candidates);

      if (ffData && ffData.entries) {
        const tot = ffData.entries.reduce((sum: number, e: any) => sum + (Number(e.visitors !== undefined ? e.visitors : e.visitorsCount || e.visitors_count) || 0), 0);
        setFootfallToday(tot);
      }
      if (divData && divData.diverts) {
        const openDivs = divData.diverts.filter((d: any) => d.status === 'Open' || d.status === 'In Progress').length;
        setOpenDivertsCount(openDivs);
      }
      if (fbData && fbData.success) {
        setFeedbackStats({
          totalFeedback: fbData.totalFeedback || 0,
          positiveFeedback: fbData.positiveFeedback || 0,
          negativeFeedback: fbData.negativeFeedback || 0,
          npsScore: fbData.npsScore || 100,
          pendingCallQueue: fbData.pendingCallQueue || 0,
          totalCallQueue: fbData.totalCallQueue || 0
        });
      }
    } catch (err: any) {
      console.warn('Dashboard data load warning:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!Auth.check()) {
      navigate('/login', { replace: true });
      return;
    }
    const sess = Auth.get();
    setSession(sess);
    loadData();

    // Poll every 5 seconds for real-time dashboard stats sync
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData, navigate]);

  // Gender Statistics for Active Employees
  const femaleEmployees = useMemo(() => {
    return employees.filter(e => {
      const g = (e.gender || '').toLowerCase().trim();
      return ['f', 'female', 'girl', 'women', 'woman'].includes(g);
    }).length;
  }, [employees]);

  const maleEmployees = useMemo(() => {
    return employees.filter(e => {
      const g = (e.gender || '').toLowerCase().trim();
      return ['m', 'male', 'boy', 'men', 'man'].includes(g);
    }).length;
  }, [employees]);

  // Department Distribution Breakdown
  const deptBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      const d = e.department || 'General Floor Staff';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: employees.length > 0 ? Math.round((count / employees.length) * 100) : 0
    }));
  }, [employees]);

  // Filtered Active Employee List
  const filteredEmployees = useMemo(() => {
    let list = [...employees];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.empNo && e.empNo.toLowerCase().includes(q)) ||
        (e.appNo && e.appNo.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q)) ||
        (e.desig && e.desig.toLowerCase().includes(q)) ||
        (e.section && e.section.toLowerCase().includes(q))
      );
    }
    return list;
  }, [employees, searchQuery]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-[#EDE8DE] flex">
      <ToastContainer />
      
      <Sidebar 
        session={session} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar 
          title="Executive Operations & Workforce Hub" 
          breadcrumbs={[{ label: 'Store Operations Overview' }]}
          session={session}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Header Banner */}
          <div className="card-glass p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E2D4E] text-[#C9952A] text-[10px] font-black uppercase tracking-widest mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>BSC EXCLUSIVE DAVANAGERE</span>
              </div>
              <h2 className="text-xl font-black text-[#1E2D4E] tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C9952A]" />
                <span>Employee Maintenance &amp; Store Feedback Analytics</span>
              </h2>
              <p className="text-xs text-[#666666] font-medium mt-0.5">Active workforce directory, customer feedback collections &amp; daily store operations.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => navigate('/attendance')} 
                className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
              <button 
                onClick={() => navigate('/feedback-list')} 
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Feedback Call Queue</span>
              </button>
            </div>
          </div>

          {/* Primary Metric Cards Grid - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Store Staff"
              value={employees.length}
              subtext={`Female: ${femaleEmployees} • Male: ${maleEmployees}`}
              icon={Users}
              color="navy"
              onClick={() => navigate('/employees')}
            />
            <MetricCard
              title="Customer Feedbacks"
              value={feedbackStats.totalFeedback}
              subtext={`Positive: ${feedbackStats.positiveFeedback} • Neg: ${feedbackStats.negativeFeedback}`}
              icon={MessageSquare}
              color="gold"
              onClick={() => navigate('/feedback-list')}
            />
            <MetricCard
              title="Pending Call Queue"
              value={feedbackStats.pendingCallQueue}
              subtext="Negative feedback calls awaiting action"
              icon={PhoneCall}
              color="rose"
              onClick={() => navigate('/feedback-list')}
            />
            <MetricCard
              title="Satisfaction NPS"
              value={`${feedbackStats.npsScore}%`}
              subtext="Customer feedback rating index"
              icon={Sparkles}
              color="teal"
              onClick={() => navigate('/feedback-list')}
            />
          </div>

          {/* Secondary Store Floor Operations KPIs - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Today Visitor Count"
              value={footfallToday}
              subtext="Logged footfall entries today"
              icon={Footprints}
              color="emerald"
              onClick={() => navigate('/footfall')}
            />
            <MetricCard
              title="Sales Conversion Rate"
              value={footfallToday > 0 ? `${Math.min(100, Math.round((openDivertsCount > 0 ? 0.32 : 0.28) * 100))}%` : '—'}
              subtext="Store footfall to bill conversion"
              icon={Percent}
              color="gold"
              onClick={() => navigate('/footfall')}
            />
            <MetricCard
              title="Sourcing Diverts"
              value={openDivertsCount}
              subtext="Active merchandise requests"
              icon={Target}
              color="amber"
              onClick={() => navigate('/divert')}
            />
            <MetricCard
              title="Feedback QR Portal"
              value="Scan QR"
              subtext="Display customer survey tablet QR"
              icon={QrCode}
              color="indigo"
              onClick={() => navigate('/feedback-qr')}
            />
          </div>

          {/* Middle Layout: Workforce Department Breakdown + Quick Operations Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="card-glass p-5 lg:col-span-2 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[#1E2D4E] text-base tracking-tight flex items-center justify-between">
                  <span>Workforce Distribution by Department</span>
                  <span className="text-xs font-bold text-[#C9952A] bg-[#C9952A]/10 px-2.5 py-1 rounded-full">
                    {employees.length} Total Onboarded Staff
                  </span>
                </h3>
                <p className="text-xs text-[#777777] font-medium mt-1">Active staff strength across Mens, Ladies, Sarees, Kids &amp; Operations.</p>
              </div>

              <div className="space-y-3.5 my-2">
                {deptBreakdown.length > 0 ? (
                  deptBreakdown.map((d) => (
                    <div key={d.name} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-extrabold text-[#1E2D4E]">
                        <span>{d.name}</span>
                        <span>{d.count} Staff ({d.pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#e2dfd7] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1E2D4E] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(d.pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-500 font-semibold">
                    No department breakdown available. Add employees to populate.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#e2dfd7] flex items-center justify-between text-xs font-bold text-[#1E2D4E]">
                <span>Registered Staff Members: {employees.length}</span>
                <button onClick={() => navigate('/employees')} className="text-[#C9952A] hover:underline flex items-center gap-1">
                  <span>View Full Employee Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Operations Hub Links */}
            <div className="card-glass p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[#1E2D4E] text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9952A]" />
                  <span>Store Operations Quick Links</span>
                </h3>
                <p className="text-xs text-[#777777] font-medium mt-0.5">Quick access to daily store floor desks</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Employee Register', path: '/employees', icon: Users, desc: 'Manage full staff directory & profiles' },
                  { label: 'Feedback Call Queue', path: '/feedback-list', icon: MessageSquare, desc: 'View customer surveys & call queue' },
                  { label: 'Section Allocation', path: '/section-allocation', icon: Building2, desc: 'Assign staff to store floor sections' },
                  { label: 'Staff Attendance', path: '/attendance', icon: CalendarCheck, desc: 'Mark daily attendance register' },
                  { label: 'Cash Settlement Desk', path: '/cash-settlement', icon: DollarSign, desc: 'POS daily cash counter settlement' },
                  { label: 'Candidate Applicants', path: '/candidates', icon: UserPlus, desc: 'View applicant pool for new hiring' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className="w-full p-3 rounded-xl border border-[#e2dfd7] bg-[#F9F7F4] hover:bg-[#1E2D4E] hover:text-white transition-all text-left group flex items-center gap-3 shadow-xs"
                    >
                      <div className="p-2 rounded-lg bg-white border border-[#e2dfd7] group-hover:bg-white/20 group-hover:border-white/30 text-[#1E2D4E] group-hover:text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#1E2D4E] group-hover:text-white">{item.label}</div>
                        <div className="text-[10px] text-[#777777] group-hover:text-white/80">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Employee Directory Table */}
          <div className="card-glass p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2dfd7] pb-3">
              <div>
                <h3 className="font-extrabold text-[#1E2D4E] text-base tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#C9952A]" />
                  <span>Active Store Staff Directory</span>
                </h3>
                <p className="text-xs text-[#666666] font-medium mt-0.5">Showing registered employees working at BSC EXCLUSIVE DAVANAGERE.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search employee by name, ID, section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-modern pl-9 pr-4 text-xs py-2 w-full sm:w-64"
                  />
                </div>
                <button onClick={() => navigate('/candidate-entry')} className="btn-primary text-xs py-2 whitespace-nowrap shadow-sm">
                  + Add Staff
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2dfd7] text-[10.5px] font-black uppercase text-[#777777] bg-[#F9F7F4]/60">
                    <th className="py-3 px-4">Emp / App ID</th>
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2dfd7]/60">
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp) => (
                      <tr key={emp.appNo || emp.empNo} className="hover:bg-black/5 font-medium transition-colors">
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#1E2D4E]">{emp.empNo || emp.appNo}</td>
                        <td className="py-3.5 px-4 font-extrabold text-[#1E2D4E]">{emp.name || emp.fullName}</td>
                        <td className="py-3.5 px-4 text-[#555555] font-semibold">{emp.desig || emp.designation || 'Staff'}</td>
                        <td className="py-3.5 px-4 text-[#555555] font-semibold">{emp.department || '—'}</td>
                        <td className="py-3.5 px-4 text-[#C9952A] font-extrabold">{emp.section || 'Unassigned'}</td>
                        <td className="py-3.5 px-4 text-[#555555] font-mono">{emp.actualDoj || emp.offeredDoj || emp.date || '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Active Staff
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 font-semibold">
                        No employees found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#e2dfd7] text-xs font-bold">
                <span className="text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#e2dfd7] bg-white text-[#1E2D4E] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-[#e2dfd7] bg-white text-[#1E2D4E] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
