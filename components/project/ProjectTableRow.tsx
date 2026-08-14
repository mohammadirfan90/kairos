"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { ProjectStatusBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";

export interface ProjectTableRowProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectTableRow({ project, onEdit, onDelete }: ProjectTableRowProps) {
  const summary = project.readinessSummary;

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/70 dark:hover:bg-neutral-900/60 transition-colors group">
      {/* Project Name & Version */}
      <td className="py-3 px-4">
        <Link href={`/projects/${project.id}`} className="block">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
              {project.name}
            </span>
            <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.2 rounded-sm">
              {project.version}
            </span>
          </div>
          {project.description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-sm mt-0.5">
              {project.description}
            </p>
          )}
        </Link>
      </td>

      {/* Environment */}
      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
        <span className="uppercase px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 rounded-sm">
          {project.environment}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <ProjectStatusBadge status={project.status} />
      </td>

      {/* Passed Checks */}
      <td className="py-3 px-4 font-mono text-xs">
        {summary ? (
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {summary.passedCount} / {summary.totalChecks - summary.notApplicableCount} ({summary.percentPassed}%)
          </span>
        ) : (
          "—"
        )}
      </td>

      {/* Failed Checks (with critical indicator) */}
      <td className="py-3 px-4 font-mono text-xs">
        {summary && summary.failedCount > 0 ? (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
            <span>{summary.failedCount} FAIL</span>
            {summary.criticalFailedCount > 0 && (
              <span className="px-1 py-0.2 bg-rose-600 text-white text-[10px] rounded-sm">
                {summary.criticalFailedCount} CRIT
              </span>
            )}
          </div>
        ) : (
          <span className="text-neutral-400 dark:text-neutral-600">0</span>
        )}
      </td>

      {/* Lead QA */}
      <td className="py-3 px-4 text-xs text-neutral-600 dark:text-neutral-400 font-mono truncate">
        {project.leadTester || "—"}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-sm transition-colors"
              title="Edit Project"
            >
              <Icons.Checklist size={13} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(project)}
              className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-sm transition-colors"
              title="Delete Project"
            >
              <Icons.Trash size={13} />
            </button>
          )}

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-sm transition-colors"
          >
            <span>RUN QA</span>
            <Icons.ChevronRight size={12} />
          </Link>
        </div>
      </td>
    </tr>
  );
}
