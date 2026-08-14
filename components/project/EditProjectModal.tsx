"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Icons } from "../ui/Icons";
import { EnvironmentType, Project } from "@/lib/types";

export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: (updated: Project) => void;
}

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [version, setVersion] = useState(project.version);
  const [environment, setEnvironment] = useState<EnvironmentType>(project.environment);
  const [owner, setOwner] = useState(project.owner);
  const [leadTester, setLeadTester] = useState(project.leadTester);
  const [repositoryUrl, setRepositoryUrl] = useState(project.repositoryUrl || "");
  const [deploymentUrl, setDeploymentUrl] = useState(project.deploymentUrl || "");
  const [targetReleaseDate, setTargetReleaseDate] = useState(project.targetReleaseDate || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setVersion(project.version);
      setEnvironment(project.environment);
      setOwner(project.owner);
      setLeadTester(project.leadTester);
      setRepositoryUrl(project.repositoryUrl || "");
      setDeploymentUrl(project.deploymentUrl || "");
      setTargetReleaseDate(project.targetReleaseDate || "");
      setError(null);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          version: version.trim() || "v1.0.0",
          environment,
          owner: owner.trim() || "Engineering Lead",
          leadTester: leadTester.trim() || "QA Tester",
          repositoryUrl: repositoryUrl.trim() || undefined,
          deploymentUrl: deploymentUrl.trim() || undefined,
          targetReleaseDate: targetReleaseDate.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update project");
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project Settings"
      description="Update workspace configuration, release targets, and environment settings."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-sm font-mono flex items-start gap-2">
            <Icons.AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Core Payments API"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Description / Scope
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the architectural scope, target features, or deployment purpose..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Target Version <span className="text-rose-500">*</span>
            </label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0.0"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Target Environment <span className="text-rose-500">*</span>
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
              className="w-full h-8.5 px-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-mono"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Preview">Preview</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Lead QA Tester
            </label>
            <Input
              value={leadTester}
              onChange={(e) => setLeadTester(e.target.value)}
              placeholder="e.g. Alex Vance"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Engineering Owner
            </label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Core Engineering"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Deployment URL
            </label>
            <Input
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
              placeholder="https://app.example.com"
              type="url"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Repository URL
            </label>
            <Input
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              type="url"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
            Target Release Date
          </label>
          <Input
            value={targetReleaseDate}
            onChange={(e) => setTargetReleaseDate(e.target.value)}
            type="date"
          />
        </div>

        {/* Modal Actions */}
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
            type="submit"
            size="sm"
            disabled={loading}
            className="font-mono text-xs flex items-center gap-1.5"
          >
            {loading && <Icons.Loader size={13} className="animate-spin" />}
            <span>{loading ? "Saving Changes..." : "Save Project Settings"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
