"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { ChecklistItem, ProjectChecklistResult } from "@/lib/types";
import { Icons } from "../ui/Icons";

export interface QANoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ChecklistItem | null;
  result: ProjectChecklistResult | null;
  onSave: (
    itemId: string,
    data: {
      notes: string;
      expectedBehavior: string;
      actualBehavior: string;
      stepsToReproduce: string;
      evidenceUrl: string;
      status?: ProjectChecklistResult["status"];
    }
  ) => void;
}

export function QANoteDrawer({
  isOpen,
  onClose,
  item,
  result,
  onSave,
}: QANoteDrawerProps) {
  const [notes, setNotes] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [markFailed, setMarkFailed] = useState(false);

  useEffect(() => {
    if (result) {
      setNotes(result.notes || "");
      setExpectedBehavior(result.expectedBehavior || "");
      setActualBehavior(result.actualBehavior || "");
      setStepsToReproduce(result.stepsToReproduce || "");
      setEvidenceUrl(result.evidenceUrl || "");
      setMarkFailed(result.status === "failed");
    } else {
      setNotes("");
      setExpectedBehavior("");
      setActualBehavior("");
      setStepsToReproduce("");
      setEvidenceUrl("");
      setMarkFailed(false);
    }
  }, [result, isOpen]);

  if (!item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      notes,
      expectedBehavior,
      actualBehavior,
      stepsToReproduce,
      evidenceUrl,
      status: markFailed ? "failed" : result?.status,
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Icons.Note size={16} />
          <span>QA Findings & Defect Context: [{item.code}]</span>
        </div>
      }
      description={item.title}
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Verification Reference box */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-xs space-y-1">
          <div className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
            Verification Guidance
          </div>
          <p className="text-neutral-700 dark:text-neutral-300">
            {item.verificationGuide || item.description}
          </p>
        </div>

        {/* Freeform Notes / Summary */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            General QA Observations / Defect Summary
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Stripe signature validation is bypassed when the header is missing..."
            rows={3}
            autoFocus
          />
        </div>

        {/* Structured Context: Expected vs Actual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Expected Behavior
            </label>
            <Textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="e.g. Returns HTTP 401 Unauthorized"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Actual Observed Behavior
            </label>
            <Textarea
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="e.g. Returns HTTP 200 OK and acknowledges request"
              rows={2}
            />
          </div>
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Steps to Reproduce
          </label>
          <Textarea
            value={stepsToReproduce}
            onChange={(e) => setStepsToReproduce(e.target.value)}
            placeholder={"1. Send POST request to /api/webhooks/stripe\n2. Omit Stripe-Signature header\n3. Observe server logs"}
            rows={3}
          />
        </div>

        {/* Evidence / Screenshot URL */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Evidence Link (Screenshot, Loom, Sentry Trace)
          </label>
          <Input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Quick Fail Checkbox */}
        <div className="flex items-center gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm">
          <input
            type="checkbox"
            id="mark-failed"
            checked={markFailed}
            onChange={(e) => setMarkFailed(e.target.checked)}
            className="h-4 w-4 rounded-none text-rose-600 focus:ring-rose-500 border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <label htmlFor="mark-failed" className="text-xs font-mono text-neutral-800 dark:text-neutral-200 select-none cursor-pointer">
            Mark this check status as <span className="text-rose-600 font-bold">FAILED</span> immediately upon saving
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save QA Notes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
