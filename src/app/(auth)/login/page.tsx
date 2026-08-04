"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [mode, setMode] = useState<"demo" | "email" | "register">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  const handleDemoLogin = async (demoEmail: string, demoName: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        email: demoEmail,
        name: demoName,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMsg("Failed to sign in with demo account");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg("Password must be at least 4 characters long");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await regRes.json();
        if (!regRes.ok) {
          setErrorMsg(data.error || "Registration failed");
          setLoading(false);
          return;
        }

        setSuccessMsg("Account created! Logging you in...");
      }

      const res = await signIn("credentials", {
        email,
        password,
        name: mode === "register" ? name : undefined,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMsg("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 card-surface text-center shadow-xl border border-slate-800 rounded-2xl relative overflow-hidden">
        {/* Top Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
            <MessageSquare className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">
            Welcome to Chirpify
          </h1>
          <p className="text-slate-400 text-xs mb-5 leading-relaxed">
            Test custom email login, quick demo profiles, or Google OAuth.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 mb-5">
            <button
              onClick={() => {
                setMode("demo");
                setErrorMsg("");
              }}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "demo"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              Quick Demo
            </button>
            <button
              onClick={() => {
                setMode("email");
                setErrorMsg("");
              }}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "email"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              Email Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-start gap-2 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-start gap-2 text-left">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: QUICK DEMO ACCOUNTS */}
          {mode === "demo" && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 font-medium text-left mb-1">
                Select a test profile to sign in instantly without credentials:
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("john.doe@chirpify.test", "John Doe")}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                      John Doe
                    </p>
                    <p className="text-[10px] text-slate-400">john.doe@chirpify.test</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("tester@chirpify.test", "Test User")}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    TU
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      Test User
                    </p>
                    <p className="text-[10px] text-slate-400">tester@chirpify.test</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          )}

          {/* MODE 2 & 3: EMAIL FORM (SIGN IN / REGISTER) */}
          {(mode === "email" || mode === "register") && (
            <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
              {mode === "register" && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl input-surface focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl input-surface focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl input-surface focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-xs mt-2"
              >
                {loading ? (
                  "Processing..."
                ) : mode === "register" ? (
                  <span className="flex items-center justify-center">
                    <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Register Account
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 mr-1.5" /> Sign In with Email
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-400 font-semibold">
                Or OAuth
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            onClick={() => signIn("google")}
            variant="outline"
            className="w-full border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center text-xs"
          >
            <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
