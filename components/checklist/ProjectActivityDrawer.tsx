"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { ProjectActivityLog } from "@/lib/types";
import { Icons } from "../ui/Icons";

export interface ProjectActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ProjectActivityDrawer({
  isOpen,
  onClose,
  projectId,
}: ProjectActivityDrawerProps) {
  const [logs, setLogs] = useState<ProjectActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      setLoading(true);
      fetch(`/api/projects/${projectId}/logs`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setLogs(data.data);
          }
        })
        .catch((err) => console.error("Failed to load audit logs:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, projectId]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Icons.History size={16} />
          <span>Audit Trail & QA Activity History</span>
        </div>
      }
      description="Cryptographically sequenced test verification and status modification logs."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            Loading activity log entries...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            No activity recorded yet. Run checks or add notes to begin audit history.
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {logs.map((log) => {
              const time = new Date(log.createdAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={log.id}
                  className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {log.actor}
                    </span>
                    <span>{time}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {log.itemId && (
                      <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-sm font-bold">
                        {log.itemId.toUpperCase()}
                      </span>
                    )}
                    {log.previousStatus && log.newStatus && (
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Status changed:{" "}
                        <span className="uppercase font-semibold">{log.previousStatus}</span> →{" "}
                        <span className={`uppercase font-bold ${
                          log.newStatus === "passed"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : log.newStatus === "failed"
                            ? "text-rose-600 dark:text-rose-400"
                            : log.newStatus === "blocked"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}>
                          {log.newStatus}
                        </span>
                      </span>
                    )}
                  </div>

                  {log.details && (
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px] font-sans pt-0.5">
                      {log.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Audit Trail
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
