import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { BarChart3, Clock, Users, Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { API } from '../services/api';

export default function Footfall() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Record<number, { visitors: number; remarks: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const slotHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  const fetchFootfall = async (selectedDate: string) => {
    setLoading(true);
    try {
      const res = await API.getFootfall(selectedDate);
      const map: Record<number, { visitors: number; remarks: string }> = {};
      if (res && res.entries && Array.isArray(res.entries)) {
        res.entries.forEach((e: any) => {
          map[e.slotHour] = { visitors: e.visitors || 0, remarks: e.remarks || '' };
        });
      }
      setSlots(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFootfall(date);
  }, [date]);

  const handleSaveSlot = async (hour: number) => {
    setSavingSlot(hour);
    setMessage(null);
    try {
      const slotData = slots[hour] || { visitors: 0, remarks: '' };
      await API.upsertFootfall({
        entryDate: date,
        slotHour: hour,
        visitors: Number(slotData.visitors),
        remarks: slotData.remarks,
        submittedBy: 'Floor Manager'
      });
      setMessage(`Slot ${hour}:00 logged successfully!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save slot entry.');
    } finally {
      setSavingSlot(null);
    }
  };

  const totalFootfall = Object.values(slots).reduce((sum, s) => sum + (Number(s.visitors) || 0), 0);

  return (
    <DashboardLayout title="Hourly Footfall Log" subtitle="Track hourly customer footfall across operating hours (10 AM - 10 PM)">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="card-glass p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#1E2D4E]/60 tracking-wider">Select Log Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-modern mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 bg-[#1E2D4E] text-white px-6 py-3 rounded-2xl shadow-md">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Total Daily Visitors</div>
              <div className="text-2xl font-black">{totalFootfall.toLocaleString()}</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Operating Slots</div>
              <div className="text-lg font-bold">12 Slots</div>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Slot Entry Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold">Loading hourly footfall slots...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slotHours.map((hour) => {
              const slot = slots[hour] || { visitors: 0, remarks: '' };
              const formatHour = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
              
              return (
                <div key={hour} className="card-glass p-5 flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-[#1E2D4E]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-black text-[#1E2D4E]">
                        <Clock className="w-4 h-4 text-[#C9952A]" />
                        <span>{formatHour}</span>
                      </div>
                      <span className="badge b-info">Slot {hour}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Visitor Count</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={slot.visitors || ''}
                            onChange={(e) => setSlots({
                              ...slots,
                              [hour]: { ...slot, visitors: parseInt(e.target.value, 10) || 0 }
                            })}
                            placeholder="0"
                            className="input-modern pl-9 font-black text-lg text-[#1E2D4E]"
                          />
                          <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Slot Remarks (Optional)</label>
                        <input
                          type="text"
                          value={slot.remarks || ''}
                          onChange={(e) => setSlots({
                            ...slots,
                            [hour]: { ...slot, remarks: e.target.value }
                          })}
                          placeholder="e.g., High footfall at sarees"
                          className="input-modern text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveSlot(hour)}
                    disabled={savingSlot === hour}
                    className="mt-4 btn-primary w-full flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSlot === hour ? 'Saving...' : 'Save Slot Log'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
