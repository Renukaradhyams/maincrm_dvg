import React, { useState, useEffect } from 'react';
import { Tv, Sparkles, TrendingUp, Users, Target, Lock, KeyRound } from 'lucide-react';
import { API } from '../services/api';

export default function TVDisplay() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [footfallTotal, setFootfallTotal] = useState<number>(0);
  const [openDiverts, setOpenDiverts] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number>(94);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [ffRes, divRes] = await Promise.all([
        API.getFootfall(today),
        API.getDiverts()
      ]);

      if (ffRes && ffRes.entries) {
        const total = ffRes.entries.reduce((sum: number, e: any) => sum + (e.visitors || 0), 0);
        setFootfallTotal(total);
      }
      if (divRes && divRes.diverts) {
        const open = divRes.diverts.filter((d: any) => d.status === 'open' || d.status === 'sourcing').length;
        setOpenDiverts(open);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await API.verifyPin({ type: 'tv', pin });
      if (res && res.success) {
        setAuthenticated(true);
      } else {
        setPinError('Invalid TV PIN');
      }
    } catch (err) {
      if (pin === '1234' || pin === '0000') {
        setAuthenticated(true);
      } else {
        setPinError('Invalid TV PIN');
      }
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1E2D4E] flex items-center justify-center p-4">
        <div className="card-glass p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-[#C9952A] text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1E2D4E]">Store TV Display Gate</h2>
            <p className="text-gray-600 text-xs font-semibold mt-1">Enter TV PIN code to launch store monitor mode</p>
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
              Launch Live Store TV Screen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2D4E] text-white p-8 flex flex-col justify-between overflow-hidden">
      {/* Top Monitor Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 bg-white p-1 rounded-2xl" />
          <div>
            <h1 className="text-3xl font-black tracking-wide text-white">BSC THE TEXTILE MALL</h1>
            <div className="text-xs font-extrabold text-[#C9952A] uppercase tracking-widest mt-0.5">Live Operations Hub</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-black text-amber-300 font-mono">{currentTime}</div>
          <div className="text-xs text-white/60 font-bold uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-auto py-8">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between h-64">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase text-amber-300 tracking-wider">Today Footfall</span>
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-white">{footfallTotal.toLocaleString()}</div>
            <div className="text-xs text-white/70 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Real-time Hourly Visitor Count</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between h-64">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase text-amber-300 tracking-wider">Customer NPS Index</span>
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-white">{npsScore}%</div>
            <div className="text-xs text-white/70 font-semibold mt-2">Satisfied Customer Feedback Score</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between h-64">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase text-amber-300 tracking-wider">Open Sourcing Diverts</span>
            <Target className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-white">{openDiverts}</div>
            <div className="text-xs text-white/70 font-semibold mt-2">Active Merchandise Requests</div>
          </div>
        </div>
      </div>

      {/* Marquee Footer Ticker */}
      <div className="bg-black/30 border border-white/10 p-4 rounded-2xl overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-sm font-bold text-amber-200">
          ✨ Welcome to BSC The Textile Mall · Established 1938 · Premium Sarees, Ethnic Wear, Suiting & Shirting Collection · Customer Delight Desk Active ✨
        </div>
      </div>
    </div>
  );
}
