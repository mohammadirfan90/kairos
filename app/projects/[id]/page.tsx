"use client";

import React, { useEffect, useState, useMemo, useCallback, useDeferredValue } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ChecklistStats } from "@/components/checklist/ChecklistStats";
import { ChecklistToolbar } from "@/components/checklist/ChecklistToolbar";
import { ChecklistItemRow } from "@/components/checklist/ChecklistItemRow";
import { ChecklistItemCard } from "@/components/checklist/ChecklistItemCard";
import {
  ChecklistCategory,
  ChecklistItem,
  FilterOptions,
  Project,
  ProjectChecklistResult,
} from "@/lib/types";
import { calculateReadiness } from "@/lib/readiness";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

// Lazy-load modal components on demand
const QANoteDrawer = dynamic(
  () => import("@/components/checklist/QANoteDrawer").then((m) => m.QANoteDrawer),
  { ssr: false }
);
const CopyContextModal = dynamic(
  () => import("@/components/checklist/CopyContextModal").then((m) => m.CopyContextModal),
  { ssr: false }
);
const AdvanceFilterModal = dynamic(
  () => import("@/components/checklist/AdvanceFilterModal").then((m) => m.AdvanceFilterModal),
  { ssr: false }
);

// Global in-memory cache for static checklist schema
let cachedCategories: ChecklistCategory[] | null = null;
let cachedItems: ChecklistItem[] | null = null;

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<ChecklistCategory[]>(cachedCategories || []);
  const [items, setItems] = useState<ChecklistItem[]>(cachedItems || []);
  const [results, setResults] = useState<ProjectChecklistResult[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'list' vs 'grid'
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Category collapse state
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    criticality: "all",
    priority: "all",
    categoryId: "all",
    sectionGroup: "all",
    quickFilter: "all",
  });

  // Non-blocking deferred search value for 60fps input typing
  const deferredSearch = useDeferredValue(filters.search);

  const [isAdvanceFilterOpen, setIsAdvanceFilterOpen] = useState(false);

  // Modal drawers
  const [activeNoteItem, setActiveNoteItem] = useState<{
    item: ChecklistItem;
    result?: ProjectChecklistResult;
  } | null>(null);

  const [activeCopyItem, setActiveCopyItem] = useState<{
    item: ChecklistItem;
    result: ProjectChecklistResult;
  } | null>(null);

  // Ultra-fast single-call data loader
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [projRes, checklistRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        (!cachedCategories || !cachedItems) ? fetch("/api/checklist") : Promise.resolve(null),
      ]);

      if (projRes.status === 401) {
        router.push(`/login?from=/projects/${projectId}`);
        return;
      }

      const projData = await projRes.json();

      if (checklistRes) {
        const checklistData = await checklistRes.json();
        if (checklistData.success && checklistData.data) {
          cachedCategories = checklistData.data.categories || [];
          cachedItems = checklistData.data.items || [];
          setCategories(cachedCategories || []);
          setItems(cachedItems || []);
          setCollapsedCategories((prev) => {
            if (Object.keys(prev).length > 0) return prev;
            const init: Record<string, boolean> = {};
            cachedCategories?.forEach((c, idx) => {
              if (idx >= 2) init[c.id] = true;
            });
            return init;
          });
        }
      } else if (cachedCategories && cachedItems) {
        setCategories(cachedCategories);
        setItems(cachedItems);
        setCollapsedCategories((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const init: Record<string, boolean> = {};
          cachedCategories?.forEach((c, idx) => {
            if (idx >= 2) init[c.id] = true;
          });
          return init;
        });
      }

      if (projData.success && projData.data) {
        setProject(projData.data);
        if (Array.isArray(projData.data.results)) {
          setResults(projData.data.results);
        }
      }
    } catch (e) {
      console.error("Failed to load project workspace data:", e);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId, loadData]);

  // Quick lookup map for results by item ID (O(1) lookups)
  const resultMap = useMemo(() => {
    const map = new Map<string, ProjectChecklistResult>();
    for (let i = 0; i < results.length; i++) {
      map.set(results[i].itemId, results[i]);
    }
    return map;
  }, [results]);

  // Dynamic Readiness computation based on active results
  const summary = useMemo(() => {
    return calculateReadiness(items, results);
  }, [items, results]);

  // Update status handler (Optimistic UI)
  const handleStatusChange = useCallback(
    async (itemId: string, status: ProjectChecklistResult["status"]) => {
      if (!project) return;

      const existing = resultMap.get(itemId);
      const item = items.find((i) => i.id === itemId);
      const now = new Date().toISOString();

      const optimisticResult: ProjectChecklistResult = {
        id: existing ? existing.id : `res-${project.id}-${itemId}`,
        projectId: project.id,
        itemId,
        status,
        testerName: project.leadTester || "QA Tester",
        notes: existing?.notes,
        expectedBehavior: existing?.expectedBehavior,
        actualBehavior: existing?.actualBehavior,
        stepsToReproduce: existing?.stepsToReproduce,
        evidenceUrl: existing?.evidenceUrl,
        updatedAt: now,
        item,
      };

      // Optimistically update results immediately
      setResults((prev) => {
        const idx = prev.findIndex((r) => r.itemId === itemId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = optimisticResult;
          return next;
        }
        return [...prev, optimisticResult];
      });

      // Send API update in background
      fetch(`/api/projects/${project.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          status,
          testerName: project.leadTester,
          actor: project.leadTester,
        }),
      }).catch((e) => console.error("Failed to persist status change:", e));
    },
    [items, project, resultMap]
  );

  // Save QA Notes
  const handleSaveNotes = useCallback(
    async (
      itemId: string,
      data: {
        notes: string;
        expectedBehavior: string;
        actualBehavior: string;
        stepsToReproduce: string;
        evidenceUrl: string;
        status?: ProjectChecklistResult["status"];
      }
    ) => {
      if (!project) return;
      const existing = resultMap.get(itemId);
      const item = items.find((i) => i.id === itemId);
      const now = new Date().toISOString();

      const updatedResult: ProjectChecklistResult = {
        id: existing ? existing.id : `res-${project.id}-${itemId}`,
        projectId: project.id,
        itemId,
        status: data.status || existing?.status || "not_tested",
        testerName: project.leadTester || "QA Tester",
        notes: data.notes,
        expectedBehavior: data.expectedBehavior,
        actualBehavior: data.actualBehavior,
        stepsToReproduce: data.stepsToReproduce,
        evidenceUrl: data.evidenceUrl,
        updatedAt: now,
        item,
      };

      // Optimistic update
      setResults((prev) => {
        const idx = prev.findIndex((r) => r.itemId === itemId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updatedResult;
          return next;
        }
        return [...prev, updatedResult];
      });

      // Send API update in background
      fetch(`/api/projects/${project.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          status: updatedResult.status,
          notes: data.notes,
          expectedBehavior: data.expectedBehavior,
          actualBehavior: data.actualBehavior,
          stepsToReproduce: data.stepsToReproduce,
          evidenceUrl: data.evidenceUrl,
          testerName: project.leadTester,
          actor: project.leadTester,
        }),
      }).catch((e) => console.error("Failed to persist QA notes:", e));
    },
    [items, project, resultMap]
  );

  // Toggle Category Collapsed state
  const toggleCategory = useCallback((categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const toggleAllCategories = useCallback((collapse: boolean) => {
    const next: Record<string, boolean> = {};
    for (let i = 0; i < categories.length; i++) {
      next[categories[i].id] = collapse;
    }
    setCollapsedCategories(next);
  }, [categories]);

  // Filter items based on active toolbar, quick filter, and advance criteria
  const filteredItems = useMemo(() => {
    const term = deferredSearch.toLowerCase();
    const qf = filters.quickFilter;
    const st = filters.status;
    const crit = filters.criticality;
    const cat = filters.categoryId;
    const sec = filters.sectionGroup;

    return items.filter((item) => {
      const res = resultMap.get(item.id);
      const status = res ? res.status : "not_tested";
      const hasNotes = Boolean(res && (res.notes || res.expectedBehavior || res.actualBehavior || res.stepsToReproduce));

      // Search term
      if (term) {
        const matchCode = item.code.toLowerCase().includes(term);
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchGuide = item.verificationGuide.toLowerCase().includes(term);
        const matchNotes = res?.notes?.toLowerCase().includes(term) || false;
        if (!matchCode && !matchTitle && !matchGuide && !matchNotes) {
          return false;
        }
      }

      // Quick Filter Tab
      if (qf === "failures" && status !== "failed") return false;
      if (qf === "critical" && (item.criticality !== "Critical" || status === "passed")) return false;
      if (qf === "untested" && status !== "not_tested") return false;
      if (qf === "with_notes" && !hasNotes) return false;
      if (qf === "blockers" && status !== "blocked") return false;

      // Advance filters
      if (st && st !== "all" && status !== st) return false;
      if (crit && crit !== "all" && item.criticality !== crit) return false;
      if (cat && cat !== "all" && item.categoryId !== cat) return false;
      if (sec && sec !== "all" && item.sectionGroup !== sec) return false;

      return true;
    });
  }, [items, resultMap, deferredSearch, filters.quickFilter, filters.status, filters.criticality, filters.categoryId, filters.sectionGroup]);

  // Group filtered items by SectionGroup & Category for structured display
  const groupedSections = useMemo(() => {
    const groups: {
      section: string;
      categories: { category: ChecklistCategory; items: ChecklistItem[] }[];
    }[] = [];

    const sectionNames = [
      "Production & Security Controls",
      "Visual & Functional QA",
    ];

    for (let s = 0; s < sectionNames.length; s++) {
      const secName = sectionNames[s];
      const secCategories: { category: ChecklistCategory; items: ChecklistItem[] }[] = [];

      for (let c = 0; c < categories.length; c++) {
        const cat = categories[c];
        if (cat.sectionGroup === secName) {
          const catItems = filteredItems.filter((i) => i.categoryId === cat.id);
          if (catItems.length > 0) {
            secCategories.push({ category: cat, items: catItems });
          }
        }
      }

      if (secCategories.length > 0) {
        groups.push({ section: secName, categories: secCategories });
      }
    }

    return groups;
  }, [filteredItems, categories]);

  // Active advance filter count
  const activeAdvanceFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.criticality && filters.criticality !== "all") count++;
    if (filters.priority && filters.priority !== "all") count++;
    if (filters.categoryId && filters.categoryId !== "all") count++;
    if (filters.sectionGroup && filters.sectionGroup !== "all") count++;
    return count;
  }, [filters]);

  // Toolbar Quick Filter pill counts (O(N) computed once)
  const toolbarStats = useMemo(() => {
    let failures = 0;
    let critical = 0;
    let untested = 0;
    let withNotes = 0;
    let blockers = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const res = resultMap.get(item.id);
      const st = res ? res.status : "not_tested";
      if (st === "failed") failures++;
      if (st === "blocked") blockers++;
      if (st === "not_tested") untested++;
      if (item.criticality === "Critical" && st !== "passed") critical++;
      if (res && (res.notes || res.expectedBehavior || res.actualBehavior || res.stepsToReproduce)) withNotes++;
    }

    return {
      total: items.length,
      failures,
      critical,
      untested,
      withNotes,
      blockers,
    };
  }, [items, resultMap]);

  if (loading && !project) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
        <Header backHref="/" />
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6 py-4 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
              <div className="h-3 w-64 bg-neutral-100 dark:bg-neutral-850 rounded-sm" />
            </div>
            <div className="h-8 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
          </div>
        </div>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm h-24" />
            ))}
          </div>
          <div className="h-10 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
        <Header backHref="/" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm">
            <Icons.AlertTriangle size={32} className="text-rose-500" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Project Not Found
            </h1>
            <p className="text-xs text-neutral-500 font-sans max-w-sm">
              The requested project ID or workspace does not exist.
            </p>
          </div>
          <Button onClick={() => router.push("/")} size="sm" variant="outline" className="font-mono text-xs">
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
      {/* Platform Header */}
      <Header
        backHref="/"
        projectTitle={project.name}
        projectVersion={project.version}
        projectEnv={project.environment}
      />

      {/* Project Meta Header */}
      <ProjectHeader project={project} onRefresh={loadData} />

      {/* Workspace Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Executive Readiness Scorecard */}
        <ChecklistStats summary={summary} />

        {/* Action Toolbar & Filters */}
        <ChecklistToolbar
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenAdvanceFilter={() => setIsAdvanceFilterOpen(true)}
          activeAdvanceFilterCount={activeAdvanceFilterCount}
          stats={toolbarStats}
        />

        {/* Global Category Accordion Controls */}
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-1 pb-1">
          <div className="flex items-center gap-2">
            <span>SHOWING: <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{filteredItems.length}</strong> CHECKS ACROSS {groupedSections.reduce((acc, s) => acc + s.categories.length, 0)} CATEGORIES</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAllCategories(false)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline text-[11px] cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <button
              onClick={() => toggleAllCategories(true)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline text-[11px] cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Main Checklist Verification Area */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/50 space-y-3">
            <div className="inline-flex p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-sm">
              <Icons.Shield size={24} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No matching verification checks
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No checklist items match your active filters or search terms.
            </p>
            <Button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  criticality: "all",
                  priority: "all",
                  categoryId: "all",
                  sectionGroup: "all",
                  quickFilter: "all",
                })
              }
              variant="outline"
              size="sm"
              className="mt-2 text-xs font-mono"
            >
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === "list" ? (
          /* List View */
          <div className="space-y-6">
            {groupedSections.map((sec) => (
              <div key={sec.section} className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-300 dark:border-neutral-800">
                  <Icons.Layers size={15} className="text-neutral-500" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    {sec.section}
                  </h2>
                </div>

                <div className="border border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-neutral-900 shadow-sm divide-y divide-neutral-200 dark:divide-neutral-800">
                  {sec.categories.map((catGroup) => {
                    const isCollapsed = Boolean(collapsedCategories[catGroup.category.id]);
                    return (
                      <div key={catGroup.category.id} className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                        {/* Category Header Row with Click-to-Collapse */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(catGroup.category.id)}
                          className="w-full text-left bg-neutral-100/90 dark:bg-neutral-900/90 px-3 py-2 flex items-center justify-between text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80 transition-colors border-b border-neutral-200 dark:border-neutral-800 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-neutral-400">
                              {isCollapsed ? <Icons.ChevronRight size={13} /> : <Icons.ChevronDown size={13} />}
                            </span>
                            <span className="uppercase truncate">{catGroup.category.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono shrink-0 ml-2">
                            {catGroup.items.length} {catGroup.items.length === 1 ? "check" : "checks"}
                          </span>
                        </button>

                        {/* Checklist Items in Category (renders only when uncollapsed for 60fps rendering) */}
                        {!isCollapsed &&
                          catGroup.items.map((item) => (
                            <ChecklistItemRow
                              key={item.id}
                              item={item}
                              result={resultMap.get(item.id)}
                              category={catGroup.category}
                              onStatusChange={handleStatusChange}
                              onOpenNotes={(it, res) => setActiveNoteItem({ item: it, result: res })}
                              onCopyContext={(it, res) => setActiveCopyItem({ item: it, result: res })}
                            />
                          ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="space-y-6">
            {groupedSections.map((sec) => (
              <div key={sec.section} className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-300 dark:border-neutral-800">
                  <Icons.Layers size={15} className="text-neutral-500" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    {sec.section}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sec.categories.flatMap((catGroup) =>
                    catGroup.items.map((item) => (
                      <ChecklistItemCard
                        key={item.id}
                        item={item}
                        result={resultMap.get(item.id)}
                        category={catGroup.category}
                        onStatusChange={handleStatusChange}
                        onOpenNotes={(it, res) => setActiveNoteItem({ item: it, result: res })}
                        onCopyContext={(it, res) => setActiveCopyItem({ item: it, result: res })}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lazy-Loaded QA Note Drawer */}
      {activeNoteItem && (
        <QANoteDrawer
          isOpen={Boolean(activeNoteItem)}
          onClose={() => setActiveNoteItem(null)}
          item={activeNoteItem.item}
          result={activeNoteItem.result || null}
          onSave={handleSaveNotes}
        />
      )}

      {/* Lazy-Loaded 1-Click Copy Developer Defect Context Modal */}
      {activeCopyItem && project && (
        <CopyContextModal
          isOpen={Boolean(activeCopyItem)}
          onClose={() => setActiveCopyItem(null)}
          project={project}
          item={activeCopyItem.item}
          result={activeCopyItem.result}
        />
      )}

      {/* Lazy-Loaded Advance Filter Popover */}
      {isAdvanceFilterOpen && (
        <AdvanceFilterModal
          isOpen={isAdvanceFilterOpen}
          onClose={() => setIsAdvanceFilterOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
        />
      )}
    </div>
  );
}
