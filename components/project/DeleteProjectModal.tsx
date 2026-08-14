"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "../ui/Icons";
import { Button } from "../ui/Button";
import { Project } from "@/lib/types";

export interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: DeleteProjectModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete project");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-rose-300 dark:border-rose-900/60 rounded-sm shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-rose-200 dark:border-rose-950/80 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Icons.AlertTriangle size={18} />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
              Delete Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-sm text-xs text-rose-700 dark:text-rose-300 font-mono">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete project{" "}
              <strong className="font-semibold text-neutral-900 dark:text-white font-mono">
                "{project.name}"
              </strong>{" "}
              ({project.version})?
            </p>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-sm text-[11px] font-mono text-neutral-500 space-y-1">
              <div>⚠️ All checklist verification statuses will be wiped.</div>
              <div>⚠️ All QA observations, notes, and evidence will be lost.</div>
              <div>⚠️ Activity audit logs will be permanently deleted.</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="font-mono text-xs flex items-center gap-1.5"
            >
              {loading && <Icons.Loader size={13} className="animate-spin" />}
              <span>{loading ? "Deleting..." : "Permanently Delete"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
