"use client";

import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { ChecklistItem, Project, ProjectChecklistResult } from "@/lib/types";
import { generateItemFailureMarkdown } from "@/lib/report-generator";
import { Icons } from "../ui/Icons";

export interface CopyContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  item: ChecklistItem | null;
  result: ProjectChecklistResult | null;
}

export function CopyContextModal({
  isOpen,
  onClose,
  project,
  item,
  result,
}: CopyContextModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item || !result) return null;

  const markdown = generateItemFailureMarkdown(project, item, result);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy context to clipboard:", e);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Icons.Copy size={16} />
          <span>Developer Defect Context: [{item.code}]</span>
        </div>
      }
      description="Copy structured context to paste directly into GitHub Issues, Linear, Jira, or Slack."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <pre className="p-4 bg-neutral-950 text-neutral-200 border border-neutral-800 text-xs font-mono rounded-sm overflow-x-auto whitespace-pre-wrap max-h-96 selection:bg-neutral-700 leading-relaxed">
            {markdown}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 text-xs font-mono flex items-center gap-1.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Icons.Check size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">COPIED!</span>
              </>
            ) : (
              <>
                <Icons.Copy size={13} />
                <span>COPY MARKDOWN</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 font-mono">
          <span>Ready to paste into GitHub / Linear / Jira / Slack</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
