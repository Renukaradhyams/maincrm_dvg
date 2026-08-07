import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { PhoneCall, AlertTriangle, CheckCircle2, Clock, Filter, MessageSquare } from 'lucide-react';
import { API } from '../services/api';

export default function FeedbackList() {
  const [callQueue, setCallQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('called');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchCallQueue = async () => {
    setLoading(true);
    try {
      const res = await API.getCallQueue();
      if (res && res.callQueue) {
        setCallQueue(res.callQueue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallQueue();
  }, []);

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
              <div className="text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">Pending Calls</div>
              <div className="text-2xl font-black text-[#1E2D4E]">
                {callQueue.filter(q => q.status === 'new').length}
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
                {callQueue.filter(q => q.status === 'called').length}
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
                {callQueue.filter(q => q.status === 'resolved').length}
              </div>
            </div>
          </div>
        </div>

        {/* Call Queue Table */}
        <div className="card-glass overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1E2D4E] uppercase tracking-wider">Escalated Call Register</h3>
            <button onClick={fetchCallQueue} className="text-xs font-bold text-[#C9952A] hover:underline">
              Refresh Queue
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 font-bold">Loading call queue...</div>
          ) : callQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">No escalated customer calls found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-[#1E2D4E] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Attempts</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {callQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#1E2D4E]">{item.customerName || 'Customer'}</td>
                      <td className="p-4 text-gray-600 font-mono">{item.mobile || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{new Date(item.entryDate).toLocaleDateString()}</td>
                      <td className="p-4">{item.attempts || 0} calls</td>
                      <td className="p-4">
                        <span className={`badge ${
                          item.status === 'resolved' ? 'b-sel' : item.status === 'called' ? 'b-[#C9952A]' : 'b-rej'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.notes || 'No notes added'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setNotes(item.notes || '');
                            setStatus(item.status || 'called');
                          }}
                          className="btn-gold text-[11px] py-1.5 px-3"
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
