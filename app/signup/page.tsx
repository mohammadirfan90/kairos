"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@/lib/types";

const AVAILABLE_ROLES: UserRole[] = [
  "Lead QA",
  "QA Tester",
  "Security Engineer",
  "Software Engineer",
  "DevOps / SRE",
  "Product Manager",
  "Admin",
];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Lead QA");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create account.");
        return;
      }

      // Success -> navigate to dashboard
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
            Create Team Member Account
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest font-mono">
              Team Onboarding
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-1">
              Set up your profile to track your test findings and approvals.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full h-10 px-3.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans transition-colors placeholder:text-neutral-400"
              />
            </div>

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
                Team Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-mono transition-colors"
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
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
              {loading ? "Creating Account..." : "Create Account & Join Team"}
            </Button>
          </form>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-xs text-neutral-500 font-sans">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 underline decoration-neutral-400 hover:text-black dark:hover:text-white"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <span>Protected by Neon PostgreSQL Authentication & Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
