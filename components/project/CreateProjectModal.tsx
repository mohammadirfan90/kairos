"use client";

import React, { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { EnvironmentType, Project } from "@/lib/types";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [environment, setEnvironment] = useState<EnvironmentType>("Production");
  const [owner, setOwner] = useState("");
  const [leadTester, setLeadTester] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [targetReleaseDate, setTargetReleaseDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          version: version.trim() || "v1.0.0",
          environment,
          owner: owner.trim() || "Engineering Lead",
          leadTester: leadTester.trim() || "QA Tester",
          description: description.trim(),
          repositoryUrl: repositoryUrl.trim(),
          deploymentUrl: deploymentUrl.trim(),
          targetReleaseDate: targetReleaseDate.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onCreated(data.data);
        onClose();
        // Reset form
        setName("");
        setVersion("v1.0.0");
        setDescription("");
        setRepositoryUrl("");
        setDeploymentUrl("");
      } else {
        setError(data.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Initialize a new production readiness QA verification workspace."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-sm font-mono">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Customer Portal, Billing API, Mobile Auth"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Version / Release Tag
            </label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v2.4.0, 2026.08.1"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Target Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
              className="w-full h-9 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 text-xs px-2.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Preview">Preview</option>
              <option value="QA">QA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Lead QA Tester
            </label>
            <Input
              value={leadTester}
              onChange={(e) => setLeadTester(e.target.value)}
              placeholder="e.g. John Miller"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Project Owner
            </label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Sarah Chen"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief scope, architecture, or critical release goals..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Deployment URL
            </label>
            <Input
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Repository URL
            </label>
            <Input
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Initializing..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
