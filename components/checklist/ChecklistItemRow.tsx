"use client";

import React, { useState } from "react";
import { ChecklistCategory, ChecklistItem, ProjectChecklistResult } from "@/lib/types";
import { CriticalityBadge, StatusBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";

export interface ChecklistItemRowProps {
  item: ChecklistItem;
  result: ProjectChecklistResult | undefined;
  category: ChecklistCategory | undefined;
  onStatusChange: (itemId: string, status: ProjectChecklistResult["status"]) => void;
  onOpenNotes: (item: ChecklistItem, result?: ProjectChecklistResult) => void;
  onCopyContext: (item: ChecklistItem, result: ProjectChecklistResult) => void;
}

function ChecklistItemRowComponent({
  item,
  result,
  category,
  onStatusChange,
  onOpenNotes,
  onCopyContext,
}: ChecklistItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const status = result ? result.status : "not_tested";
  const hasNotes = Boolean(result && (result.notes || result.expectedBehavior || result.actualBehavior || result.stepsToReproduce));

  return (
    <div
      className={`border-b border-neutral-200 dark:border-neutral-800 transition-colors ${
        status === "failed"
          ? "bg-rose-50/25 dark:bg-rose-950/15"
          : status === "passed"
          ? "bg-emerald-50/15 dark:bg-emerald-950/10"
          : status === "blocked"
          ? "bg-amber-50/20 dark:bg-amber-950/15"
          : "hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 gap-3">
        {/* Left Column: Code, Title, Expand Button, Category & Criticality Tags */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 mt-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors shrink-0"
            title={expanded ? "Hide guidance" : "Show verification guidance"}
          >
            {expanded ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {item.code}
              </span>
              <CriticalityBadge criticality={item.criticality} />
              {category && (
                <span className="text-[10px] font-mono uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.2 border border-neutral-200 dark:border-neutral-700 rounded-sm truncate max-w-[180px]">
                  {category.name}
                </span>
              )}
            </div>

            <div
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer font-medium hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              {item.title}
            </div>
          </div>
        </div>

        {/* Right Column: Status Actions + Note Icon + 3-Dot Menu (Matching Wireframe) */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
          {/* Quick Status Buttons */}
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-sm overflow-hidden bg-white dark:bg-neutral-900 p-0.5 shadow-sm">
            {/* PASS Button */}
            <button
              onClick={() => onStatusChange(item.id, "passed")}
              className={`h-7 px-2 text-[11px] font-mono flex items-center gap-1 rounded-sm transition-all ${
                status === "passed"
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
              title="Mark as Passed"
            >
              <Icons.Check size={12} />
              <span>PASS</span>
            </button>

            {/* FAIL Button */}
            <button
              onClick={() => {
                onStatusChange(item.id, "failed");
                // Open note drawer if no notes yet
                if (!hasNotes) {
                  onOpenNotes(item, result);
                }
              }}
              className={`h-7 px-2 text-[11px] font-mono flex items-center gap-1 rounded-sm transition-all ${
                status === "failed"
                  ? "bg-rose-600 text-white font-bold shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
              title="Mark as Failed"
            >
              <Icons.Cross size={12} />
              <span>FAIL</span>
            </button>

            {/* BLOCKED Button */}
            <button
              onClick={() => onStatusChange(item.id, "blocked")}
              className={`h-7 px-1.5 text-[11px] font-mono flex items-center gap-1 rounded-sm transition-all ${
                status === "blocked"
                  ? "bg-amber-600 text-white font-bold shadow-sm"
                  : "text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
              title="Mark as Blocked"
            >
              <Icons.AlertTriangle size={11} />
              <span className="hidden sm:inline">BLOCK</span>
            </button>

            {/* N/A Button */}
            <button
              onClick={() => onStatusChange(item.id, "not_applicable")}
              className={`h-7 px-1.5 text-[11px] font-mono rounded-sm transition-all ${
                status === "not_applicable"
                  ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-bold"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title="Mark as Not Applicable"
            >
              N/A
            </button>
          </div>

          {/* QA Note Button (Matching Wireframe) */}
          <button
            onClick={() => onOpenNotes(item, result)}
            className={`h-7 px-2 border text-xs font-mono flex items-center gap-1.5 rounded-sm transition-colors relative ${
              hasNotes
                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
            title={hasNotes ? "Edit QA Note" : "Add QA Note"}
          >
            <Icons.Note size={13} />
            <span className="text-[11px] uppercase">Note</span>
            {hasNotes && (
              <span className="w-1.5 h-1.5 rounded-none bg-rose-500 ring-1 ring-white dark:ring-neutral-900" />
            )}
          </button>

          {/* 3-Dot Action Menu (Matching Wireframe) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-7 w-7 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center rounded-sm transition-colors"
              title="More Actions"
            >
              <Icons.MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-48 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl rounded-sm py-1 text-xs font-mono divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenNotes(item, result);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-800 dark:text-neutral-200"
                    >
                      <Icons.Note size={13} />
                      <span>{hasNotes ? "Edit QA Notes" : "Add QA Notes"}</span>
                    </button>
                    {result && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onCopyContext(item, result);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-800 dark:text-neutral-200"
                      >
                        <Icons.Copy size={13} />
                        <span>Copy Defect Context</span>
                      </button>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onStatusChange(item.id, "not_tested");
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      <Icons.History size={13} />
                      <span>Reset to Untested</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Accordion: Verification Guidance + Existing QA Notes */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 text-xs space-y-2 border-t border-dashed border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Verification Guidance:
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
              {item.verificationGuide || item.description}
            </p>
          </div>

          {/* If QA notes exist, render them here */}
          {hasNotes && result && (
            <div className="p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-1.5 mt-2">
              <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 uppercase">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  QA Notes by {result.testerName || "QA Team"}
                </span>
                <span>
                  {result.updatedAt
                    ? new Date(result.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </span>
              </div>
              {result.notes && (
                <p className="text-neutral-800 dark:text-neutral-200">{result.notes}</p>
              )}
              {result.expectedBehavior && (
                <div className="text-[11px]">
                  <span className="font-mono font-bold text-neutral-500">Expected: </span>
                  <span className="text-neutral-700 dark:text-neutral-300">{result.expectedBehavior}</span>
                </div>
              )}
              {result.actualBehavior && (
                <div className="text-[11px]">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Actual: </span>
                  <span className="text-neutral-700 dark:text-neutral-300">{result.actualBehavior}</span>
                </div>
              )}
              {result.stepsToReproduce && (
                <div className="text-[11px] whitespace-pre-wrap font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-2 border border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <span className="font-bold">Steps to reproduce:</span>
                  {"\n"}
                  {result.stepsToReproduce}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const ChecklistItemRow = React.memo(ChecklistItemRowComponent);
