"use client";

import React, { useState } from "react";
import { ChecklistCategory, ChecklistItem, ProjectChecklistResult } from "@/lib/types";
import { CriticalityBadge, StatusBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";

export interface ChecklistItemCardProps {
  item: ChecklistItem;
  result: ProjectChecklistResult | undefined;
  category: ChecklistCategory | undefined;
  onStatusChange: (itemId: string, status: ProjectChecklistResult["status"]) => void;
  onOpenNotes: (item: ChecklistItem, result?: ProjectChecklistResult) => void;
  onCopyContext: (item: ChecklistItem, result: ProjectChecklistResult) => void;
}

function ChecklistItemCardComponent({
  item,
  result,
  category,
  onStatusChange,
  onOpenNotes,
  onCopyContext,
}: ChecklistItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const status = result ? result.status : "not_tested";
  const hasNotes = Boolean(result && (result.notes || result.expectedBehavior || result.actualBehavior || result.stepsToReproduce));

  return (
    <div
      className={`p-3.5 bg-white dark:bg-neutral-900 border rounded-sm transition-all shadow-sm flex flex-col justify-between ${
        status === "failed"
          ? "border-rose-400 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/15"
          : status === "passed"
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/15 dark:bg-emerald-950/10"
          : status === "blocked"
          ? "border-amber-400 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/15"
          : "border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
      }`}
    >
      <div>
        {/* Top Code & Tags */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {item.code}
            </span>
            <CriticalityBadge criticality={item.criticality} />
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
          {item.title}
        </h4>

        {/* Category */}
        {category && (
          <div className="mt-1 text-[10px] font-mono uppercase text-neutral-500 truncate">
            {category.name}
          </div>
        )}

        {/* Guidance preview */}
        <p className={`mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
          {item.verificationGuide || item.description}
        </p>

        {(item.verificationGuide || item.description).length > 80 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mt-1 uppercase"
          >
            {expanded ? "Show Less" : "Show More..."}
          </button>
        )}

        {/* Notes preview if present */}
        {hasNotes && result && (
          <div className="mt-2.5 p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-sm text-[11px]">
            <div className="font-mono font-bold text-[10px] text-neutral-500 uppercase flex items-center justify-between">
              <span>QA Finding</span>
              {result.testerName && <span>by {result.testerName}</span>}
            </div>
            <p className="text-neutral-800 dark:text-neutral-200 mt-0.5 line-clamp-2">
              {result.notes || result.actualBehavior || result.expectedBehavior}
            </p>
          </div>
        )}
      </div>

      {/* Bottom status action buttons */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 border border-neutral-300 dark:border-neutral-700 rounded-sm p-0.5 bg-white dark:bg-neutral-900">
          <button
            onClick={() => onStatusChange(item.id, "passed")}
            className={`px-2 py-0.5 text-[11px] font-mono rounded-sm transition-colors ${
              status === "passed"
                ? "bg-emerald-600 text-white font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-emerald-600"
            }`}
          >
            PASS
          </button>
          <button
            onClick={() => {
              onStatusChange(item.id, "failed");
              if (!hasNotes) onOpenNotes(item, result);
            }}
            className={`px-2 py-0.5 text-[11px] font-mono rounded-sm transition-colors ${
              status === "failed"
                ? "bg-rose-600 text-white font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-rose-600"
            }`}
          >
            FAIL
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenNotes(item, result)}
            className={`h-7 px-2 border text-[11px] font-mono flex items-center gap-1 rounded-sm transition-colors ${
              hasNotes
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100"
            }`}
            title="QA Notes"
          >
            <Icons.Note size={12} />
            <span>NOTE</span>
          </button>

          {result && (
            <button
              onClick={() => onCopyContext(item, result)}
              className="h-7 w-7 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center rounded-sm transition-colors"
              title="Copy Defect Context"
            >
              <Icons.Copy size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChecklistItemCard = React.memo(ChecklistItemCardComponent);
