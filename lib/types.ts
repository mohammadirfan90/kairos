export type Criticality = "Critical" | "High" | "Medium" | "Low";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type CheckStatus = "not_tested" | "passed" | "failed" | "blocked" | "not_applicable";
export type ProjectStatus = "in_progress" | "production_ready" | "blocked" | "rejected" | "ready_for_review";

export type Environment = "Production" | "Staging" | "Preview";
export type EnvironmentType = Environment;

export type UserRole =
  | "Lead QA"
  | "Security Engineer"
  | "QA Tester"
  | "Software Engineer"
  | "DevOps / SRE"
  | "Product Manager"
  | "Admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  user?: User;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sectionGroup: string; // e.g., "Production & Security Controls" | "Visual & Functional QA"
  orderIndex: number;
}

export interface ChecklistItem {
  id: string;
  categoryId: string;
  code: string; // e.g. "SEC-001"
  title: string;
  description: string;
  verificationGuide: string;
  criticality: Criticality;
  priority: Priority;
  sectionGroup: string;
  orderIndex: number;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  environment: Environment;
  repositoryUrl?: string;
  deploymentUrl?: string;
  owner: string;
  leadTester: string;
  status: ProjectStatus;
  targetReleaseDate?: string;
  createdAt: string;
  updatedAt: string;
  results?: ProjectChecklistResult[];
  readinessSummary?: ReadinessSummary;
}

export interface ProjectChecklistResult {
  id: string;
  projectId: string;
  itemId: string;
  status: CheckStatus;
  testerName?: string;
  testerId?: string;
  notes?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  stepsToReproduce?: string;
  evidenceUrl?: string;
  updatedAt: string;
  item?: ChecklistItem;
}

export interface ProjectActivityLog {
  id: string;
  projectId: string;
  itemId?: string;
  action: string;
  actor: string;
  actorId?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
  createdAt: string;
}

export interface ProjectApproval {
  id: string;
  projectId: string;
  approverName: string;
  approverId?: string;
  role: string;
  decision: "approved" | "rejected";
  notes?: string;
  createdAt: string;
}

export interface ReadinessSummary {
  totalChecks: number;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  untestedCount: number;
  notApplicableCount: number;
  percentPassed: number;
  percentCompleted: number;
  criticalTotal: number;
  criticalPassed: number;
  criticalFailedCount: number;
  highFailedCount: number;
  mediumFailedCount: number;
  lowFailedCount: number;
  verdict: ProjectStatus;
  verdictLabel: string;
  canDeploy: boolean;
  blockers: string[];
}

export interface FilterOptions {
  search: string;
  status: CheckStatus | "all";
  criticality: Criticality | "all";
  priority: Priority | "all";
  categoryId: string | "all";
  sectionGroup: string | "all";
  quickFilter?: "all" | "failures" | "critical" | "untested" | "with_notes" | "blockers";
}
