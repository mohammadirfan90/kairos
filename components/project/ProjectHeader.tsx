"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import { Icons } from "../ui/Icons";
import { ProjectStatusBadge } from "../ui/Badge";

// Lazy-load secondary modals so initial workspace page render is ultra-lightweight
const ProjectActivityDrawer = dynamic(
  () => import("../checklist/ProjectActivityDrawer").then((m) => m.ProjectActivityDrawer),
  { ssr: false }
);
const EditProjectModal = dynamic(
  () => import("./EditProjectModal").then((m) => m.EditProjectModal),
  { ssr: false }
);
const DeleteProjectModal = dynamic(
  () => import("./DeleteProjectModal").then((m) => m.DeleteProjectModal),
  { ssr: false }
);

export interface ProjectHeaderProps {
  project: Project;
  onRefresh: () => void;
}

export function ProjectHeader({ project, onRefresh }: ProjectHeaderProps) {
  const router = useRouter();
  const [showLogs, setShowLogs] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Project Title & Metadata */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  {project.name}
                </h1>
                <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded-sm font-semibold">
                  {project.version}
                </span>
                <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded-sm uppercase">
                  {project.environment}
                </span>
                <ProjectStatusBadge status={project.status} />
              </div>

              {project.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}

              {/* Secondary Metadata Info Chips */}
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-1 flex-wrap">
                <div>
                  <span className="text-neutral-400">Lead QA:</span>{" "}
                  <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{project.leadTester}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Owner:</span>{" "}
                  <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{project.owner}</span>
                </div>
                {project.targetReleaseDate && (
                  <div>
                    <span className="text-neutral-400">Release Date:</span>{" "}
                    <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{project.targetReleaseDate}</span>
                  </div>
                )}
                {project.deploymentUrl && (
                  <a
                    href={project.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white underline decoration-neutral-400"
                  >
                    <span>Deployment</span>
                    <Icons.ExternalLink size={12} />
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white underline decoration-neutral-400"
                  >
                    <span>Repository</span>
                    <Icons.ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowEditModal(true)}
                className="h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono flex items-center gap-1.5 rounded-sm transition-colors"
                title="Edit Project Details"
              >
                <Icons.Edit size={13} />
                <span>Edit Project</span>
              </button>

              <button
                onClick={() => setShowLogs(true)}
                className="h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-mono flex items-center gap-1.5 rounded-sm transition-colors"
                title="View QA Audit Trail"
              >
                <Icons.History size={13} />
                <span>Audit Trail</span>
              </button>

              <Link
                href={`/projects/${project.id}/report`}
                className="h-8 px-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-mono font-semibold flex items-center gap-1.5 rounded-sm transition-colors shadow-sm"
              >
                <Icons.FileText size={13} />
                <span>QA Report</span>
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="h-8 w-8 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center rounded-sm transition-colors"
                title="Delete Project"
              >
                <Icons.Trash size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLogs && (
        <ProjectActivityDrawer
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
          projectId={project.id}
        />
      )}

      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onSuccess={() => onRefresh()}
        />
      )}

      {showDeleteModal && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          project={project}
          onSuccess={() => {
            router.push("/");
            router.refresh();
          }}
        />
      )}
    </>
  );
}
