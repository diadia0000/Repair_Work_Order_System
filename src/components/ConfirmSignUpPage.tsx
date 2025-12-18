import { useState } from 'react';
import { Mail, KeyRound } from 'lucide-react';

interface ConfirmSignUpPageProps {
  email: string;
  onConfirm: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onBack: () => void;
}

export function ConfirmSignUpPage({ email, onConfirm, onResendCode, onBack }: ConfirmSignUpPageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      await onResendCode();
      setSuccess('Verification code resent successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md min-w-[320px] mx-auto">
        <div className="card p-6 sm:p-8 md:p-10">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
            <p className="text-[#64748B]">
              We sent a verification code to
            </p>
            <p className="text-[#334155] font-medium mt-1">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Verification Code Input */}
            <div>
              <label htmlFor="code" className="block mb-2 text-[#334155]">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                />
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white py-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend and Back */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center space-y-3">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-[#2563EB] hover:text-[#1D4ED8] text-sm transition-colors disabled:opacity-50"
            >
              Didn't receive the code? Resend
            </button>
            <div>
              <button
                onClick={onBack}
                className="text-[#64748B] hover:text-[#334155] text-sm transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

