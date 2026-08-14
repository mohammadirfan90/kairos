"use client";

import React from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { ChecklistCategory, Criticality, FilterOptions, Priority, CheckStatus } from "@/lib/types";
import { Icons } from "../ui/Icons";

export interface AdvanceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: ChecklistCategory[];
}

export function AdvanceFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categories,
}: AdvanceFilterModalProps) {
  const handleReset = () => {
    onFilterChange({
      search: filters.search,
      status: "all",
      criticality: "all",
      priority: "all",
      categoryId: "all",
      sectionGroup: "all",
      quickFilter: "all",
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Icons.Filter size={16} />
          <span>Advance Checklist Filters</span>
        </div>
      }
      description="Refine checklist items by risk criticality, category, verification group, or test status."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Criticality Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Risk Criticality
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {(["all", "Critical", "High", "Medium", "Low"] as const).map((crit) => (
              <button
                key={crit}
                type="button"
                onClick={() => onFilterChange({ ...filters, criticality: crit })}
                className={`py-1.5 px-2 border text-xs font-mono rounded-sm transition-colors uppercase ${
                  filters.criticality === crit
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {crit}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Check Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
            {(["all", "passed", "failed", "blocked", "not_tested", "not_applicable"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onFilterChange({ ...filters, status: st as CheckStatus | "all" })}
                className={`py-1.5 px-1.5 border text-[11px] font-mono rounded-sm transition-colors uppercase truncate ${
                  filters.status === st
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Section Group */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Verification Section
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {[
              { id: "all", label: "ALL SECTIONS" },
              { id: "Production & Security Controls", label: "PRODUCTION & SECURITY" },
              { id: "Visual & Functional QA", label: "VISUAL & FUNCTIONAL QA" },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, sectionGroup: sec.id as any })}
                className={`py-1.5 px-2 border text-[11px] font-mono rounded-sm transition-colors uppercase truncate ${
                  filters.sectionGroup === sec.id
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-bold"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Checklist Category
          </label>
          <select
            value={filters.categoryId || "all"}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
            className="w-full h-9 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 text-xs px-2.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans"
          >
            <option value="all">-- All Categories ({categories.length}) --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.sectionGroup === "Visual & Functional QA" ? "QA" : "SEC/PROD"})
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
