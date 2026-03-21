"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { confirmPasswordReset, auth } from "@/lib/firebase";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!oobCode) {
      setErrorMsg("Invalid or missing reset link. Please request a new one.");
      return;
    }

    setStatus("submitting");
    try {
      await confirmPasswordReset(auth, oobCode, password);
      // Redirect to login with a success indicator
      router.replace("/login?reset=success");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/expired-action-code") {
        setErrorMsg("This reset link has expired. Please request a new one.");
      } else if (code === "auth/invalid-action-code") {
        setErrorMsg("This reset link is invalid or has already been used.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
      setStatus("error");
    }
  };

  return (
    <>
      <h2 className="font-serif text-2xl mb-2">Reset your password</h2>
      <p className="text-[#6B6860] text-xs leading-relaxed mb-8">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors"
          />
        </div>

        {(errorMsg || status === "error") && (
          <p className="text-xs text-red-500">{errorMsg ?? "Something went wrong."}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full py-4 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF9]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-3">
            <Image
              src="/logo.png"
              alt="Photography"
              width={160}
              height={40}
              className="object-contain h-9 w-auto"
            />
          </div>
          <p className="text-[10px] tracking-widest uppercase text-[#6B6860]">Client Portal</p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
