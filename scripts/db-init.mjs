import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.resolve(__dirname, "../.env");
let connectionString = process.env.DATABASE_URL;

if (!connectionString && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) {
    connectionString = match[1];
  }
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

import { CANONICAL_CATEGORIES, CANONICAL_ITEMS } from "../lib/seed-data.ts";

async function main() {
  console.log("Connecting to Neon PostgreSQL...");
  const t = await pool.query("SELECT NOW()");
  console.log("Connected to Neon DB at:", t.rows[0].now);

  console.log("Ensuring database tables exist...");
  await pool.query(`
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
      previous_status TEXT,
      new_status TEXT,
      details TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_approvals (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      approver_name TEXT NOT NULL,
      role TEXT NOT NULL,
      decision TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log(`Upserting ${CANONICAL_CATEGORIES.length} categories in Neon DB...`);
  for (const cat of CANONICAL_CATEGORIES) {
    await pool.query(
      `INSERT INTO checklist_categories (id, name, slug, description, section_group, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, section_group = $5, order_index = $6`,
      [cat.id, cat.name, cat.slug, cat.description, cat.sectionGroup, cat.orderIndex]
    );
  }

  console.log(`Upserting ${CANONICAL_ITEMS.length} checklist items in Neon DB using batch multi-row queries...`);
  const chunkSize = 100;
  for (let i = 0; i < CANONICAL_ITEMS.length; i += chunkSize) {
    const chunk = CANONICAL_ITEMS.slice(i, i + chunkSize);
    const valuePlaceholders = [];
    const params = [];
    let pIdx = 1;

    for (const it of chunk) {
      valuePlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, $${pIdx + 5}, $${pIdx + 6}, $${pIdx + 7}, $${pIdx + 8}, $${pIdx + 9})`);
      params.push(it.id, it.categoryId, it.code, it.title, it.description, it.verificationGuide, it.criticality, it.priority, it.sectionGroup, it.orderIndex);
      pIdx += 10;
    }

    const query = `
      INSERT INTO checklist_items (id, category_id, code, title, description, verification_guide, criticality, priority, section_group, order_index)
      VALUES ${valuePlaceholders.join(", ")}
      ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        code = EXCLUDED.code,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        verification_guide = EXCLUDED.verification_guide,
        criticality = EXCLUDED.criticality,
        priority = EXCLUDED.priority,
        section_group = EXCLUDED.section_group,
        order_index = EXCLUDED.order_index
    `;
    await pool.query(query, params);
  }
  console.log("All checklist items upserted successfully.");

  // Also initialize results for any existing real projects in batch
  const projectsRes = await pool.query("SELECT id, lead_tester FROM projects");
  const now = new Date().toISOString();

  for (const proj of projectsRes.rows) {
    console.log(`Initializing results for real project: ${proj.id}...`);
    for (let i = 0; i < CANONICAL_ITEMS.length; i += chunkSize) {
      const chunk = CANONICAL_ITEMS.slice(i, i + chunkSize);
      const valuePlaceholders = [];
      const params = [];
      let pIdx = 1;

      for (const it of chunk) {
        valuePlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, 'not_tested', $${pIdx + 3}, $${pIdx + 4})`);
        params.push(`res-${proj.id}-${it.id}`, proj.id, it.id, proj.lead_tester, now);
        pIdx += 5;
      }

      await pool.query(
        `INSERT INTO project_checklist_results (id, project_id, item_id, status, tester_name, updated_at)
         VALUES ${valuePlaceholders.join(", ")}
         ON CONFLICT (project_id, item_id) DO NOTHING`,
        params
      );
    }
  }

  const catCount = await pool.query("SELECT count(*) FROM checklist_categories");
  const itemCount = await pool.query("SELECT count(*) FROM checklist_items");
  const projCount = await pool.query("SELECT count(*) FROM projects");

  console.log(`\n🎉 100% Faithful Checklist Synchronized in Neon Database!`);
  console.log(`✅ Total Master Categories: ${catCount.rows[0].count}`);
  console.log(`✅ Total Master Checklist Items: ${itemCount.rows[0].count}`);
  console.log(`✅ Total Real Projects: ${projCount.rows[0].count}`);

  await pool.end();
}

main().catch(err => {
  console.error("Database sync error:", err);
  process.exit(1);
});
