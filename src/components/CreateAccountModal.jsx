import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreateAccountModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D1014]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3D1014] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#3D1014] text-[#00F2FE] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#3D1014] mb-2">
              Join FlyFinder Network
            </h3>
            <p className="text-xs text-[#3D1014]/70 mb-6">
              Get real-time price alerts, AI fare forecast notifications, and exclusive flight route insights.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D1014]/70 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F9F8F3] border border-[#E5E7EB] focus:border-[#3D1014] rounded-2xl px-4 py-3 text-sm text-[#3D1014] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3D1014] hover:bg-[#280a0d] text-white font-bold py-3.5 px-6 rounded-2xl shadow-burgundy-btn flex items-center justify-center space-x-2 transition-all"
              >
                <span>Activate AI Fare Alerts</span>
                <ArrowRight className="w-4 h-4 text-[#00F2FE]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#3D1014] mb-2">
              Welcome Aboard!
            </h3>
            <p className="text-xs text-[#3D1014]/70 mb-6">
              Your account has been activated. We've sent your AI fare forecasting dashboard access link to <span className="font-bold">{email}</span>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#3D1014] text-white font-semibold text-xs px-6 py-2.5 rounded-full"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
