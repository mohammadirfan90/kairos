import { Pool } from "pg";
import { CANONICAL_CATEGORIES, CANONICAL_ITEMS } from "../seed-data";
import {
  AuthSession,
  ChecklistCategory,
  ChecklistItem,
  Project,
  ProjectActivityLog,
  ProjectApproval,
  ProjectChecklistResult,
  User,
  UserRole,
} from "../types";
import { calculateReadiness } from "../readiness";
import crypto from "crypto";

let dbPool: Pool | null = null;

function getPool(): Pool | null {
  if (dbPool) return dbPool;
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }
  dbPool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  return dbPool;
}

// In-memory fallback if no database connection string
interface MemoryStore {
  users: { id: string; email: string; password_hash: string; name: string; role: UserRole; avatar_url?: string; created_at: string; updated_at: string }[];
  sessions: { id: string; user_id: string; token_hash: string; expires_at: string; created_at: string }[];
  projects: Project[];
  categories: ChecklistCategory[];
  items: ChecklistItem[];
  results: ProjectChecklistResult[];
  logs: ProjectActivityLog[];
  approvals: ProjectApproval[];
  initialized: boolean;
}

const memoryStore: MemoryStore = {
  users: [],
  sessions: [],
  projects: [],
  categories: CANONICAL_CATEGORIES,
  items: CANONICAL_ITEMS,
  results: [],
  logs: [],
  approvals: [],
  initialized: true,
};

// Static fast map for canonical items
const canonicalItemMap = new Map(CANONICAL_ITEMS.map((item) => [item.id, item]));

// Initialize schema on PostgreSQL if connected - cached once
let isSchemaInitialized = false;
let schemaInitPromise: Promise<void> | null = null;

