"use client";

import React from "react";
import { Icons } from "../ui/Icons";
import { FilterOptions } from "@/lib/types";

export interface ChecklistToolbarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onOpenAdvanceFilter: () => void;
  activeAdvanceFilterCount: number;
  stats: {
    total: number;
    failures: number;
    critical: number;
    untested: number;
    withNotes: number;
    blockers: number;
  };
}

export function ChecklistToolbar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onOpenAdvanceFilter,
  activeAdvanceFilterCount,
  stats,
}: ChecklistToolbarProps) {
  const handleQuickTab = (tab: FilterOptions["quickFilter"]) => {
    onFilterChange({
      ...filters,
      quickFilter: tab,
    });
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Top row: Search bar + Advance Filter + Grid/List toggle (Matching Wireframe) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icons.Search size={14} />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search checks by code, title, guidance, or QA notes... (e.g. SEC-001, webhook, RLS, auth)"
            className="w-full h-9 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Icons.Cross size={13} />
            </button>
          )}
        </div>

        {/* Advance Filter Button */}
        <button
          onClick={onOpenAdvanceFilter}
          className={`h-9 px-3 border text-xs font-mono flex items-center gap-1.5 rounded-sm transition-colors shrink-0 ${
            activeAdvanceFilterCount > 0
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-semibold"
              : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Icons.Filter size={13} />
          <span className="uppercase text-[11px]">Advance Filter</span>
          {activeAdvanceFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-sm">
              {activeAdvanceFilterCount}
            </span>
          )}
        </button>

        {/* Grid / List Switcher (Matching Wireframe) */}
        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-sm overflow-hidden shrink-0 bg-white dark:bg-neutral-900 p-0.5">
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-2.5 py-1 text-xs font-mono flex items-center gap-1 rounded-sm transition-colors ${
              viewMode === "list"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
            title="List View"
          >
            <Icons.List size={13} />
            <span className="text-[11px] uppercase">List</span>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-2.5 py-1 text-xs font-mono flex items-center gap-1 rounded-sm transition-colors ${
              viewMode === "grid"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
            title="Grid View"
          >
            <Icons.Grid size={13} />
            <span className="text-[11px] uppercase">Grid</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
        <button
          onClick={() => handleQuickTab("all")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            (!filters.quickFilter || filters.quickFilter === "all")
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          All ({stats.total})
        </button>

        <button
          onClick={() => handleQuickTab("failures")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            filters.quickFilter === "failures"
              ? "bg-rose-600 text-white border-rose-600 font-bold"
              : stats.failures > 0
              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold"
              : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100"
          }`}
        >
          Failures ({stats.failures})
        </button>

        <button
          onClick={() => handleQuickTab("critical")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            filters.quickFilter === "critical"
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          Critical ({stats.critical})
        </button>

        <button
          onClick={() => handleQuickTab("untested")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            filters.quickFilter === "untested"
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          Untested ({stats.untested})
        </button>

        <button
          onClick={() => handleQuickTab("with_notes")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            filters.quickFilter === "with_notes"
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          With QA Notes ({stats.withNotes})
        </button>

        <button
          onClick={() => handleQuickTab("blockers")}
          className={`px-2.5 py-1 rounded-sm border transition-colors shrink-0 text-[11px] uppercase ${
            filters.quickFilter === "blockers"
              ? "bg-amber-600 text-white border-amber-600 font-bold"
              : stats.blockers > 0
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 font-semibold"
              : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100"
          }`}
        >
          Blockers ({stats.blockers})
        </button>
      </div>
    </div>
  );
}
