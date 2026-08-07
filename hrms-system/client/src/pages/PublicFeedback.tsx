import React, { useState, useEffect } from 'react';
import { Sparkles, Star, CheckCircle, Send, MessageSquare } from 'lucide-react';
import { API } from '../services/api';

export default function PublicFeedback() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customerName, setCustomerName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [voice, setVoice] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    API.getFeedbackQuestions()
      .then((res: any) => {
        if (res && res.questions) {
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
        voice,
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
              setVoice('');
            }}
            className="btn-gold w-full mt-6"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] py-8 px-4 flex justify-center">
      <div className="max-w-xl w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E2D4E] text-[#C9952A] text-xs font-extrabold uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4" />
            <span>BSC EXCLUSIVE DAVANAGERE</span>
          </div>
          <h1 className="text-3xl font-black text-[#1E2D4E]">Customer Experience Survey</h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">Please take a minute to rate your visit today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Profile Details */}
          <div className="card-glass p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E2D4E] uppercase tracking-wider border-b pb-2">Your Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-modern"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="input-modern"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Questions */}
          <div className="card-glass p-6 space-y-6">
            <h3 className="text-sm font-extrabold text-[#1E2D4E] uppercase tracking-wider border-b pb-2">Feedback Questionnaire</h3>
            {questions.map((q: any, idx: number) => {
              const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []);
              return (
                <div key={q.id || idx} className="space-y-2">
                  <label className="block text-sm font-bold text-[#1E2D4E]">
                    {idx + 1}. {q.question}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {opts.map((opt: string) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            selected
                              ? 'bg-[#1E2D4E] text-white border-[#1E2D4E] shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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

            {/* Voice Feedback Text */}
            <div className="space-y-2 pt-2 border-t">
              <label className="block text-sm font-bold text-[#1E2D4E] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C9952A]" />
                <span>Any Additional Comments or Voice of Customer?</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write your feedback, suggestions, or staff appreciation here..."
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="textarea-modern"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-5 h-5" />
            <span>{submitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
