import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md min-w-[320px] mx-auto">
        {/* Login Card */}
        <div className="card p-6 sm:p-8 md:p-10">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="mb-2 text-center">Lab Service Portal</h1>
            <p className="text-[#64748B] text-center">Sign in to manage your tickets</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block mb-2 text-[#334155]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block mb-2 text-[#334155]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#94A3B8] hover:text-[#64748B] transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#94A3B8] hover:text-[#64748B] transition-colors" />
                  )}
                </button>
              </div>
            </div>


            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-[#64748B] mb-2">
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToRegister}
                className="text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
              >
                Register
              </button>
            </p>
            <small className="text-[#94A3B8]">
              Need help? Contact your lab administrator
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}