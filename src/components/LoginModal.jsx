import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, Shield } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('naman@flyfinder.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Naman Vasani',
        email: email,
        tier: 'PRO Intelligence'
      });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D1014]/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3D1014] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D1014] text-[#00F2FE] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#3D1014]">
              FlyFinder Member Login
            </h3>
            <p className="text-xs text-[#3D1014]/60">
              Access live AI price forecasting & PRO member intelligence
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-[#3D1014]/70 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Mail className="w-3 h-3 text-[#3D1014]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F9F8F3] border border-[#E5E7EB] focus:border-[#3D1014] rounded-2xl px-4 py-3 text-sm text-[#3D1014] font-medium focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#3D1014]/70 uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3 h-3 text-[#3D1014]" />
                <span>Password</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-semibold text-[#3D1014]/60 hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F9F8F3] border border-[#E5E7EB] focus:border-[#3D1014] rounded-2xl px-4 py-3 text-sm text-[#3D1014] font-medium focus:outline-none transition-colors"
            />
          </div>

          <div className="bg-[#F9F8F3] p-3 rounded-xl border border-[#E5E7EB] text-xs text-[#3D1014]/70 flex items-center justify-between">
            <span className="flex items-center space-x-1 font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Demo Account Loaded</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Verified PRO
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3D1014] hover:bg-[#280a0d] text-white font-bold py-3.5 px-6 rounded-2xl shadow-burgundy-btn flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating PRO Session...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Intelligence Portal</span>
                <ArrowRight className="w-4 h-4 text-[#00F2FE]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#3D1014]/60">
          <span>Protected by 256-bit SSL Flight Intelligence Encryption</span>
        </div>

      </div>
    </div>
  );
}
