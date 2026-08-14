"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { ChecklistItem, Project, ProjectChecklistResult, ReadinessSummary } from "@/lib/types";
import { calculateReadiness } from "@/lib/readiness";
import { generateFullProjectReportMarkdown } from "@/lib/report-generator";
import { CriticalityBadge, ProjectStatusBadge, StatusBadge } from "@/components/ui/Badge";

// Client-side schema cache
let cachedReportItems: ChecklistItem[] | null = null;

export default function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>(cachedReportItems || []);
  const [results, setResults] = useState<ProjectChecklistResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const promises: Promise<any>[] = [fetch(`/api/projects/${projectId}`)];
    if (!cachedReportItems) {
      promises.push(fetch("/api/checklist"));
    }

    Promise.all(promises)
      .then(async ([projRes, checklistRes]) => {
        if (projRes.status === 401) {
          router.push(`/login?from=/projects/${projectId}/report`);
          return;
        }

        const projData = await projRes.json();
        if (checklistRes) {
          const checklistData = await checklistRes.json();
          if (checklistData.success && checklistData.data?.items) {
            cachedReportItems = checklistData.data.items;
            setItems(cachedReportItems || []);
          }
        }

        if (projData.success && projData.data) {
          setProject(projData.data);
          if (Array.isArray(projData.data.results)) {
            setResults(projData.data.results);
          }
        }
      })
      .catch((e) => console.error("Error loading report:", e))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  if (loading || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
        <Header backHref={`/projects/${projectId}`} />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-neutral-500">
          Generating Production Readiness Assessment Report...
        </div>
      </div>
    );
  }

  const resultMap = new Map<string, ProjectChecklistResult>();
  results.forEach((r) => resultMap.set(r.itemId, r));

  const summary = calculateReadiness(items, results);
  const markdownReport = generateFullProjectReportMarkdown(project, items, results, summary);

  const failedItems = items
    .filter((i) => resultMap.get(i.id)?.status === "failed")
    .map((i) => ({ item: i, result: resultMap.get(i.id)! }));

  const blockedItems = items
    .filter((i) => resultMap.get(i.id)?.status === "blocked")
    .map((i) => ({ item: i, result: resultMap.get(i.id)! }));

  const passedItems = items
    .filter((i) => resultMap.get(i.id)?.status === "passed")
    .map((i) => ({ item: i, result: resultMap.get(i.id)! }));

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy report:", e);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KAIROS_Report_${project.slug}_${project.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
      <Header
        backHref={`/projects/${project.id}`}
        projectTitle={project.name}
        projectVersion={project.version}
        projectEnv={project.environment}
        rightActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              className="font-mono text-xs"
            >
              <Icons.Copy size={13} />
              <span>{copied ? "Copied Markdown!" : "Copy Markdown"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className="font-mono text-xs"
            >
              <Icons.Download size={13} />
              <span>Export .MD</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="font-mono text-xs"
            >
              <Icons.FileText size={13} />
              <span>Print / PDF</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Report Header Card */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-500 uppercase tracking-wider mb-1">
                <span>Production Readiness Assessment</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
                {project.description || "No project description provided."}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
              <ProjectStatusBadge status={project.status} />
              <span className="font-mono text-xs text-neutral-500">
                Overall Verdict
              </span>
            </div>
          </div>

          {/* Project Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Version</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{project.version}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Environment</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 uppercase">{project.environment}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Lead QA Tester</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{project.leadTester}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Engineering Lead</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{project.owner}</span>
            </div>
          </div>
        </div>

        {/* Executive Readiness Dashboard Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs font-mono">
            <div className="text-[11px] text-neutral-500 uppercase">Pass Rate</div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {summary.percentPassed}%
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Passing verified checks</div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs font-mono">
            <div className="text-[11px] text-neutral-500 uppercase">Verification Progress</div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
              {summary.percentCompleted}%
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {summary.totalChecks - summary.untestedCount} of {summary.totalChecks} checks verified
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs font-mono">
            <div className="text-[11px] text-neutral-500 uppercase">Failed Checks</div>
            <div className={`text-3xl font-bold mt-1 ${summary.failedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-900 dark:text-white"}`}>
              {summary.failedCount}
            </div>
            <div className="text-[10px] text-rose-500 font-bold mt-0.5">
              {summary.criticalFailedCount} Critical blocker(s)
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs font-mono">
            <div className="text-[11px] text-neutral-500 uppercase">Release Gate</div>
            <div className="text-base font-bold text-neutral-900 dark:text-white mt-2 leading-tight">
              {summary.passedCount === summary.totalChecks - summary.notApplicableCount && summary.criticalFailedCount === 0
                ? "READY FOR PROD"
                : "REMEDIATION REQUIRED"}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              Zero critical defects allowed
            </div>
          </div>
        </div>

        {/* Failed / Blocked Verification Findings Table */}
        {(failedItems.length > 0 || blockedItems.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-300 dark:border-neutral-800">
              <Icons.AlertTriangle size={16} className="text-rose-600" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Action Required: Defect Findings & Blockers ({failedItems.length + blockedItems.length})
              </h2>
            </div>

            <div className="space-y-3">
              {[...failedItems, ...blockedItems].map(({ item, result }) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-900/60 rounded-sm space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.code}
                      </span>
                      <CriticalityBadge criticality={item.criticality} />
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </h3>
                    </div>
                    <StatusBadge status={result.status} />
                  </div>

                  {result.notes && (
                    <div className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-sm font-mono whitespace-pre-wrap border border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">QA Finding Notes:</span>
                      {result.notes}
                    </div>
                  )}

                  {result.stepsToReproduce && (
                    <div className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-sm font-mono whitespace-pre-wrap border border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">Steps to Reproduce:</span>
                      {result.stepsToReproduce}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                    <span>Guidance: {item.verificationGuide}</span>
                    {result.testerName && <span>Reported by: {result.testerName}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passed Verification Highlights */}
        {passedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-300 dark:border-neutral-800">
              <Icons.CheckCircle size={16} className="text-emerald-600" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Verified Passing Controls ({passedItems.length})
              </h2>
            </div>

            <div className="border border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
              {passedItems.slice(0, 15).map(({ item, result }) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 shrink-0">
                      {item.code}
                    </span>
                    <CriticalityBadge criticality={item.criticality} />
                    <span className="truncate text-neutral-800 dark:text-neutral-200 font-medium">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0 font-bold uppercase">
                    PASS
                  </span>
                </div>
              ))}
              {passedItems.length > 15 && (
                <div className="p-2.5 text-center text-xs font-mono text-neutral-500 bg-neutral-50 dark:bg-neutral-950">
                  + {passedItems.length - 15} additional verified checks in full export
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
