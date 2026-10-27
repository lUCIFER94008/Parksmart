"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Car, 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  QrCode,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");
  const authRequired = searchParams.get("authRequired") === "true";
  const accessDenied = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "Driver / User",
      email: "driver@parksmart.io",
      password: "Password123!",
      desc: "alex.morgan",
      icon: User,
      color: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    },
    {
      role: "Parking Operator",
      email: "operator@parksmart.io",
      password: "Password123!",
      desc: "marcus.gate1",
      icon: QrCode,
      color: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
    },
    {
      role: "System Admin",
      email: "admin@parksmart.io",
      password: "Password123!",
      desc: "super.admin",
      icon: ShieldCheck,
      color: "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100",
    },
  ];

  const handleQuickFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
    toast.info(`Filled credentials for ${acc.role}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        toast.error(data.error || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      // Determine safe redirect
      let targetUrl = data.defaultRedirect || "/dashboard";
      if (
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        !callbackUrl.startsWith("/\\") &&
        !callbackUrl.includes("://")
      ) {
        targetUrl = callbackUrl;
      }

      // Navigate to destination
      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      const msg = err.message || "Network error. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Car className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Park<span className="text-emerald-600">Smart</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your bookings, QR passes, or facility management console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          {/* Callback / Auth Required Notice */}
          {authRequired && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-in fade-in">
              <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                Authentication required. Please sign in to confirm your parking reservation or access protected features.
              </span>
            </div>
          )}

          {/* Access Denied Warning */}
          {accessDenied && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Access Denied: You do not have permission to view that privileged portal. Please sign in with an authorized account.
              </span>
            </div>
          )}

          {/* Quick Fill Demo Role Buttons */}
          <div className="mb-6">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              ⚡ Quick Fill Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center text-xs font-medium transition-all hover:scale-[1.02] cursor-pointer ${acc.color}`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-[11px] font-semibold">{acc.role.split(" ")[0]}</span>
                    <span className="text-[9px] opacity-75">{acc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@parksmart.io"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Demo password is Password123!")}
                  className="text-[11px] font-medium text-emerald-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              id="login-submit-button"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{" "}
              <Link
                href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="font-semibold text-emerald-600 hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
