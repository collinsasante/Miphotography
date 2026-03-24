"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Chrome } from "lucide-react";

type View = "signin" | "register" | "register-sent" | "forgot" | "forgot-sent" | "finishing";

function LoginForm() {
  const { firebaseUser, sessionUser, sessionVerified, signInWithGoogle, signInWithEmail, finishMagicLinkSignIn, loading } =
    useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitNext = searchParams.get("next");
  const finishSignIn = searchParams.get("finishSignIn");

  const [tab, setTab]               = useState<"signin" | "register">("signin");
  const [view, setView]             = useState<View>("signin");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [forgotEmail, setForgotEmail]     = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  useEffect(() => {
    // Wait for a server-verified session (not just cache) so role is accurate
    if (!firebaseUser || loading || !sessionVerified) return;
    // Only allow relative paths to prevent open redirect attacks
    if (explicitNext && explicitNext.startsWith("/")) { router.replace(explicitNext); return; }
    if (sessionUser) {
      const dest = sessionUser.role === "admin" ? "/admin" : "/client";
      router.replace(dest);
    }
  }, [firebaseUser, sessionUser, sessionVerified, loading, router, explicitNext]);

  // Magic link finish flow (background support)
  useEffect(() => {
    if (finishSignIn !== "true") return;
    const savedEmail = localStorage.getItem("emailForSignIn") ?? "";
    if (!savedEmail) return;
    Promise.resolve().then(() => { setEmail(savedEmail); setView("finishing"); });
    finishMagicLinkSignIn(savedEmail).catch(() => {
      setError("Sign-in link expired or invalid. Please try again.");
      setView("signin");
    });
  }, [finishSignIn, finishMagicLinkSignIn]);

  const handleGoogle = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        if (explicitNext && explicitNext.startsWith("/")) {
          router.replace(explicitNext);
        } else {
          router.replace(session.role === "admin" ? "/admin" : "/client");
        }
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later or reset your password.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally { setIsSubmitting(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!registerEmail) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail }),
      });
      setView("register-sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!forgotEmail) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setView("forgot-sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  const inputClass = "w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2";
  const submitClass = "w-full py-4 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-60";

  if (loading || view === "finishing") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF9]">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-serif text-2xl text-[#1A1A18] mb-1">Miphotographer</p>
          <p className="text-[10px] tracking-widest uppercase text-[#6B6860]">Client Portal</p>
        </div>

        {/* ── Register sent ── */}
        {view === "register-sent" ? (
          <div className="text-center">
            <div className="w-12 h-12 border border-[#C4A882] flex items-center justify-center mx-auto mb-6">
              <span className="text-[#C4A882] text-xl">✓</span>
            </div>
            <h2 className="font-serif text-2xl mb-3">Check your email</h2>
            <p className="text-[#6B6860] text-sm leading-relaxed">
              We&apos;ve sent a link to <strong>{registerEmail}</strong> to set up your password. Check your inbox.
            </p>
            <button onClick={() => { setView("signin"); setTab("signin"); }} className="mt-8 text-xs text-[#6B6860] hover:text-[#1A1A18] underline">
              Back to sign in
            </button>
          </div>

        /* ── Forgot sent ── */
        ) : view === "forgot-sent" ? (
          <div className="text-center">
            <h2 className="font-serif text-2xl mb-3">Check your email</h2>
            <p className="text-[#6B6860] text-sm leading-relaxed">
              If an account exists for <strong>{forgotEmail}</strong>, we&apos;ve sent a reset link.
            </p>
            <button onClick={() => { setView("signin"); setForgotEmail(""); }} className="mt-8 text-xs text-[#6B6860] hover:text-[#1A1A18] underline">
              Back to sign in
            </button>
          </div>

        /* ── Forgot password form ── */
        ) : view === "forgot" ? (
          <>
            <h2 className="font-serif text-xl mb-1">Forgot your password?</h2>
            <p className="text-[#6B6860] text-xs leading-relaxed mb-6">Enter your email and we&apos;ll send a reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className={labelClass}>Email address</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="jane@example.com" required className={inputClass} />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isSubmitting} className={submitClass}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <button onClick={() => { setView("signin"); setError(null); }} className="mt-6 block text-xs text-[#6B6860] hover:text-[#1A1A18] underline mx-auto">
              Back to sign in
            </button>
          </>

        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-[#E8E4DF] mb-8">
              {(["signin", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setView(t); setError(null); }}
                  className={`flex-1 pb-3 text-[10px] tracking-widest uppercase transition-colors ${
                    tab === t ? "border-b-2 border-[#C4A882] text-[#1A1A18] -mb-px" : "text-[#6B6860] hover:text-[#1A1A18]"
                  }`}
                >
                  {t === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {tab === "register" ? (
              /* ── Create account ── */
              <>
                <p className="text-[#6B6860] text-sm leading-relaxed mb-6">
                  Enter your email and we&apos;ll send you a link to set up your password.
                </p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="jane@example.com" required autoComplete="email" className={inputClass} />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button type="submit" disabled={isSubmitting} className={submitClass}>
                    {isSubmitting ? "Sending…" : "Send setup link"}
                  </button>
                </form>
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-[#E8E4DF]" />
                  <span className="text-[10px] tracking-widest uppercase text-[#6B6860]">or</span>
                  <div className="h-px flex-1 bg-[#E8E4DF]" />
                </div>
                <button onClick={handleGoogle} disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 py-3.5 border border-[#E8E4DF] text-sm text-[#1A1A18] hover:border-[#1A1A18] transition-colors disabled:opacity-60">
                  <Chrome size={16} /> {isSubmitting ? "Signing in…" : "Continue with Google"}
                </button>
              </>
            ) : (
              /* ── Sign in ── */
              <>
                <button onClick={handleGoogle} disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 py-3.5 border border-[#E8E4DF] text-sm text-[#1A1A18] hover:border-[#1A1A18] transition-colors disabled:opacity-60">
                  <Chrome size={16} /> {isSubmitting ? "Signing in…" : "Continue with Google"}
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-[#E8E4DF]" />
                  <span className="text-[10px] tracking-widest uppercase text-[#6B6860]">or</span>
                  <div className="h-px flex-1 bg-[#E8E4DF]" />
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required autoComplete="email" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={() => { setError(null); setForgotEmail(email); setView("forgot"); }} className="text-xs text-[#6B6860] hover:text-[#1A1A18] underline">
                      Forgot password?
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button type="submit" disabled={isSubmitting} className={submitClass}>
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
