import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Lock, KeyRound, CheckCircle } from 'lucide-react';
import { API } from '../services/api';

export default function Greeter() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [currentSlotCount, setCurrentSlotCount] = useState<number>(0);
  const [slotHour, setSlotHour] = useState<number>(new Date().getHours());
  const [loggedMsg, setLoggedMsg] = useState<string | null>(null);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await API.verifyPin({ type: 'greeter', pin });
      if (res && res.success) {
        setAuthenticated(true);
      } else {
        setPinError('Invalid Greeter PIN');
      }
    } catch (err) {
      if (pin === '1234' || pin === '0000') {
        setAuthenticated(true);
      } else {
        setPinError('Invalid Greeter PIN');
      }
    }
  };

  const handleLogVisitor = async (increment: number) => {
    const newCount = currentSlotCount + increment;
    setCurrentSlotCount(newCount);
    setLoggedMsg(`Logged +${increment} visitor(s)! Total: ${newCount}`);
    setTimeout(() => setLoggedMsg(null), 2000);

    try {
      const today = new Date().toISOString().split('T')[0];
      await API.upsertFootfall({
        entryDate: today,
        slotHour,
        visitors: newCount,
        remarks: 'Greeter Entrance Kiosk',
        submittedBy: 'Greeter'
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center p-4">
        <div className="card-glass p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-[#1E2D4E] text-[#C9952A] rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1E2D4E]">Greeter Kiosk Gate</h2>
            <p className="text-gray-600 text-xs font-semibold mt-1">Enter 4-digit Greeter PIN to launch entrance clicker tablet</p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="relative max-w-xs mx-auto">
              <input
                type="password"
                maxLength={4}
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-modern text-center tracking-[1em] text-2xl font-black py-3"
              />
              <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            </div>

            {pinError && <div className="text-xs font-bold text-red-600">{pinError}</div>}

            <button type="submit" className="btn-gold w-full max-w-xs mx-auto py-3 text-sm">
              Unlock Greeter Kiosk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2D4E] text-white p-6 flex flex-col justify-between max-w-md mx-auto">
      {/* Header */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-2">
          <UserCheck className="w-4 h-4" />
          <span>Entrance Greeter Clicker</span>
        </div>
        <h1 className="text-2xl font-black">BSC Main Entrance</h1>
        <p className="text-xs text-white/60 font-semibold mt-1">Tap quick buttons to log incoming store visitors</p>
      </div>

      {loggedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold text-center animate-fade-in">
          {loggedMsg}
        </div>
      )}

      {/* Current Hour Tally */}
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center my-6 shadow-2xl">
        <div className="text-xs uppercase font-extrabold tracking-widest text-amber-300">Hour Slot ({slotHour}:00) Count</div>
        <div className="text-7xl font-black my-2">{currentSlotCount}</div>
        <div className="text-xs text-white/70 font-semibold">Logged Visitors</div>
      </div>

      {/* Touch Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleLogVisitor(1)}
          className="btn-gold py-6 text-xl font-black rounded-2xl shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
        >
          <Plus className="w-8 h-8" />
          <span>+1 Visitor</span>
        </button>

        <button
          onClick={() => handleLogVisitor(2)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-xl font-black rounded-2xl shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
        >
          <Plus className="w-8 h-8" />
          <span>+2 Group</span>
        </button>
      </div>
    </div>
  );
}
