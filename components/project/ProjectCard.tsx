"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { ProjectStatusBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";

export interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const summary = project.readinessSummary;
  const percent = summary ? summary.percentCompleted : 0;
  const passedPercent = summary ? summary.percentPassed : 0;

  return (
    <div className="group relative p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-600 transition-all rounded-sm shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0 flex-1">
            <Link href={`/projects/${project.id}`} className="block">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors truncate">
                  {project.name}
                </h3>
                <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.2 rounded-sm">
                  {project.version}
                </span>
              </div>
            </Link>
            {project.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        {/* Progress Mini Bar */}
        <div className="my-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <span>COMPLETION: {percent}%</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {passedPercent}% PASSED
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden flex">
            {summary && (
              <>
                <div
                  style={{ width: `${(summary.passedCount / Math.max(1, summary.totalChecks)) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`${summary.passedCount} Passed`}
                />
                <div
                  style={{ width: `${(summary.failedCount / Math.max(1, summary.totalChecks)) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`${summary.failedCount} Failed`}
                />
                <div
                  style={{ width: `${(summary.blockedCount / Math.max(1, summary.totalChecks)) * 100}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`${summary.blockedCount} Blocked`}
                />
              </>
            )}
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        {summary && (
          <div className="grid grid-cols-4 gap-1.5 py-2 border-t border-b border-neutral-100 dark:border-neutral-800/80 font-mono text-center">
            <div className="p-1 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-sm">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {summary.passedCount}
              </div>
              <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase">PASS</div>
            </div>

            <div className={`p-1 rounded-sm border ${
              summary.failedCount > 0
                ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40"
                : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60"
            }`}>
              <div className={`text-xs font-bold ${summary.failedCount > 0 ? "text-rose-700 dark:text-rose-300" : "text-neutral-600 dark:text-neutral-400"}`}>
                {summary.failedCount}
              </div>
              <div className={`text-[9px] uppercase ${summary.failedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-500"}`}>
                FAIL
              </div>
            </div>

            <div className={`p-1 rounded-sm border ${
              summary.criticalFailedCount > 0
                ? "bg-rose-100 dark:bg-rose-900/50 border-rose-300 dark:border-rose-700"
                : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60"
            }`}>
              <div className={`text-xs font-bold ${summary.criticalFailedCount > 0 ? "text-rose-800 dark:text-rose-200" : "text-neutral-600 dark:text-neutral-400"}`}>
                {summary.criticalFailedCount}
              </div>
              <div className={`text-[9px] uppercase ${summary.criticalFailedCount > 0 ? "text-rose-700 dark:text-rose-300" : "text-neutral-500"}`}>
                CRIT
              </div>
            </div>

            <div className="p-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm">
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {summary.untestedCount}
              </div>
              <div className="text-[9px] text-neutral-500 uppercase">PENDING</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer metadata & Quick Actions */}
      <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">QA: {project.leadTester || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(project);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-sm transition-colors"
              title="Edit project"
            >
              <Icons.Checklist size={13} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(project);
              }}
              className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-sm transition-colors"
              title="Delete project"
            >
              <Icons.Trash size={13} />
            </button>
          )}

          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1 px-2 py-0.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-sm transition-colors"
          >
            <span>WORKSPACE</span>
            <Icons.ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
