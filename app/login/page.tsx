"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed.");
        return;
      }

      // Success -> navigate to requested path or dashboard
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm p-6 sm:p-7 shadow-sm space-y-5">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest font-mono">
          Team Authentication
        </h2>
        <p className="text-xs text-neutral-500 font-sans mt-1">
          Sign in to execute checks and record QA findings.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-sm text-xs text-rose-700 dark:text-rose-300 font-mono flex items-start gap-2">
          <Icons.AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-mono uppercase font-semibold text-neutral-600 dark:text-neutral-400 text-[11px] block">
            Work Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.vance@company.com"
            className="w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans transition-colors placeholder:text-neutral-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono uppercase font-semibold text-neutral-600 dark:text-neutral-400 text-[11px] block">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans transition-colors placeholder:text-neutral-400"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 font-mono text-xs font-semibold mt-2 shadow-xs cursor-pointer"
          size="md"
        >
          {loading ? "Authenticating..." : "Sign In to Workspace"}
        </Button>
      </form>

      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <p className="text-xs text-neutral-500 font-sans">
          Need team access?{" "}
          <Link
            href="/signup"
            className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 underline decoration-neutral-400 hover:text-black dark:hover:text-white"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 dark:bg-[#09090b] px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_lightMode.svg"
              alt="KAIROS"
              width={250}
              height={75}
              className="h-[75px] w-[250px] dark:hidden object-contain"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_darkMode.svg"
              alt="KAIROS"
              width={250}
              height={75}
              className="h-[75px] w-[250px] hidden dark:block object-contain"
            />
          </div>
          <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            Production QA & Security Gate System
          </p>
        </div>

        <Suspense fallback={<div className="p-6 text-center text-xs font-mono text-neutral-500">Loading authentication form...</div>}>
          <LoginForm />
        </Suspense>

        {/* Security watermark footer */}
        <div className="text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <span>Protected by Neon PostgreSQL Authentication & Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
