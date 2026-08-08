import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { PhoneCall, AlertTriangle, CheckCircle2, Clock, Filter, MessageSquare, Search, Calendar, RefreshCw } from 'lucide-react';
import { API } from '../services/api';
import { io } from 'socket.io-client';

export default function FeedbackList() {
  const [callQueue, setCallQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('called');
  const [updating, setUpdating] = useState<boolean>(false);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');

  const getISTDate = (d: Date = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + istOffset);
    return istDate.toISOString().split('T')[0];
  };

  const fetchCallQueue = useCallback(async () => {
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

      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await API.getCallQueue(params);
      if (res && res.callQueue) {
        setCallQueue(res.callQueue);
      }
    } catch (err) {
      console.warn('fetchCallQueue sync notice:', err);
    } finally {
      setLoading(false);
    }
  }, [datePreset, startDateInput, endDateInput, statusFilter, search]);

  useEffect(() => {
    fetchCallQueue();

    // Socket.IO Push Listener for instant 0ms latency synchronization
    const socket = io({ path: '/socket.io', autoConnect: true });
    socket.on('feedback:negative', () => fetchCallQueue());
    socket.on('feedback:submitted', () => fetchCallQueue());

    // Auto-refresh call queue every 5 seconds for real-time synchronization
    const interval = setInterval(() => {
      fetchCallQueue();
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchCallQueue]);

  const handleUpdate = async () => {
    if (!selectedItem) return;
    setUpdating(true);
    try {
      await API.updateCallQueue({
        id: selectedItem.id,
        status,
        notes
      });
      setSelectedItem(null);
      fetchCallQueue();
    } catch (err) {
      console.error(err);
      alert('Failed to update call record.');
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = callQueue.filter(q => q.status === 'new' || q.status === 'pending').length;
  const inProgressCount = callQueue.filter(q => q.status === 'called').length;
  const resolvedCount = callQueue.filter(q => q.status === 'resolved').length;

  return (
    <DashboardLayout title="Customer Call Queue" subtitle="Telecaller Follow-up Workspace for Negative Feedback Escalations">
      <div className="space-y-6">
        {/* KPI Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass p-5 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">Pending Escalated Calls</div>
              <div className="text-2xl font-black text-[#1E2D4E]">
                {pendingCount}
              </div>
            </div>
          </div>

          <div className="card-glass p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">In Progress</div>
              <div className="text-2xl font-black text-[#1E2D4E]">
                {inProgressCount}
              </div>
            </div>
          </div>

          <div className="card-glass p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">Resolved Feedback</div>
              <div className="text-2xl font-black text-[#1E2D4E]">
                {resolvedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card-glass p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-modern pl-9 py-2 text-xs font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#C9952A] hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-modern text-xs font-bold py-2"
            >
              <option value="all">All Call Statuses</option>
              <option value="new">Pending / New</option>
              <option value="called">In Progress / Called</option>
              <option value="resolved">Resolved</option>
            </select>

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
                />
                <span className="text-xs font-bold text-gray-500">to</span>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="input-modern text-xs font-semibold py-1.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Call Queue Table */}
        <div className="card-glass overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1E2D4E] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C9952A]" />
              <span>Escalated Call Register ({callQueue.length})</span>
            </h3>
            <button onClick={fetchCallQueue} className="text-xs font-bold text-[#C9952A] hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Loading call queue...</div>
          ) : callQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">No escalated customer calls found matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#1E2D4E] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Entry Date</th>
                    <th className="p-4">Attempts</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Escalation Notes</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {callQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#1E2D4E]">{item.customerName || 'Valued Customer'}</td>
                      <td className="p-4 text-gray-600 font-mono">{item.mobile || 'N/A'}</td>
                      <td className="p-4 text-gray-600 font-semibold">{item.entryDate || 'N/A'}</td>
                      <td className="p-4">{item.attempts || 0} calls</td>
                      <td className="p-4">
                        <span className={`badge ${
                          item.status === 'resolved' ? 'b-sel' : item.status === 'called' ? 'b-[#C9952A]' : 'b-rej'
                        }`}>
                          {(item.status || 'new').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.notes || 'Negative feedback auto-escalated'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setNotes(item.notes || '');
                            setStatus(item.status || 'called');
                          }}
                          className="btn-gold text-[11px] py-1.5 px-3 shadow-xs"
                        >
                          Log Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Log Call Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="card-glass p-6 max-w-md w-full animate-scale-in">
              <h3 className="text-lg font-black text-[#1E2D4E] mb-4">Log Telecaller Follow-up</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Customer Name & Phone</label>
                  <div className="font-extrabold text-sm text-[#1E2D4E]">
                    {selectedItem.customerName} ({selectedItem.mobile})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Update Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="select-modern"
                  >
                    <option value="called">Called - Follow Up Needed</option>
                    <option value="resolved">Resolved - Customer Satisfied</option>
                    <option value="escalated">Escalated to Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Telecaller Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter call outcome, resolution offered, or store voucher details..."
                    className="textarea-modern"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {updating ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
