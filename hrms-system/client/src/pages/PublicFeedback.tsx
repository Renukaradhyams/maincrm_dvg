import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Send, MessageSquare, Heart, TrendingUp, HelpCircle } from 'lucide-react';
import { API } from '../services/api';

const defaultQuestions = [
  { id: 'q1', question: '1. How satisfied are you with your overall shopping experience today?', options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] },
  { id: 'q2', question: '2. Did you find the product you were looking for?', options: ['Yes, exactly', 'Yes, with assistance', 'Partially', 'No'] },
  { id: 'q3', question: '3. How would you rate the quality & variety of our collection?', options: ['Excellent', 'Good', 'Average', 'Poor'] },
  { id: 'q4', question: '4. How would you rate the behavior and helpfulness of our staff?', options: ['Extremely helpful', 'Helpful', 'Average', 'Poor'] },
  { id: 'q5', question: '5. How likely are you to recommend BSC Exclusive to your friends and family?', options: ['Definitely recommend', 'Probably recommend', 'Neutral', 'Not recommend'] }
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

  useEffect(() => {
    API.getFeedbackQuestions()
      .then((res: any) => {
        if (res && res.questions && Array.isArray(res.questions) && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      })
      .catch((err: any) => console.error(err));
  }, []);

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
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center p-4">
        <div className="card-glass p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#1E2D4E]">Thank You!</h2>
          <p className="text-gray-600 font-medium text-sm mt-2">
            Your feedback has been received. We value your shopping experience at BSC EXCLUSIVE DAVANAGERE.
          </p>
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
            className="btn-gold w-full mt-6 py-3 font-extrabold text-xs"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] py-8 px-4 flex justify-center">
      <div className="max-w-2xl w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E2D4E] text-[#C9952A] text-xs font-extrabold uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4" />
            <span>BSC EXCLUSIVE DAVANAGERE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E2D4E]">Customer Experience Survey</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 font-medium max-w-lg mx-auto">
            Please take a minute to share your feedback. Your response helps us improve our service and shopping experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="card-glass p-6 space-y-4">
            <h3 className="text-xs font-black text-[#1E2D4E] uppercase tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
              <span>Customer Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#1E2D4E] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-modern font-semibold text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#1E2D4E] mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="input-modern font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Feedback Questionnaire */}
          <div className="card-glass p-6 space-y-6">
            <h3 className="text-xs font-black text-[#1E2D4E] uppercase tracking-wider border-b border-[#e2dfd7] pb-2">
              Feedback Questionnaire
            </h3>

            {questions.map((q: any, idx: number) => {
              const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
              const qTitle = q.question.startsWith(`${idx + 1}.`) ? q.question : `${idx + 1}. ${q.question}`;

              return (
                <div key={q.id || idx} className="space-y-2.5 bg-white/70 p-4 rounded-2xl border border-[#e2dfd7]/80">
                  <label className="block text-xs font-black text-[#1E2D4E] leading-relaxed">
                    {qTitle}
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {opts.map((opt: string) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                            selected
                              ? 'bg-[#1E2D4E] text-white border-[#1E2D4E] shadow-sm ring-2 ring-[#C9952A]/40'
                              : 'bg-white text-[#555555] border-[#e2dfd7] hover:bg-[#F9F7F4] hover:border-[#1E2D4E]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Feedback Section */}
          <div className="card-glass p-6 space-y-5">
            <h3 className="text-xs font-black text-[#1E2D4E] uppercase tracking-wider border-b border-[#e2dfd7] pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C9952A]" />
              <span>Additional Feedback</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#1E2D4E] mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>What did you like the most about your visit today?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Share what you liked most..."
                  value={likedMost}
                  onChange={(e) => setLikedMost(e.target.value)}
                  className="textarea-modern text-xs font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1E2D4E] mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>What can we improve to serve you better?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Suggest improvements..."
                  value={canImprove}
                  onChange={(e) => setCanImprove(e.target.value)}
                  className="textarea-modern text-xs font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1E2D4E] mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                  <span>Any additional comments or suggestions?</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Write any extra thoughts or comments..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  className="textarea-modern text-xs font-medium"
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full py-4 text-sm font-black flex items-center justify-center gap-2 shadow-xl rounded-2xl active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
