import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm">
          <Icons.AlertTriangle size={32} className="text-amber-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            404 – Page Not Found
          </h1>
          <p className="text-xs text-neutral-500 font-sans max-w-sm">
            The requested production readiness workspace, report, or resource could not be found.
          </p>
        </div>
        <Link href="/">
          <Button size="sm" variant="default" className="font-mono text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
