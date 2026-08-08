import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Heart, 
  TrendingUp, 
  HelpCircle, 
  User, 
  Phone, 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  Meh, 
  Frown, 
  Clock, 
  Store, 
  Star, 
  Zap, 
  ShieldCheck, 
  Check,
  Award
} from 'lucide-react';
import { API } from '../services/api';

const defaultQuestions = [
  { id: 'q1', question: 'How satisfied are you with your overall shopping experience today?', category: 'Shopping Experience', options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] },
  { id: 'q2', question: 'Did you find the product you were looking for?', category: 'Product Availability', options: ['Yes, exactly what I wanted', 'Yes, with assistance', 'Partially', 'No'] },
  { id: 'q3', question: 'How would you rate the quality & variety of our collection?', category: 'Collection Quality', options: ['Excellent', 'Good', 'Average', 'Poor'] },
  { id: 'q4', question: 'How would you rate the behavior and helpfulness of our staff?', category: 'Staff Courtesy', options: ['Extremely helpful', 'Helpful', 'Average', 'Poor'] },
  { id: 'q5', question: 'How likely are you to recommend BSC Exclusive to your friends and family?', category: 'Store Recommendation', options: ['Definitely recommend', 'Probably recommend', 'Neutral', 'Not recommend'] }
];

export default function PublicFeedback() {
  const [questions, setQuestions] = useState<any[]>(defaultQuestions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  
  // Additional feedback text fields
  const [likedMost, setLikedMost] = useState<string>('');
  const [canImprove, setCanImprove] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [refNo, setRefNo] = useState<string>('');

  useEffect(() => {
    API.getFeedbackQuestions()
      .then((res: any) => {
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      })
      .catch((err: any) => console.error(err));
  }, []);

  // Compute live survey completion progress
  const progressStats = useMemo(() => {
    const totalRequired = questions.length + 2; // Name + Mobile + questions
    const count = (customerName.trim() ? 1 : 0) + (mobile.trim() ? 1 : 0) + Object.keys(answers).length;
    const pct = Math.min(100, Math.round((count / totalRequired) * 100));
    return { count, total: totalRequired, pct };
  }, [customerName, mobile, answers, questions.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.submitFeedback({
        customerName,
        mobile,
        answers,
        likedMost,
        canImprove,
        additionalComments,
        source: 'qr'
      });
      setRefNo(`BSC-FB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionIcon = (opt: string) => {
    const l = opt.toLowerCase();
    if (l.includes('very satisfied') || l.includes('definitely') || l.includes('excellent') || l.includes('extremely')) return <Smile className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (l.includes('satisfied') || l.includes('good') || l.includes('helpful') || l.includes('yes')) return <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (l.includes('neutral') || l.includes('average') || l.includes('partially')) return <Meh className="w-4 h-4 text-amber-500 shrink-0" />;
    if (l.includes('dissatisfied') || l.includes('poor') || l.includes('no') || l.includes('not recommend')) return <Frown className="w-4 h-4 text-rose-500 shrink-0" />;
    return <Star className="w-4 h-4 text-[#C9952A] shrink-0" />;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E2D4E] to-[#142038] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden text-white">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9952A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 animate-scale-in border border-white/20 rounded-3xl shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/30 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <Store className="w-3 h-3" /> BSC EXCLUSIVE DAVANAGERE
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Thank You!</h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-md mx-auto">
              Your valuable feedback has been received successfully. We appreciate your time in helping us improve our retail experience.
            </p>
          </div>

          {/* Reference Badge */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 space-y-1">
            <div className="text-[10px] uppercase font-black tracking-widest text-[#C9952A]">Survey Reference ID</div>
            <div className="font-mono text-base font-black text-white">{refNo}</div>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setCustomerName('');
              setMobile('');
              setLikedMost('');
              setCanImprove('');
              setAdditionalComments('');
            }}
            className="btn-gold w-full py-4 text-sm font-black rounded-2xl shadow-xl active:scale-95 transition-all duration-150 border-2 border-amber-300/40"
          >
            Submit Another Survey Response
          </button>

          <div className="text-[10.5px] text-white/50 font-bold">
            BSC EXCLUSIVE • STORE KIOSK FEEDBACK SYSTEM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DE] py-6 sm:py-10 px-4 sm:px-6 flex justify-center selection:bg-[#C9952A] selection:text-white">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Header Hero Branding Card */}
        <div className="card-glass p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1E2D4E] to-[#142038] text-white border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C9952A]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-300/30">
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span>BSC EXCLUSIVE DAVANAGERE • STORE SURVEY</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Customer Experience Survey
            </h1>
            
            <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Please take a minute to share your feedback. Your response helps us improve our service and shopping experience.
            </p>

            {/* Completion Progress Bar */}
            <div className="pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-white/90">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Estimated Time: ~1 Minute</span>
                </span>
                <span className="font-mono text-amber-300 font-extrabold">{progressStats.pct}% Completed</span>
              </div>
              
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#C9952A] to-amber-300 rounded-full transition-all duration-300 shadow-md"
                  style={{ width: `${progressStats.pct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Details Card (2-Column on Tablet, 1-Column on Mobile) */}
          <div className="card-glass p-6 sm:p-8 rounded-3xl space-y-4 border border-white/80 bg-white/80 shadow-md">
            <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3">
              <h3 className="font-black text-[#1E2D4E] text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#C9952A]" />
                <span>Customer Verification Details</span>
              </h3>
              <span className="text-[10.5px] font-extrabold text-[#777777] uppercase tracking-wider">Required *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#1E2D4E]">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#777777] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-semibold pl-11 pr-4 h-13 sm:h-14 rounded-2xl border border-[#e2dfd7] bg-white text-[#1E2D4E] outline-none focus:border-[#C9952A] focus:ring-2 focus:ring-[#C9952A]/30 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#1E2D4E]">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777777] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs font-mono font-semibold pl-11 pr-4 h-13 sm:h-14 rounded-2xl border border-[#e2dfd7] bg-white text-[#1E2D4E] outline-none focus:border-[#C9952A] focus:ring-2 focus:ring-[#C9952A]/30 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Cards Stack */}
          <div className="space-y-5">
            {questions.map((q: any, idx: number) => {
              const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
              const categoryLabel = q.category || `Section ${idx + 1}`;
              const cleanTitle = q.question.replace(/^\d+\.\s*/, '');

              return (
                <div key={q.id || idx} className="card-glass p-6 sm:p-8 rounded-3xl space-y-4 border border-white/80 bg-white/90 shadow-md">
                  
                  {/* Question Header Badge */}
                  <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E2D4E] text-[#C9952A] text-[10px] font-black uppercase tracking-widest">
                      Q{idx + 1} • {categoryLabel}
                    </span>
                    {answers[q.id] && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                        <Check className="w-3.5 h-3.5" /> Answered
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#1E2D4E] leading-snug">
                    {cleanTitle}
                  </h3>

                  {/* Selectable Touch Chips Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {opts.map((opt: string) => {
                      const isSelected = answers[q.id] === opt;

                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`
                            min-h-[52px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 flex items-center justify-between gap-3 text-left border shadow-xs active:scale-95
                            ${isSelected
                              ? 'bg-[#1E2D4E] text-white border-2 border-[#C9952A] shadow-lg shadow-[#1E2D4E]/20 scale-[1.01]'
                              : 'bg-white/90 text-[#1E2D4E] border-[#e2dfd7] hover:bg-white hover:border-[#1E2D4E]'}
                          `}
                        >
                          <span className="truncate">{opt}</span>
                          {getOptionIcon(opt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice of Customer / Additional Feedback Section (3 Glass Textareas) */}
          <div className="card-glass p-6 sm:p-8 rounded-3xl space-y-5 border border-white/80 bg-white/90 shadow-md">
            <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-3">
              <h3 className="font-black text-[#1E2D4E] text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C9952A]" />
                <span>Voice of Customer Notes (Optional)</span>
              </h3>
              <span className="text-[10.5px] font-extrabold text-[#777777] uppercase tracking-wider">Store Feedback</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-300/60 space-y-2">
                <label className="block text-xs font-extrabold text-emerald-900 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span>What did you like most about your visit today?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us what stood out positively..."
                  value={likedMost}
                  onChange={(e) => setLikedMost(e.target.value)}
                  className="w-full text-xs font-medium p-3.5 rounded-xl border border-emerald-200 bg-white text-[#1E2D4E] outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all"
                ></textarea>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-300/60 space-y-2">
                <label className="block text-xs font-extrabold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>What can we improve to serve you better?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Share suggestions or improvement areas..."
                  value={canImprove}
                  onChange={(e) => setCanImprove(e.target.value)}
                  className="w-full text-xs font-medium p-3.5 rounded-xl border border-amber-200 bg-white text-[#1E2D4E] outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
                ></textarea>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-300/60 space-y-2">
                <label className="block text-xs font-extrabold text-blue-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Any additional comments or suggestions?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Write any extra thoughts or comments..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  className="w-full text-xs font-medium p-3.5 rounded-xl border border-blue-200 bg-white text-[#1E2D4E] outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full h-14 sm:h-16 text-base sm:text-lg font-black flex items-center justify-center gap-2 shadow-2xl rounded-2xl active:scale-95 transition-all duration-150 border-2 border-amber-300/40"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback Response'}</span>
            </button>

            <div className="text-center text-xs text-[#777777] font-semibold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9952A]" />
              <span>Your feedback helps us continuously improve your shopping experience.</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

