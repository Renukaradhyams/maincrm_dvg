import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { BarChart3, Clock, Users, Calendar, Save, CheckCircle2, AlertCircle, Sparkles, Check, Hourglass, Activity } from 'lucide-react';
import { API } from '../services/api';
import MetricCard from '../components/ui/MetricCard';

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
      const formatHour = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
      setMessage(`Footfall entry for ${formatHour} saved successfully!`);
      setTimeout(() => setMessage(null), 3000);
      fetchFootfall(date);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save slot entry.');
    } finally {
      setSavingSlot(null);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentHourNow = useMemo(() => new Date().getHours(), []);
  const isTodaySelected = date === todayStr;

  const totalFootfall = useMemo(() => {
    return Object.values(slots).reduce((sum, s) => sum + (Number(s.visitors) || 0), 0);
  }, [slots]);

  const completedSlotsCount = useMemo(() => {
    return slotHours.filter(h => (slots[h]?.visitors || 0) > 0).length;
  }, [slots]);

  const pendingSlotsCount = useMemo(() => {
    return slotHours.length - completedSlotsCount;
  }, [completedSlotsCount]);

  return (
    <DashboardLayout 
      title="Hourly Footfall Register" 
      subtitle="Track and log hourly store footfall entries across floor operating hours (10:00 AM - 10:00 PM)"
    >
      <div className="space-[#EDE8DE] space-y-6">
        
        {/* Top Controls: Date Selector + Overview Summary Cards */}
        <div className="space-y-4">
          <div className="card-glass p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-[#1E2D4E]/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1E2D4E] text-[#C9952A] flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <label className="block text-[10.5px] font-black uppercase text-[#777777] tracking-wider">Store Log Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#e2dfd7] bg-white font-extrabold text-xs text-[#1E2D4E] outline-none shadow-xs"
                  />
                  <button
                    onClick={() => setDate(todayStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isTodaySelected 
                        ? 'bg-[#1E2D4E] text-white shadow-xs' 
                        : 'bg-[#F9F7F4] border border-[#e2dfd7] text-[#555555] hover:bg-white'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F9F7F4] border border-[#e2dfd7] text-[#555555] hover:bg-white transition-all"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#1E2D4E]">
              <span className="px-3 py-1.5 rounded-xl bg-[#F9F7F4] border border-[#e2dfd7] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C9952A]" />
                <span>Shift Hours: 10:00 AM – 10:00 PM</span>
              </span>
            </div>
          </div>

          {/* 4 Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Daily Visitors"
              value={totalFootfall.toLocaleString('en-IN')}
              subtext={`Recorded across logged slots for ${date}`}
              icon={Users}
              color="navy"
            />
            <MetricCard
              title="Completed Slots"
              value={`${completedSlotsCount} / 12`}
              subtext="Slots with logged footfall count"
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Pending Slots"
              value={`${pendingSlotsCount} / 12`}
              subtext="Operating hours awaiting entry"
              icon={Hourglass}
              color="gold"
            />
            <MetricCard
              title="Operating Window"
              value="12 Hours"
              subtext="10 AM to 10 PM daily coverage"
              icon={Activity}
              color="indigo"
            />
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-2.5 shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Hourly Slot Entry Responsive Grid */}
        {loading ? (
          <div className="card-glass p-12 text-center text-xs text-[#777777] font-bold">
            Loading hourly footfall slots for {date}...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slotHours.map((hour) => {
              const slot = slots[hour] || { visitors: 0, remarks: '' };
              const formatHour = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
              const formatEndHour = (hour + 1) > 12 ? `${(hour + 1) - 12}:00 PM` : (hour + 1) === 12 ? '12:00 PM' : `${hour + 1}:00 AM`;
              
              const isCurrentSlot = isTodaySelected && currentHourNow === hour;
              const isSaved = (slot.visitors || 0) > 0;

              return (
                <div 
                  key={hour} 
                  className={`card-glass p-5 flex flex-col justify-between transition-all duration-200 relative group hover:-translate-y-1 hover:shadow-xl ${
                    isCurrentSlot
                      ? 'border-2 border-[#C9952A] shadow-lg ring-2 ring-[#C9952A]/20 bg-amber-50/30'
                      : isSaved
                      ? 'border-l-4 border-l-emerald-600'
                      : 'border-l-4 border-l-[#1E2D4E]/30'
                  }`}
                >
                  <div>
                    {/* Card Slot Header */}
                    <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 font-black text-[#1E2D4E] text-sm">
                          <Clock className={`w-4 h-4 ${isCurrentSlot ? 'text-[#C9952A] animate-pulse' : 'text-[#1E2D4E]'}`} />
                          <span>{formatHour} – {formatEndHour}</span>
                        </div>
                        <div className="text-[10px] text-[#777777] font-bold font-mono mt-0.5">
                          Slot {hour - 9} of 12
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isCurrentSlot ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#C9952A] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Current
                        </span>
                      ) : isSaved ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Saved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#F9F7F4] border border-[#e2dfd7] text-[#777777] text-[10px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-[#1E2D4E] mb-1">
                          Visitor Footfall Count
                        </label>
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
                            className="input-modern pl-9 font-black font-mono text-base text-[#1E2D4E] focus:border-[#C9952A]"
                          />
                          <Users className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-[#1E2D4E] mb-1">
                          Floor Notes / Remarks
                        </label>
                        <input
                          type="text"
                          value={slot.remarks || ''}
                          onChange={(e) => setSlots({
                            ...slots,
                            [hour]: { ...slot, remarks: e.target.value }
                          })}
                          placeholder="e.g. Heavy rush in Womens Sarees"
                          className="input-modern text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSaveSlot(hour)}
                    disabled={savingSlot === hour}
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 ${
                      isCurrentSlot
                        ? 'bg-[#C9952A] text-white hover:bg-[#b07d20]'
                        : isSaved
                        ? 'bg-[#1E2D4E] text-white hover:bg-[#162340]'
                        : 'bg-[#1E2D4E] text-white hover:bg-[#162340]'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSlot === hour ? 'Logging Entry...' : isSaved ? 'Update Slot Log' : 'Save Slot Log'}</span>
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
