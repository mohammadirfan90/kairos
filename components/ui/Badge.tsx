import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckStatus, Criticality, Priority, ProjectStatus } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "neutral"
    | "outline"
    | "passed"
    | "failed"
    | "blocked"
    | "untested"
    | "na"
    | "critical"
    | "high"
    | "medium"
    | "low";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-mono font-medium select-none uppercase tracking-wider rounded-sm border";

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px] leading-tight",
    md: "px-2 py-0.5 text-[11px] leading-snug",
  };

  const variantStyles = {
    default:
      "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100",
    neutral:
      "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
    outline:
      "bg-transparent text-neutral-700 border-neutral-300 dark:text-neutral-300 dark:border-neutral-700",
    passed:
      "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold",
    failed:
      "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold",
    blocked:
      "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-semibold",
    untested:
      "bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
    na: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 line-through opacity-80",
    critical:
      "bg-rose-100 text-rose-800 border-rose-400 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700 font-bold",
    high: "bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    medium:
      "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
    low: "bg-neutral-50 text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: CheckStatus }) {
  switch (status) {
    case "passed":
      return <Badge variant="passed">PASSED</Badge>;
    case "failed":
      return <Badge variant="failed">FAILED</Badge>;
    case "blocked":
      return <Badge variant="blocked">BLOCKED</Badge>;
    case "not_applicable":
      return <Badge variant="na">N/A</Badge>;
    case "not_tested":
    default:
      return <Badge variant="untested">UNTESTED</Badge>;
  }
}

export function CriticalityBadge({ criticality }: { criticality: Criticality }) {
  switch (criticality) {
    case "Critical":
      return <Badge variant="critical">CRITICAL</Badge>;
    case "High":
      return <Badge variant="high">HIGH</Badge>;
    case "Medium":
      return <Badge variant="medium">MEDIUM</Badge>;
    case "Low":
      return <Badge variant="low">LOW</Badge>;
  }
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "production_ready":
      return <Badge variant="passed">PRODUCTION READY</Badge>;
    case "blocked":
      return <Badge variant="failed">RELEASE BLOCKED</Badge>;
    case "rejected":
      return <Badge variant="failed">ACTION REQUIRED</Badge>;
    case "ready_for_review":
      return <Badge variant="neutral">READY FOR REVIEW</Badge>;
    case "in_progress":
    default:
      return <Badge variant="neutral">IN PROGRESS</Badge>;
  }
}
