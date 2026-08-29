import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageSelector } from "../../components/common/LanguageSelector";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // Hard reload to ensure fresh session context propagates everywhere
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
            {/* Background ambient elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-sm mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Personal Health Memory
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Record. Remember. Understand. Prepare. Share.
              </h2>

              <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                One living digital timeline for your vitals, symptoms, lab
                reports, doctor visits, and personal health journey.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative z-10 space-y-3 my-8">
              {[
                "Natural voice input in 10 Indian languages",
                "Instant AI medical document digitization",
                "Personal health calendar & analytics",
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
              <span>Private & secure personal health record</span>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your health memory.
              </p>
            </div>

            {/* Quick Demo Autofill Notice */}
            <div className="mt-5 p-3.5 rounded-2xl bg-health-50 border border-health-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-health-900">
                  Demo Account Available
                </p>
                <p className="text-[11px] text-health-700">
                  Prefilled for Rahul Sharma (32 yrs)
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrefillDemo}
                className="px-2.5 py-1 text-xs font-bold text-health-800 bg-white hover:bg-health-100 border border-health-300 rounded-xl transition-all"
              >
                Autofill
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
                  Email or Phone Number
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
                    placeholder="demo@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Password
                  </label>
                  <a
                    href="/signup"
                    className="text-xs font-semibold text-health-700 hover:underline"
                  >
                    Forgot password?
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
                  {loading ? "Signing in..." : "Login to Health Memory"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social Login Mock */}
              <button
                type="button"
                onClick={async () => {
                  handlePrefillDemo();
                  // Autofills the password field with "password" — the user must
                  // click Login to submit (no silent login with a hardcoded password).
                }}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Use Demo Account</span>
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-health-700 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60">
        © 2026 AarogyaTimeline • Personal Health Memory Platform
      </footer>
    </div>
  );
};
