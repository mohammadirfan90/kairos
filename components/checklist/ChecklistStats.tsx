"use client";

import React from "react";
import { ReadinessSummary } from "@/lib/types";
import { ProjectStatusBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";

export function ChecklistStats({ summary }: { summary: ReadinessSummary }) {
  const isBlocked = summary.criticalFailedCount > 0 || summary.blockedCount > 0;
  const isReady = summary.canDeploy;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {/* Stat 1: Overall Readiness & Release Verdict */}
      <div
        className={`p-3.5 bg-white dark:bg-neutral-900 border rounded-sm transition-all shadow-sm ${
          isBlocked
            ? "border-rose-400 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10"
            : isReady
            ? "border-emerald-400 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10"
            : "border-neutral-300 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          <span>Release Verdict</span>
          <Icons.Shield size={14} className={isBlocked ? "text-rose-500" : isReady ? "text-emerald-500" : "text-neutral-400"} />
        </div>
        <div className="mb-2">
          <ProjectStatusBadge status={summary.verdict} />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <span>GO / NO-GO:</span>
          <span className={`font-bold ${summary.canDeploy ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {summary.canDeploy ? "GO (DEPLOYABLE)" : "NO-GO (BLOCKED)"}
          </span>
        </div>
      </div>

      {/* Stat 2: Verified Passed Checks */}
      <div className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          <span>Passed Checks</span>
          <Icons.Check size={14} className="text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {summary.passedCount}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            / {summary.totalChecks - summary.notApplicableCount} ({summary.percentPassed}%)
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
          <div
            style={{ width: `${summary.percentPassed}%` }}
            className="bg-emerald-600 h-full transition-all"
          />
        </div>
      </div>

      {/* Stat 3: Failed Checks & Blockers */}
      <div
        className={`p-3.5 bg-white dark:bg-neutral-900 border rounded-sm shadow-sm ${
          summary.failedCount > 0
            ? "border-rose-300 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/10"
            : "border-neutral-300 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          <span>Failures & Defects</span>
          <Icons.AlertTriangle size={14} className={summary.failedCount > 0 ? "text-rose-500" : "text-neutral-400"} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${summary.failedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-900 dark:text-neutral-100"}`}>
            {summary.failedCount}
          </span>
          {summary.criticalFailedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-sm">
              {summary.criticalFailedCount} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 mt-2">
          <span>EXPLICIT BLOCKERS:</span>
          <span className={`font-semibold ${summary.blockedCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-neutral-600 dark:text-neutral-400"}`}>
            {summary.blockedCount}
          </span>
        </div>
      </div>

      {/* Stat 4: Remaining / Untested */}
      <div className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
          <span>Pending Verification</span>
          <Icons.History size={14} className="text-neutral-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-neutral-800 dark:text-neutral-200">
            {summary.untestedCount}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            / {summary.totalChecks} Total
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 mt-2">
          <span>N/A EXCLUDED:</span>
          <span>{summary.notApplicableCount}</span>
        </div>
      </div>
    </div>
  );
}
