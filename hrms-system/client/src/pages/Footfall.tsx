import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { BarChart3, Clock, Users, Calendar, Save, CheckCircle2, AlertCircle, Sparkles, Check, Hourglass, Activity, FileText } from 'lucide-react';
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
    try {
      const res = await API.getFootfall(selectedDate);
      const map: Record<number, { visitors: number; remarks: string }> = {};
      if (res && res.entries && Array.isArray(res.entries)) {
        res.entries.forEach((e: any) => {
          map[e.slotHour] = { visitors: Number(e.visitors) || 0, remarks: e.remarks || '' };
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
    setLoading(true);
    fetchFootfall(date);

    // Realtime polling every 3 seconds to stay synchronized with Greeter Kiosk & other devices
    const interval = setInterval(() => {
      API.getFootfall(date)
        .then((res: any) => {
          if (res && res.entries && Array.isArray(res.entries)) {
            const map: Record<number, { visitors: number; remarks: string }> = {};
            res.entries.forEach((e: any) => {
              map[e.slotHour] = { visitors: Number(e.visitors) || 0, remarks: e.remarks || '' };
            });
            setSlots(map);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
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
      setMessage(`Footfall slot for ${formatHour} updated and synchronized across all screens!`);
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
      subtitle="Realtime store visitor tracking across floor operating hours (10:00 AM – 10:00 PM)"
    >
      <div className="space-y-6">
        
        {/* Top Controls: Glass Date Selector + Operating Hours Header */}
        <div className="space-y-5">
          <div className="card-glass p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#e2dfd7]/80 bg-white/70 backdrop-blur-xl shadow-md rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2D4E] to-[#142038] text-[#C9952A] flex items-center justify-center shadow-lg shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <label className="block text-[10.5px] font-black uppercase text-[#777777] tracking-widest mb-1">
                  Store Log Register Date
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-[#e2dfd7] bg-white/90 font-extrabold text-xs text-[#1E2D4E] outline-none shadow-xs focus:ring-2 focus:ring-[#C9952A]/40 transition-all"
                  />
                  <button
                    onClick={() => setDate(todayStr)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                      isTodaySelected 
                        ? 'bg-[#1E2D4E] text-[#C9952A] shadow-md ring-1 ring-[#C9952A]/30' 
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
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#F9F7F4] border border-[#e2dfd7] text-[#555555] hover:bg-white transition-all"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-[#1E2D4E]/5 border border-[#1E2D4E]/10 flex items-center gap-2 text-xs font-extrabold text-[#1E2D4E]">
                <Clock className="w-4 h-4 text-[#C9952A] shrink-0" />
                <span>Operating Window: <strong className="text-[#1E2D4E]">10:00 AM – 10:00 PM</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Summary Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Daily Visitors"
              value={totalFootfall.toLocaleString('en-IN')}
              subtext={`Sum of 12 operating slots for ${date}`}
              icon={Users}
              color="navy"
            />
            <MetricCard
              title="Completed Slots"
              value={`${completedSlotsCount} / 12`}
              subtext="Hours with recorded visitor counts"
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Pending Slots"
              value={`${pendingSlotsCount} / 12`}
              subtext="Remaining floor operating slots"
              icon={Hourglass}
              color="gold"
            />
            <MetricCard
              title="Operating Coverage"
              value="12 Hours"
              subtext="Realtime synchronized floor tracking"
              icon={Activity}
              color="indigo"
            />
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-3 shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C9952A]" />
            <h3 className="font-extrabold text-[#1E2D4E] text-base tracking-tight">Hourly Store Entry Slots</h3>
          </div>
          <span className="text-xs font-bold text-[#777777] bg-white/60 px-3 py-1 rounded-full border border-[#e2dfd7]">
            12 Hourly Slots (10 AM - 10 PM)
          </span>
        </div>

        {/* Hourly Slot Entry Responsive Grid */}
        {loading ? (
          <div className="card-glass p-12 text-center text-xs text-[#777777] font-bold">
            Loading hourly footfall register for {date}...
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
                  className={`card-glass p-5 flex flex-col justify-between transition-all duration-200 relative group hover:-translate-y-1 hover:shadow-xl rounded-2xl ${
                    isCurrentSlot
                      ? 'border-2 border-[#C9952A] shadow-xl ring-4 ring-[#C9952A]/15 bg-gradient-to-br from-amber-50/60 to-amber-100/30'
                      : isSaved
                      ? 'border-l-4 border-l-emerald-600 bg-white/80'
                      : 'border-l-4 border-l-[#1E2D4E]/30 bg-white/60'
                  }`}
                >
                  <div>
                    {/* Time Slot Header */}
                    <div className="flex items-center justify-between border-b border-[#e2dfd7]/80 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-[#1E2D4E] text-sm tracking-tight">
                          <Clock className={`w-4 h-4 ${isCurrentSlot ? 'text-[#C9952A] animate-pulse' : 'text-[#1E2D4E]'}`} />
                          <span>{formatHour} – {formatEndHour}</span>
                        </div>
                        <div className="text-[10px] text-[#777777] font-bold font-mono mt-0.5">
                          Slot {hour - 9} of 12
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isCurrentSlot ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#C9952A] text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Current
                        </span>
                      ) : isSaved ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-300/50">
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
                            className="w-full text-base font-black font-mono pl-9 pr-3 py-2 rounded-xl border border-[#e2dfd7] bg-white text-[#1E2D4E] focus:outline-none focus:border-[#C9952A] focus:ring-2 focus:ring-[#C9952A]/20 transition-all shadow-2xs"
                          />
                          <Users className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-[#1E2D4E] mb-1">
                          Floor Notes / Remarks
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={slot.remarks || ''}
                            onChange={(e) => setSlots({
                              ...slots,
                              [hour]: { ...slot, remarks: e.target.value }
                            })}
                            placeholder="e.g. Rush in Womens Sarees"
                            className="w-full text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-[#e2dfd7] bg-white text-[#1E2D4E] focus:outline-none focus:border-[#C9952A] focus:ring-2 focus:ring-[#C9952A]/20 transition-all shadow-2xs"
                          />
                          <FileText className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSaveSlot(hour)}
                    disabled={savingSlot === hour}
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] disabled:opacity-50 ${
                      isCurrentSlot
                        ? 'bg-[#C9952A] text-white hover:bg-[#b07d20] shadow-md'
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
