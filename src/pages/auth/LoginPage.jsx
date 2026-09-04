import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  Smartphone,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageSelector } from "../../components/common/LanguageSelector";
import { abhaService } from "../../services/abhaService";

export const LoginPage = () => {
  const { login, abhaLogin, loading } = useAuth();
  const { t } = useLanguage();
  const authT = t?.auth || {};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ABHA login state
  const [abhaAddress, setAbhaAddress] = useState("");
  const [abhaOtp, setAbhaOtp] = useState("");
  const [abhaStep, setAbhaStep] = useState("idle");
  const [abhaError, setAbhaError] = useState("");
  const [abhaLoading, setAbhaLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [derivedOtp, setDerivedOtp] = useState(null);
  const [otpCopied, setOtpCopied] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      window.location.href = "/app/home";
    } catch (err) {
      const msg = err.message || err.toString();
      if (msg.includes("confirm")) {
        setError("Signup succeeded! Check your inbox for the confirmation email — or disable email confirmation in Supabase Dashboard → Authentication → Settings.");
      } else if (msg.includes("not registered") || msg.includes("Invalid login")) {
        setError("No account with that email. Please sign up first.");
      } else {
        setError(msg);
      }
    }
  };

  const handlePrefillDemo = () => {
    setEmail("demo@example.com");
    setPassword("password");
  };

  // ── ABHA login ─────────────────────────────────────────────
  const handleAbhaAddressSubmit = async (e) => {
    e.preventDefault();
    setAbhaError("");
    if (!abhaService.isConfigured()) {
      setAbhaError("ABHA login is not configured on this server.");
      return;
    }
    setAbhaLoading(true);
    try {
      const result = await abhaService.initiateLogin(abhaAddress);
      if (result.transactionId) setTransactionId(result.transactionId);
      if (result.otp) setDerivedOtp(result.otp);
      setOtpCopied(false);
      setAbhaStep("otp");
    } catch (err) {
      setAbhaError(err.message || "Failed to initiate ABHA login.");
    } finally {
      setAbhaLoading(false);
    }
  };

  const handleAbhaOtpSubmit = async (e) => {
    e.preventDefault();
    setAbhaError("");
    setAbhaLoading(true);
    try {
      await abhaLogin(abhaAddress, abhaOtp, transactionId);
      window.location.href = "/app/home";
    } catch (err) {
      setAbhaError(err.message || "ABHA login failed.");
    } finally {
      setAbhaLoading(false);
    }
  };

  const resetAbhaFlow = () => {
    setAbhaAddress("");
    setAbhaOtp("");
    setAbhaStep("idle");
    setTransactionId(null);
    setDerivedOtp(null);
    setOtpCopied(false);
    setAbhaError("");
  };

  const handleResendOtp = async () => {
    setAbhaError("");
    setAbhaLoading(true);
    try {
      const result = await abhaService.initiateLogin(abhaAddress);
      if (result.otp) setDerivedOtp(result.otp);
      setOtpCopied(false);
    } catch (err) {
      setAbhaError(err.message || "Failed to resend OTP.");
    } finally {
      setAbhaLoading(false);
    }
  };

  const handleCopyOtp = async () => {
    if (!derivedOtp) return;
    try {
      await navigator.clipboard.writeText(derivedOtp);
      setOtpCopied(true);
      setTimeout(() => setOtpCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-health-600/25">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              {t.brand.name}
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              {t.brand.tagline}
            </p>
          </div>
        </div>

        <LanguageSelector />
      </header>

      {/* Main Split Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-soft-lg border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Visual Brand Story */}
          <div className="bg-gradient-to-br from-health-800 via-teal-900 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-sm mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                {authT.badge || "Personal Health Memory"}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {authT.headline || "Record. Remember. Understand. Prepare. Share."}
              </h2>

              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                {authT.subheadline || "One living digital timeline for your vitals, symptoms, lab reports, doctor visits, and personal health journey."}
              </p>
            </div>

            <div className="relative z-10 space-y-3 my-8">
              {[
                authT.feature1 || "Natural voice input in 10 Indian languages",
                authT.feature2 || "Instant AI medical document digitization",
                authT.feature3 || "Personal health calendar & analytics",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs text-teal-100 font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{authT.securityBadge || "Private & secure personal health record"}</span>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {authT.welcomeBack || "Welcome Back"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authT.welcomeSubtitle || "Enter your credentials to access your health memory."}
              </p>
            </div>

            {/* Demo autofill notice */}
            <div className="mt-5 p-3.5 rounded-2xl bg-health-50 border border-health-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-health-900">
                  {authT.demoAvailable || "Demo Account Available"}
                </p>
                <p className="text-[11px] text-health-700">
                  {authT.demoPrefilled || "Prefilled for Rahul Sharma (32 yrs)"}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrefillDemo}
                className="px-2.5 py-1 text-xs font-bold text-health-800 bg-white hover:bg-health-100 border border-health-300 rounded-xl transition-all"
              >
                {authT.autofill || "Autofill"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {authT.emailOrPhone || "Email or Phone Number"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={authT.emailPlaceholder || "demo@example.com"}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    {authT.password || "Password"}
                  </label>
                  <a
                    href="/signup"
                    className="text-xs font-semibold text-health-700 hover:underline"
                  >
                    {authT.forgotPassword || "Forgot password?"}
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-health-600 hover:bg-health-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-health-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>
                  {loading ? (authT.signingIn || "Signing in...") : (authT.loginButton || "Login to Health Memory")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ── ABHA Login Divider ── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-semibold">
                  {authT.or || "or"}
                </span>
              </div>
            </div>

            {abhaStep === "idle" ? (
              <form onSubmit={handleAbhaAddressSubmit}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {authT.abhaAddress || "ABHA Address"}
                </label>
                <div className="relative mb-3">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={abhaAddress}
                    onChange={(e) => setAbhaAddress(e.target.value)}
                    required
                    placeholder={authT.abhaPlaceholder || "yourname@abdm"}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>

                {abhaError && (
                  <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                    {abhaError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={abhaLoading || !abhaAddress.trim()}
                  className="w-full py-3 px-4 bg-health-600 hover:bg-health-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-health-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {abhaLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  <span>{abhaLoading ? (authT.sendingOtp || "Sending OTP...") : (authT.loginWithAbha || "Login with ABHA")}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleAbhaOtpSubmit}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    {authT.enterOtp || "Enter OTP sent to your ABHA-linked mobile"}
                  </label>
                  <button
                    type="button"
                    onClick={resetAbhaFlow}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    {authT.change || "Change"}
                  </button>
                </div>

                {/* Demo OTP display for hackathon/judges */}
                {derivedOtp && (
                  <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-900 mb-0.5">
                        {authT.demoOtpNotice || "Demo OTP (auto-generated from your ABHA address)"}
                      </p>
                      <p className="text-sm font-mono font-bold text-emerald-700 tracking-widest">
                        {derivedOtp}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                      title="Copy OTP"
                    >
                      {otpCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                <div className="relative mb-2">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={abhaOtp}
                    onChange={(e) =>
                      setAbhaOtp(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    required
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 tracking-widest text-center focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  {authT.otpSentTo || "OTP sent to the mobile linked with"} {abhaAddress}
                </p>

                {abhaError && (
                  <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                    {abhaError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={abhaLoading || abhaOtp.length < 4}
                  className="w-full py-3 px-4 bg-health-600 hover:bg-health-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-health-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {abhaLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{abhaLoading ? (authT.verifying || "Verifying...") : (authT.verifyAndLogin || "Verify & Login")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={abhaLoading}
                  className="w-full mt-2 py-2 px-4 bg-transparent text-health-700 hover:text-health-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {authT.resendOtp || "Resend OTP"}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-slate-500 mt-6">
              {authT.noAccount || "Don't have an account?"}{" "}
              <Link
                to="/signup"
                className="font-bold text-health-700 hover:underline"
              >
                {authT.createAccount || "Create an account"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60">
        {authT.footerText || "© 2026 MediPulse • Personal Health Memory Platform"}
      </footer>
    </div>
  );
};
