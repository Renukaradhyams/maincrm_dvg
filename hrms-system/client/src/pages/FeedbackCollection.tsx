import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ToastContainer, { showToast } from '../components/Toast';
import { API, Auth, UserSession } from '../services/api';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Calendar, 
  TrendingUp, 
  Phone, 
  User, 
  X, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function FeedbackCollection() {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Feedbacks & Stats
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, positive: 0, negative: 0, npsScore: 100 });
  const [loading, setLoading] = useState<boolean>(true);

  // Date Filters: all, today, yesterday, week, month, last_month, custom
  const [datePreset, setDatePreset] = useState<string>('all');
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');

  // Selected Feedback Detail Modal
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  const getISTDate = (d: Date = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + istOffset);
    return istDate.toISOString().split('T')[0];
  };

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      const todayStr = getISTDate(new Date());

      if (datePreset === 'today') {
        params.date = todayStr;
      } else if (datePreset === 'yesterday') {
        const y = new Date(Date.now() - 86400000);
        params.date = getISTDate(y);
      } else if (datePreset === 'week') {
        const w = new Date(Date.now() - 6 * 86400000);
        params.startDate = getISTDate(w);
        params.endDate = todayStr;
      } else if (datePreset === 'month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        params.startDate = getISTDate(start);
        params.endDate = todayStr;
      } else if (datePreset === 'last_month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        params.startDate = getISTDate(start);
        params.endDate = getISTDate(end);
      } else if (datePreset === 'custom') {
        if (startDateInput) params.startDate = startDateInput;
        if (endDateInput) params.endDate = endDateInput;
      }

      if (sentimentFilter === 'negative') params.isNegative = 'true';
      if (sentimentFilter === 'positive') params.isNegative = 'false';
      if (search.trim()) params.search = search.trim();

      const res = await API.getFeedbacks(params);
      if (res && res.success) {
        setFeedbacks(res.feedbacks || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err: any) {
      console.warn('getFeedbacks background sync:', err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [datePreset, startDateInput, endDateInput, sentimentFilter, search]);

  useEffect(() => {
    if (!Auth.check()) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(Auth.get());
    loadFeedbacks();

    // Auto-refresh every 5 seconds for live feedback collection updates
    const interval = setInterval(() => {
      loadFeedbacks();
    }, 5000);
    return () => clearInterval(interval);
  }, [navigate, loadFeedbacks]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (feedbacks.length === 0) {
      showToast('No feedback records to export', 'error');
      return;
    }

    const headers = ['Feedback ID', 'Date', 'Customer Name', 'Mobile', 'Sentiment', 'Answers Summary', 'Customer Voice Notes'];
    const rows = feedbacks.map(f => [
      f.id || '',
      f.entryDate || '',
      `"${(f.customerName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(f.mobile || '').replace(/"/g, '""')}"`,
      f.isNegative ? 'Negative / Escalated' : 'Positive / Satisfied',
      `"${JSON.stringify(f.answers || {}).replace(/"/g, '""')}"`,
      `"${(f.voice || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BSC_Customer_Feedbacks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported feedback data to CSV', 'success');
  };

  return (
    <div className="min-h-screen bg-[#EDE8DE] flex">
      <ToastContainer />
      <Sidebar session={session} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Customer Feedback Collection & Analytics"
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Feedback Collection' }]}
          session={session}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 lg:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Header & Quick Action Bar */}
          <div className="card-glass p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2D4E] text-[#C9952A] text-[10px] font-black uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BSC Exclusive Davanagere</span>
              </div>
              <h2 className="text-xl font-black text-[#1E2D4E] tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C9952A]" />
                <span>Customer Feedback Repository</span>
              </h2>
              <p className="text-xs text-[#666666] font-medium mt-0.5">Real-time log of customer survey responses, satisfaction scores &amp; voice of customer notes.</p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={loadFeedbacks}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#e2dfd7] text-[#1E2D4E] text-xs font-extrabold hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report (CSV)</span>
              </button>
            </div>
          </div>

          {/* Feedback Dashboard KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Feedbacks */}
            <div className="card-glass p-5 flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-black uppercase tracking-wider text-[#777777]">Total Feedbacks</div>
                <div className="text-2xl font-black text-[#1E2D4E] mt-1">{stats.total || feedbacks.length}</div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> All Submitted Visits
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1E2D4E]/10 text-[#1E2D4E] flex items-center justify-center font-black">
                <MessageSquare className="w-6 h-6 text-[#1E2D4E]" />
              </div>
            </div>

            {/* Satisfaction Rate / NPS */}
            <div className="card-glass p-5 flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-black uppercase tracking-wider text-[#777777]">Satisfaction Rate</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{stats.npsScore || 100}%</div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">CSAT Index Score</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                <Star className="w-6 h-6 fill-emerald-500 text-emerald-600" />
              </div>
            </div>

            {/* Positive Feedbacks */}
            <div className="card-glass p-5 flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-black uppercase tracking-wider text-[#777777]">Positive Ratings</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{stats.positive || 0}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Satisfied Shoppers</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6" />
              </div>
            </div>

            {/* Negative Escalations */}
            <div className="card-glass p-5 flex items-center justify-between border-l-4 border-l-rose-500">
              <div>
                <div className="text-[10.5px] font-black uppercase tracking-wider text-[#777777]">Needs Follow-up</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{stats.negative || 0}</div>
                <div className="text-[11px] text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Auto-Escalated to Queue
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ThumbsDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="card-glass p-4 flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, mobile, or feedback text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern pl-9 py-2 text-xs font-semibold"
              />
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-[#C9952A] hidden sm:block" />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="select-modern text-xs font-bold py-2"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive / Satisfied</option>
                <option value="negative">Negative / Needs Follow-up</option>
              </select>

              {/* Date Preset Filter */}
              <Calendar className="w-3.5 h-3.5 text-[#C9952A] hidden sm:block ml-2" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="select-modern text-xs font-bold py-2"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>

              {datePreset === 'custom' && (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <input
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="input-modern text-xs font-semibold py-1.5"
                    placeholder="Start"
                  />
                  <span className="text-xs font-bold text-gray-500">to</span>
                  <input
                    type="date"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="input-modern text-xs font-semibold py-1.5"
                    placeholder="End"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Feedback Data Table */}
          <div className="card-glass p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3">
              <h3 className="font-extrabold text-[#1E2D4E] text-sm uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C9952A]" />
                <span>Collected Survey Log ({feedbacks.length})</span>
              </h3>
              <span className="text-xs text-[#777777] font-semibold">Showing real-time records</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-gray-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#C9952A]" />
                <span>Loading feedback entries...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-gray-500 space-y-2">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                <div className="text-sm text-[#1E2D4E] font-extrabold">No Feedback Submissions Found</div>
                <p className="text-gray-400 font-medium">Customer responses from the Customer Experience Survey will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2dfd7] text-[10.5px] font-black uppercase text-[#777777] bg-[#F9F7F4]/80">
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Overall Experience</th>
                      <th className="py-3 px-4">Product Found</th>
                      <th className="py-3 px-4">Sentiment</th>
                      <th className="py-3 px-4">Voice of Customer</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2dfd7]/60">
                    {feedbacks.map((f: any) => {
                      const ans = f.answers || {};
                      const overallExp = ans['q1'] || 'Satisfied';
                      const productFound = ans['q2'] || 'Yes';

                      return (
                        <tr key={f.id} className="hover:bg-black/5 font-medium transition-colors">
                          <td className="py-3.5 px-4 text-[#555555] font-mono text-[11px]">
                            {f.entryDate || (f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : 'Today')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-[#1E2D4E] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#C9952A]" />
                              <span>{f.customerName || 'Anonymous'}</span>
                            </div>
                            {f.mobile && (
                              <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{f.mobile}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#1E2D4E]/10 text-[#1E2D4E]">
                              {overallExp}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-bold text-gray-700">{productFound}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {f.isNegative ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 flex items-center gap-1 w-max shadow-xs">
                                <ThumbsDown className="w-3 h-3" /> Negative / Escalated
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max shadow-xs">
                                <ThumbsUp className="w-3 h-3" /> Satisfied
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-[#555555] font-medium text-[11px]">
                            {f.voice || 'No extra comments'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedFeedback(f)}
                              className="px-3 py-1.5 rounded-xl border border-[#1E2D4E] text-[#1E2D4E] font-extrabold text-[11px] hover:bg-[#1E2D4E] hover:text-white transition-all flex items-center gap-1 ml-auto shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Full Customer Feedback Dossier Modal */}
          {selectedFeedback && (
            <div className="fixed inset-0 bg-[#1E2D4E]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="card-glass max-w-xl w-full p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-[#e2dfd7] pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E2D4E] text-[#C9952A] text-[9.5px] font-black uppercase tracking-widest mb-1">
                      Feedback Response Dossier
                    </div>
                    <h3 className="text-lg font-black text-[#1E2D4E]">{selectedFeedback.customerName || 'Anonymous Customer'}</h3>
                    <p className="text-xs text-gray-500 font-mono">Mobile: {selectedFeedback.mobile || 'Not Provided'} · Entry: {selectedFeedback.entryDate || 'Today'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sentiment Badge & Warning */}
                {selectedFeedback.isNegative && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-extrabold">Escalated to Telecaller Call Queue</div>
                      <div className="text-[11px] text-rose-700 font-medium">This customer response has been flagged for resolution by staff.</div>
                    </div>
                  </div>
                )}

                {/* Questionnaire Responses Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#1E2D4E] tracking-wider border-b pb-1">Questionnaire Responses</h4>
                  <div className="space-y-2 text-xs">
                    {Object.entries(selectedFeedback.answers || {}).map(([qKey, value]: [string, any]) => (
                      <div key={qKey} className="p-3 rounded-xl bg-white border border-[#e2dfd7] flex items-center justify-between gap-3">
                        <span className="font-extrabold text-[#1E2D4E]">Question ID ({qKey}):</span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#1E2D4E] text-white font-extrabold text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice of Customer Text */}
                {selectedFeedback.voice && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#1E2D4E] tracking-wider border-b pb-1">Voice of Customer Notes</h4>
                    <div className="p-3.5 rounded-2xl bg-[#F9F7F4] border border-[#e2dfd7] text-xs font-medium text-[#1E2D4E] whitespace-pre-line">
                      {selectedFeedback.voice}
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end pt-3 border-t border-[#e2dfd7]">
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="btn-primary text-xs px-6 py-2"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
