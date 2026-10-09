import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, Lock, Mail, User, Building, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength(signupPassword);
  const getStrengthLabel = (score) => {
    if (score === 0) return { label: 'Empty', color: 'bg-slate-700' };
    if (score <= 25) return { label: 'Weak', color: 'bg-rose-500' };
    if (score <= 50) return { label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-teal-500' };
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!loginEmail.trim() || !loginPassword) {
      setError('Please provide both your work email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(loginEmail.trim(), loginPassword);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!organization.trim()) {
      setError('Please specify your organization name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the terms of service and privacy policy to proceed.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        email: signupEmail.trim(),
        password: signupPassword,
        full_name: fullName.trim(),
        organization: organization.trim(),
        role: 'Analyst'
      });
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    try {
      setForgotLoading(true);
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMsg(res.message);
    } catch (err) {
      setForgotMsg(err.message || 'Failed to dispatch reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy-900 border border-slate-800 text-teal-400 mb-3 shadow-card">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">RiskRadar</h1>
        <p className="text-sm text-slate-400 mt-1">
          AI-Powered Digital Risk Protection Platform
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md surface-card p-6 sm:p-8 relative z-10">
        
        {/* Toggle Header */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${
              isLogin ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
            {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${
              !isLogin ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
            {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />}
          </button>
        </div>

        {/* Inline Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="analyst@enterprise.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotModalOpen(true); setForgotMsg(''); }}
                  className="text-xs text-teal-400/90 hover:text-teal-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-navy-950 text-teal-500 focus:ring-teal-500/20"
                />
                <span className="text-xs text-slate-400">Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Fill Credentials for easy demonstration */}
            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Demonstration Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('analyst@riskradar.io', 'Analyst@2026')}
                  className="px-2.5 py-1.5 rounded-md bg-navy-850 hover:bg-navy-800 border border-slate-800 text-left text-xs text-slate-300 transition-colors"
                >
                  <div className="font-medium text-slate-200">SOC Analyst</div>
                  <div className="text-[10px] text-slate-400 truncate">analyst@riskradar.io</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('admin@riskradar.io', 'RiskRadar@2026')}
                  className="px-2.5 py-1.5 rounded-md bg-navy-850 hover:bg-navy-800 border border-slate-800 text-left text-xs text-slate-300 transition-colors"
                >
                  <div className="font-medium text-slate-200">CISO Admin</div>
                  <div className="text-[10px] text-slate-400 truncate">admin@riskradar.io</div>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Alex Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="CyberGuard Technologies"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Corporate Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="alex@cyberguard.io"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signupPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-medium ${strengthScore >= 75 ? 'text-teal-400' : strengthScore >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {getStrengthLabel(strengthScore).label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthLabel(strengthScore).color}`}
                      style={{ width: `${strengthScore}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-slate-400">
                    <span className={signupPassword.length >= 8 ? 'text-teal-400' : 'text-slate-500'}>
                      &bull; 8+ characters
                    </span>
                    <span className={/[A-Z]/.test(signupPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      &bull; Uppercase letter
                    </span>
                    <span className={/[0-9]/.test(signupPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      &bull; Number
                    </span>
                    <span className={/[^A-Za-z0-9]/.test(signupPassword) ? 'text-teal-400' : 'text-slate-500'}>
                      &bull; Special symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-navy-950 text-teal-500 focus:ring-teal-500/20"
                />
                <span className="text-xs text-slate-400 leading-tight">
                  I agree to the <span className="text-teal-400/90 hover:underline">Terms of Service</span> and <span className="text-teal-400/90 hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-sm p-6 relative">
            <h3 className="text-base font-semibold text-white mb-1.5 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-400" />
              Password Reset
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your work email address to receive password recovery instructions.
            </p>

            {forgotMsg && (
              <div className="mb-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs">
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@enterprise.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-500">
        RiskRadar v1.0 &bull; Enterprise Digital Risk Protection
      </div>
    </div>
  );
}
