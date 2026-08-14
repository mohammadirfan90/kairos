"use client";

import React, { useEffect, useState, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectTableRow } from "@/components/project/ProjectTableRow";
import { Project } from "@/lib/types";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

// Lazy-load dashboard modals on demand
const CreateProjectModal = dynamic(
  () => import("@/components/project/CreateProjectModal").then((m) => m.CreateProjectModal),
  { ssr: false }
);
const EditProjectModal = dynamic(
  () => import("@/components/project/EditProjectModal").then((m) => m.EditProjectModal),
  { ssr: false }
);
const DeleteProjectModal = dynamic(
  () => import("@/components/project/DeleteProjectModal").then((m) => m.DeleteProjectModal),
  { ssr: false }
);

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleProjectUpdated = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  };

  const handleProjectDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Filter projects by search (non-blocking)
  const filteredProjects = projects.filter((p) => {
    const term = deferredSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term) ||
      p.version.toLowerCase().includes(term) ||
      p.environment.toLowerCase().includes(term) ||
      p.owner.toLowerCase().includes(term) ||
      p.leadTester.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  // Calculate overall platform metrics
  const totalProjects = projects.length;
  const readyProjects = projects.filter((p) => p.status === "production_ready").length;
  const blockedProjects = projects.filter((p) => p.status === "blocked").length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Hero / Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                Verification Hub
              </span>
              <span className="h-1 w-1 bg-neutral-400 rounded-full" />
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Live Neon DB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Production Readiness Engine
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              Execute standardized QA verifications across 69 critical categories. Attach evidence, track defect severity, and enforce strict release gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="font-mono text-xs font-semibold shadow-sm flex items-center gap-2"
            >
              <Icons.Plus size={14} />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* Global Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Active Projects</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
              {totalProjects}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Tracked platforms</div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Production Ready</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {readyProjects}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">100% Critical Pass</div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Deployment Blocked</div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {blockedProjects}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Critical defects open</div>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-xs">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">Standards Base</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
              1,260
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Rules across 69 areas</div>
          </div>
        </div>

        {/* Search Bar & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Icons.Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by project name, version, owner, or environment..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-mono placeholder:text-neutral-400"
            />
          </div>

          <div className="flex items-center gap-1 border border-neutral-300 dark:border-neutral-800 p-0.5 rounded-sm bg-white dark:bg-neutral-900 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
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
            <button
              onClick={() => setViewMode("list")}
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
          </div>
        </div>

        {/* Project Cards (Grid) or Project Table (List) */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-neutral-500">
            Loading production verification workspaces...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/50 space-y-3">
            <div className="inline-flex p-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-sm">
              <Icons.Shield size={24} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {search ? "No matching projects found" : "No project verification workspaces yet"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {search
                ? `No projects matching "${search}". Try another keyword.`
                : "Create a new project to execute the full production readiness checklist."}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateOpen(true)} size="sm" className="font-mono mt-2">
                <Icons.Plus size={13} />
                <span>Create First Project</span>
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setEditingProject(p)}
                onDelete={(p) => setDeletingProject(p)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-800 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                    <th className="py-2.5 px-4 font-semibold">Project & Scope</th>
                    <th className="py-2.5 px-4 font-semibold">Environment</th>
                    <th className="py-2.5 px-4 font-semibold">Release Verdict</th>
                    <th className="py-2.5 px-4 font-semibold">Passed</th>
                    <th className="py-2.5 px-4 font-semibold">Defects</th>
                    <th className="py-2.5 px-4 font-semibold">Lead QA</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                  {filteredProjects.map((project) => (
                    <ProjectTableRow
                      key={project.id}
                      project={project}
                      onEdit={(p) => setEditingProject(p)}
                      onDelete={(p) => setDeletingProject(p)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isCreateOpen && (
        <CreateProjectModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {editingProject && (
        <EditProjectModal
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSuccess={handleProjectUpdated}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          isOpen={Boolean(deletingProject)}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onSuccess={() => {
            handleProjectDeleted(deletingProject.id);
            setDeletingProject(null);
          }}
        />
      )}
    </div>
  );
}