export async function initDatabase(): Promise<void> {
  if (isSchemaInitialized) return;
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'QA Tester',
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT DEFAULT '',
            version TEXT NOT NULL,
            environment TEXT NOT NULL,
            repository_url TEXT,
            deployment_url TEXT,
            owner TEXT NOT NULL,
            lead_tester TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'in_progress',
            target_release_date TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS checklist_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT,
            section_group TEXT NOT NULL,
            order_index INT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS checklist_items (
            id TEXT PRIMARY KEY,
            category_id TEXT REFERENCES checklist_categories(id) ON DELETE CASCADE,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            verification_guide TEXT,
            criticality TEXT NOT NULL,
            priority TEXT NOT NULL,
            section_group TEXT NOT NULL,
            order_index INT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS project_checklist_results (
            id TEXT PRIMARY KEY,
            project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
            item_id TEXT REFERENCES checklist_items(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'not_tested',
            tester_name TEXT,
            tester_id TEXT,
            notes TEXT,
            expected_behavior TEXT,
            actual_behavior TEXT,
            steps_to_reproduce TEXT,
            evidence_url TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, item_id)
          );

          CREATE TABLE IF NOT EXISTS project_activity_logs (
            id TEXT PRIMARY KEY,
            project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
            item_id TEXT,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            actor_id TEXT,
            previous_status TEXT,
            new_status TEXT,
            details TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS project_approvals (
            id TEXT PRIMARY KEY,
            project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
            approver_name TEXT NOT NULL,
            approver_id TEXT,
            role TEXT NOT NULL,
            decision TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_results_project_id ON project_checklist_results(project_id);
          CREATE INDEX IF NOT EXISTS idx_logs_project_id ON project_activity_logs(project_id);
          CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

          ALTER TABLE project_checklist_results ADD COLUMN IF NOT EXISTS tester_id TEXT;
          ALTER TABLE project_activity_logs ADD COLUMN IF NOT EXISTS actor_id TEXT;
          ALTER TABLE project_approvals ADD COLUMN IF NOT EXISTS approver_id TEXT;
        `);
        isSchemaInitialized = true;
      } catch (err) {
        console.error("Database connection/init error:", err);
      }
    }
  })();

  return schemaInitPromise;
}

// ==========================================
// Authentication Queries (Users & Sessions)
// ==========================================

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
  avatarUrl?: string;
}): Promise<User> {
  const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const role: UserRole = data.role || "QA Tester";

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, name, role, avatar_url, created_at, updated_at`,
        [id, data.email.toLowerCase().trim(), data.passwordHash, data.name.trim(), role, data.avatarUrl || null, now, now]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role as UserRole,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (e) {
      console.error("Postgres createUser failed:", e);
      throw e;
    }
  }

  const userObj = {
    id,
    email: data.email.toLowerCase().trim(),
    password_hash: data.passwordHash,
    name: data.name.trim(),
    role,
    avatar_url: data.avatarUrl,
    created_at: now,
    updated_at: now,
  };
  memoryStore.users.push(userObj);
  return {
    id: userObj.id,
    email: userObj.email,
    name: userObj.name,
    role: userObj.role,
    avatarUrl: userObj.avatar_url,
    createdAt: userObj.created_at,
    updatedAt: userObj.updated_at,
  };
}

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role as UserRole,
          avatarUrl: row.avatar_url,
          passwordHash: row.password_hash,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      return null;
    } catch (e) {
      console.error("Postgres getUserByEmail failed:", e);
      throw e;
    }
  }

  const u = memoryStore.users.find((user) => user.email === email.toLowerCase().trim());
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatarUrl: u.avatar_url,
    passwordHash: u.password_hash,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT id, email, name, role, avatar_url, created_at, updated_at FROM users WHERE id = $1", [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role as UserRole,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      return null;
    } catch (e) {
      console.error("Postgres getUserById failed:", e);
      throw e;
    }
  }

  const u = memoryStore.users.find((user) => user.id === id);
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export async function createSession(userId: string, token: string, expiresAt: Date): Promise<AuthSession> {
  const id = `ses-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date().toISOString();

  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, userId, tokenHash, expiresAt.toISOString(), now]
      );
      return {
        id,
        userId,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        createdAt: now,
      };
    } catch (e) {
      console.error("Postgres createSession failed:", e);
      throw e;
    }
  }

  const sessObj = {
    id,
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    created_at: now,
  };
  memoryStore.sessions.push(sessObj);
  return {
    id: sessObj.id,
    userId: sessObj.user_id,
    tokenHash: sessObj.token_hash,
    expiresAt: sessObj.expires_at,
    createdAt: sessObj.created_at,
  };
}

export async function getSessionByToken(token: string): Promise<AuthSession | null> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const pool = getPool();

  if (pool) {
    try {
      const res = await pool.query(
        `SELECT id, user_id, token_hash, expires_at, created_at
         FROM sessions WHERE token_hash = $1`,
        [tokenHash]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          tokenHash: row.token_hash,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        };
      }
      return null;
    } catch (e) {
      console.error("Postgres getSessionByToken failed:", e);
      throw e;
    }
  }

  const s = memoryStore.sessions.find((sess) => sess.token_hash === tokenHash);
  if (!s) return null;
  return {
    id: s.id,
    userId: s.user_id,
    tokenHash: s.token_hash,
    expiresAt: s.expires_at,
    createdAt: s.created_at,
  };
}

export async function deleteSession(token: string): Promise<boolean> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const pool = getPool();

  if (pool) {
    try {
      await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
      return true;
    } catch (e) {
      console.error("Postgres deleteSession failed:", e);
      throw e;
    }
  }

  memoryStore.sessions = memoryStore.sessions.filter((s) => s.token_hash !== tokenHash);
  return true;
}

// ==========================================
// Database Query APIs - HIGH PERFORMANCE
// ==========================================

export async function getProjects(): Promise<Project[]> {
  const pool = getPool();
  if (pool) {
    try {
      // 1 single combined query with left joined results
      const res = await pool.query(`
        SELECT 
          p.id, p.name, p.slug, p.description, p.version, p.environment,
          p.repository_url, p.deployment_url, p.owner, p.lead_tester,
          p.status, p.target_release_date, p.created_at, p.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'itemId', pcr.item_id,
                'status', pcr.status
              )
            ) FILTER (WHERE pcr.id IS NOT NULL),
            '[]'
          ) AS summary_results
        FROM projects p
        LEFT JOIN project_checklist_results pcr ON pcr.project_id = p.id
        GROUP BY p.id
        ORDER BY p.updated_at DESC
      `);

      const projects: Project[] = [];
      for (const row of res.rows) {
        const minimalResults: ProjectChecklistResult[] = (row.summary_results || []).map((r: any) => ({
          id: `res-${row.id}-${r.itemId}`,
          projectId: row.id,
          itemId: r.itemId,
          status: r.status,
          updatedAt: row.updated_at,
        }));

        const readiness = calculateReadiness(CANONICAL_ITEMS, minimalResults);
        projects.push({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          version: row.version,
          environment: row.environment,
          repositoryUrl: row.repository_url,
          deploymentUrl: row.deployment_url,
          owner: row.owner,
          leadTester: row.lead_tester,
          status: readiness.verdict,
          targetReleaseDate: row.target_release_date,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          readinessSummary: readiness,
        });
      }
      return projects;
    } catch (e) {
      console.error("Postgres getProjects query failed:", e);
      throw e;
    }
  }

  return memoryStore.projects.map((p) => {
    const results = memoryStore.results.filter((r) => r.projectId === p.id);
    const readiness = calculateReadiness(memoryStore.items, results);
    return {
      ...p,
      status: readiness.verdict,
      readinessSummary: readiness,
    };
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT 
          p.id, p.name, p.slug, p.description, p.version, p.environment,
          p.repository_url, p.deployment_url, p.owner, p.lead_tester,
          p.status, p.target_release_date, p.created_at, p.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pcr.id,
                'projectId', pcr.project_id,
                'itemId', pcr.item_id,
                'status', pcr.status,
                'testerName', pcr.tester_name,
                'testerId', pcr.tester_id,
                'notes', pcr.notes,
                'expectedBehavior', pcr.expected_behavior,
                'actualBehavior', pcr.actual_behavior,
                'stepsToReproduce', pcr.steps_to_reproduce,
                'evidenceUrl', pcr.evidence_url,
                'updatedAt', pcr.updated_at
              )
            ) FILTER (WHERE pcr.id IS NOT NULL),
            '[]'
          ) AS results
        FROM projects p
        LEFT JOIN project_checklist_results pcr ON pcr.project_id = p.id
        WHERE p.id = $1 OR p.slug = $1
        GROUP BY p.id`,
        [id]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const rawResults = row.results || [];
        const results: ProjectChecklistResult[] = rawResults.map((r: any) => ({
          ...r,
          item: canonicalItemMap.get(r.itemId),
        }));

        const readiness = calculateReadiness(CANONICAL_ITEMS, results);
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          version: row.version,
          environment: row.environment,
          repositoryUrl: row.repository_url,
          deploymentUrl: row.deployment_url,
          owner: row.owner,
          leadTester: row.lead_tester,
          status: readiness.verdict,
          targetReleaseDate: row.target_release_date,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          results,
          readinessSummary: readiness,
        };
      }
      return null;
    } catch (e) {
      console.error("Postgres getProjectById query failed:", e);
      throw e;
    }
  }

  const p = memoryStore.projects.find((proj) => proj.id === id || proj.slug === id);
  if (!p) return null;
  const results = memoryStore.results.filter((r) => r.projectId === p.id);
  const readiness = calculateReadiness(memoryStore.items, results);
  return {
    ...p,
    status: readiness.verdict,
    results,
    readinessSummary: readiness,
  };
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const slug = (data.name || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const now = new Date().toISOString();

  const newProject: Project = {
    id,
    name: data.name || "Untitled Project",
    slug: data.slug || `${slug}-${id.slice(-4)}`,
    description: data.description || "",
    version: data.version || "v1.0.0",
    environment: data.environment || "Production",
    repositoryUrl: data.repositoryUrl || "",
    deploymentUrl: data.deploymentUrl || "",
    owner: data.owner || "Engineering Lead",
    leadTester: data.leadTester || "QA Tester",
    status: "in_progress",
    targetReleaseDate: data.targetReleaseDate || "",
    createdAt: now,
    updatedAt: now,
  };

  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO projects (id, name, slug, description, version, environment, repository_url, deployment_url, owner, lead_tester, status, target_release_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          newProject.id,
          newProject.name,
          newProject.slug,
          newProject.description,
          newProject.version,
          newProject.environment,
          newProject.repositoryUrl,
          newProject.deploymentUrl,
          newProject.owner,
          newProject.leadTester,
          newProject.status,
          newProject.targetReleaseDate,
          newProject.createdAt,
          newProject.updatedAt,
        ]
      );

      // Fast multi-row batch insert for all result placeholders
      const chunkSize = 100;
      for (let i = 0; i < CANONICAL_ITEMS.length; i += chunkSize) {
        const chunk = CANONICAL_ITEMS.slice(i, i + chunkSize);
        const valuePlaceholders = [];
        const params = [];
        let pIdx = 1;

        for (const it of chunk) {
          valuePlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, 'not_tested', $${pIdx + 3}, $${pIdx + 4})`);
          params.push(`res-${newProject.id}-${it.id}`, newProject.id, it.id, newProject.leadTester, now);
          pIdx += 5;
        }

        await pool.query(
          `INSERT INTO project_checklist_results (id, project_id, item_id, status, tester_name, updated_at)
           VALUES ${valuePlaceholders.join(", ")}
           ON CONFLICT (project_id, item_id) DO NOTHING`,
          params
        );
      }
    } catch (e) {
      console.error("Postgres insert failed:", e);
      throw e;
    }
  }

  memoryStore.projects.unshift(newProject);
  for (const item of memoryStore.items) {
    memoryStore.results.push({
      id: `res-${newProject.id}-${item.id}`,
      projectId: newProject.id,
      itemId: item.id,
      status: "not_tested",
      testerName: newProject.leadTester,
      updatedAt: now,
      item,
    });
  }

  return newProject;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const now = new Date().toISOString();
  const pool = getPool();

  if (pool) {
    try {
      await pool.query(
        `UPDATE projects
         SET name = COALESCE($2, name),
             version = COALESCE($3, version),
             environment = COALESCE($4, environment),
             description = COALESCE($5, description),
             repository_url = COALESCE($6, repository_url),
             deployment_url = COALESCE($7, deployment_url),
             owner = COALESCE($8, owner),
             lead_tester = COALESCE($9, lead_tester),
             target_release_date = COALESCE($10, target_release_date),
             updated_at = $11
         WHERE id = $1`,
        [
          id,
          data.name,
          data.version,
          data.environment,
          data.description,
          data.repositoryUrl,
          data.deploymentUrl,
          data.owner,
          data.leadTester,
          data.targetReleaseDate,
          now,
        ]
      );
    } catch (e) {
      console.error("Postgres update failed:", e);
      throw e;
    }
  }

  const idx = memoryStore.projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryStore.projects[idx] = {
      ...memoryStore.projects[idx],
      ...data,
      updatedAt: now,
    };
  }

  return getProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const pool = getPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    } catch (e) {
      console.error("Postgres delete failed:", e);
      throw e;
    }
  }

  memoryStore.projects = memoryStore.projects.filter((p) => p.id !== id);
  memoryStore.results = memoryStore.results.filter((r) => r.projectId !== id);
  memoryStore.logs = memoryStore.logs.filter((l) => l.projectId !== id);
  memoryStore.approvals = memoryStore.approvals.filter((a) => a.projectId !== id);
  return true;
}

// In-Memory Fast Returns for Canonical Schema (0ms network latency)
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  return CANONICAL_ITEMS;
}

export async function getCategories(): Promise<ChecklistCategory[]> {
  return CANONICAL_CATEGORIES;
}

export async function getProjectResults(projectId: string): Promise<ProjectChecklistResult[]> {
  const pool = getPool();

  if (pool) {
    try {
      const res = await pool.query(
        "SELECT id, project_id, item_id, status, tester_name, tester_id, notes, expected_behavior, actual_behavior, steps_to_reproduce, evidence_url, updated_at FROM project_checklist_results WHERE project_id = $1",
        [projectId]
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          projectId: row.project_id,
          itemId: row.item_id,
          status: row.status,
          testerName: row.tester_name,
          testerId: row.tester_id,
          notes: row.notes,
          expectedBehavior: row.expected_behavior,
          actualBehavior: row.actual_behavior,
          stepsToReproduce: row.steps_to_reproduce,
          evidenceUrl: row.evidence_url,
          updatedAt: row.updated_at,
          item: canonicalItemMap.get(row.item_id),
        }));
      }
    } catch (e) {
      console.error("Postgres results query failed:", e);
      throw e;
    }
  }

  const results = memoryStore.results.filter((r) => r.projectId === projectId);
  return results.map((r) => ({
    ...r,
    item: canonicalItemMap.get(r.itemId),
  }));
}

export async function updateProjectResult(
  projectId: string,
  itemId: string,
  data: Partial<ProjectChecklistResult>,
  actor = "QA Tester",
  actorId?: string
): Promise<ProjectChecklistResult> {
  const now = new Date().toISOString();
  const pool = getPool();

  let prevStatus = "not_tested";

  if (pool) {
    try {
      const existingRes = await pool.query(
        "SELECT status FROM project_checklist_results WHERE project_id = $1 AND item_id = $2",
        [projectId, itemId]
      );
      if (existingRes.rows.length > 0) {
        prevStatus = existingRes.rows[0].status;
      }

      const res = await pool.query(
        `INSERT INTO project_checklist_results (
           id, project_id, item_id, status, tester_name, tester_id, notes,
           expected_behavior, actual_behavior, steps_to_reproduce, evidence_url, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (project_id, item_id) DO UPDATE SET
           status = COALESCE($4, project_checklist_results.status),
           tester_name = COALESCE($5, project_checklist_results.tester_name),
           tester_id = COALESCE($6, project_checklist_results.tester_id),
           notes = COALESCE($7, project_checklist_results.notes),
           expected_behavior = COALESCE($8, project_checklist_results.expected_behavior),
           actual_behavior = COALESCE($9, project_checklist_results.actual_behavior),
           steps_to_reproduce = COALESCE($10, project_checklist_results.steps_to_reproduce),
           evidence_url = COALESCE($11, project_checklist_results.evidence_url),
           updated_at = $12
         RETURNING *`,
        [
          `res-${projectId}-${itemId}`,
          projectId,
          itemId,
          data.status || "not_tested",
          data.testerName || actor,
          data.testerId || actorId || null,
          data.notes,
          data.expectedBehavior,
          data.actualBehavior,
          data.stepsToReproduce,
          data.evidenceUrl,
          now,
        ]
      );

      // Record log in PostgreSQL asynchronously (non-blocking)
      pool.query(
        `INSERT INTO project_activity_logs (id, project_id, item_id, action, actor, actor_id, previous_status, new_status, details, created_at)
         VALUES ($1, $2, $3, 'status_update', $4, $5, $6, $7, $8, $9)`,
        [
          `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          projectId,
          itemId,
          actor,
          actorId || null,
          prevStatus,
          data.status || prevStatus,
          data.notes ? `Note: ${data.notes.slice(0, 100)}` : "Status modified",
          now,
        ]
      ).catch((e) => console.error("Async log insert error:", e));

      const row = res.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        itemId: row.item_id,
        status: row.status,
        testerName: row.tester_name,
        testerId: row.tester_id,
        notes: row.notes,
        expectedBehavior: row.expected_behavior,
        actualBehavior: row.actual_behavior,
        stepsToReproduce: row.steps_to_reproduce,
        evidenceUrl: row.evidence_url,
        updatedAt: row.updated_at,
      };
    } catch (e) {
      console.error("Postgres result update failed:", e);
      throw e;
    }
  }

  // Memory store update
  let resObj: ProjectChecklistResult;
  const idx = memoryStore.results.findIndex(
    (r) => r.projectId === projectId && r.itemId === itemId
  );

  if (idx !== -1) {
    memoryStore.results[idx] = {
      ...memoryStore.results[idx],
      ...data,
      testerName: data.testerName || actor,
      testerId: data.testerId || actorId,
      updatedAt: now,
    };
    resObj = memoryStore.results[idx];
  } else {
    resObj = {
      id: `res-${projectId}-${itemId}`,
      projectId,
      itemId,
      status: data.status || "not_tested",
      testerName: data.testerName || actor,
      testerId: data.testerId || actorId,
      notes: data.notes,
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
      stepsToReproduce: data.stepsToReproduce,
      evidenceUrl: data.evidenceUrl,
      updatedAt: now,
    };
    memoryStore.results.push(resObj);
  }

  memoryStore.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectId,
    itemId,
    action: "status_update",
    actor,
    actorId,
    previousStatus: prevStatus,
    newStatus: data.status || prevStatus,
    details: data.notes ? `Note: ${data.notes.slice(0, 100)}` : "Status modified",
    createdAt: now,
  });

  return resObj;
}

export async function bulkUpdateProjectResults(
  projectId: string,
  updates: { itemId: string; status: ProjectChecklistResult["status"]; notes?: string }[],
  actor = "QA Tester",
  actorId?: string
): Promise<void> {
  for (const update of updates) {
    await updateProjectResult(projectId, update.itemId, {
      status: update.status,
      notes: update.notes,
      testerName: actor,
      testerId: actorId,
    }, actor, actorId);
  }
}

export async function getProjectActivityLogs(projectId: string): Promise<ProjectActivityLog[]> {
  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        "SELECT * FROM project_activity_logs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50",
        [projectId]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          projectId: r.project_id,
          itemId: r.item_id,
          action: r.action,
          actor: r.actor,
          actorId: r.actor_id,
          previousStatus: r.previous_status,
          newStatus: r.new_status,
          details: r.details,
          createdAt: r.created_at,
        }));
      }
      return [];
    } catch (e) {
      console.error("Postgres logs query failed:", e);
      throw e;
    }
  }

  return memoryStore.logs
    .filter((l) => l.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
