#!/usr/bin/env node
/**
 * fetch-issues.mjs
 *
 * Pulls open issues from CodeQL (GitHub Security), SonarCloud, and
 * ReviewDog (ESLint check-run annotations) into a single ranked report.
 *
 * Required env vars:
 *   GITHUB_TOKEN   – classic PAT or fine-grained token with:
 *                    repo (read), security_events (read), checks (read)
 *   SONAR_TOKEN    – SonarCloud user token (Analysis scope is enough)
 *
 * Optional:
 *   GITHUB_REPO    – default: Raj-SW/petstore-frontend
 *   SONAR_PROJECT  – default: Raj-SW_petstore-frontend
 *   SONAR_ORG      – default: raj-sw
 *
 * Usage:
 *   node scripts/fetch-issues.mjs              # pretty-print to console
 *   node scripts/fetch-issues.mjs --json       # write issues-report.json
 *   node scripts/fetch-issues.mjs --fix-plan   # write fix-plan.md (AI-ready)
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Auto-load .env from project root (strips inline # comments, trims whitespace)
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    // Strip inline comments (everything from first unquoted # onwards)
    const value = raw.replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

// ─── Config ─────────────────────────────────────────────────────────────────

const GH_TOKEN = process.env.GITHUB_TOKEN;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const REPO = process.env.GITHUB_REPO ?? "Raj-SW/petstore-frontend";
const SONAR_PROJECT = process.env.SONAR_PROJECT ?? "Raj-SW_petstore-frontend";
const SONAR_ORG = process.env.SONAR_ORG ?? "raj-sw";

const [OWNER, REPO_NAME] = REPO.split("/");
const GH_API = "https://api.github.com";
const SONAR_API = "https://sonarcloud.io/api";

const args = process.argv.slice(2);
const WRITE_JSON = args.includes("--json");
const WRITE_PLAN = args.includes("--fix-plan");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ghHeaders() {
  if (!GH_TOKEN) {
    console.warn("⚠  GITHUB_TOKEN not set — GitHub queries will be skipped");
    return null;
  }
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function sonarHeaders() {
  if (!SONAR_TOKEN) {
    console.warn("⚠  SONAR_TOKEN not set — SonarCloud query will be skipped");
    return null;
  }
  const b64 = Buffer.from(`${SONAR_TOKEN}:`).toString("base64");
  return { Authorization: `Basic ${b64}` };
}

async function ghFetch(path, params = {}) {
  const headers = ghHeaders();
  if (!headers) return [];
  const url = new URL(`${GH_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const results = [];
  let page = 1;
  while (true) {
    url.searchParams.set("page", page);
    url.searchParams.set("per_page", "100");
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const body = await res.text();
      console.error(`GitHub API error ${res.status} for ${path}:`, body);
      break;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return results;
}

async function sonarFetch(params = {}) {
  const headers = sonarHeaders();
  if (!headers) return [];

  const results = [];
  let page = 1;
  while (true) {
    const url = new URL(`${SONAR_API}/issues/search`);
    Object.entries({
      projectKeys: SONAR_PROJECT,
      organization: SONAR_ORG,
      statuses: "OPEN,CONFIRMED,REOPENED",
      ps: "500",
      p: page,
      ...params,
    }).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const body = await res.text();
      console.error(`SonarCloud API error ${res.status}:`, body);
      break;
    }
    const data = await res.json();
    const items = data.issues ?? [];
    results.push(...items);
    const total = data.paging?.total ?? 0;
    if (results.length >= total || items.length === 0) break;
    page++;
  }
  return results;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCodeQLAlerts() {
  console.log("📡 Fetching CodeQL alerts…");
  const raw = await ghFetch(`/repos/${OWNER}/${REPO_NAME}/code-scanning/alerts`, {
    state: "open",
    tool_name: "CodeQL",
  });

  return raw.map((a) => ({
    source: "codeql",
    severity: mapCodeQLSeverity(a.rule?.security_severity_level ?? a.rule?.severity ?? "unknown"),
    rule: a.rule?.id ?? "unknown",
    description: a.rule?.description ?? a.most_recent_instance?.message?.text ?? "",
    file: a.most_recent_instance?.location?.path ?? "",
    startLine: a.most_recent_instance?.location?.start_line ?? null,
    url: a.html_url ?? "",
    raw: a,
  }));
}

async function fetchSonarIssues() {
  console.log("📡 Fetching SonarCloud issues…");
  const raw = await sonarFetch();

  return raw.map((i) => ({
    source: "sonarcloud",
    severity: mapSonarSeverity(i.severity),
    rule: i.rule ?? "unknown",
    description: i.message ?? "",
    file: (i.component ?? "").replace(`${SONAR_PROJECT}:`, ""),
    startLine: i.line ?? null,
    url: `https://sonarcloud.io/project/issues?id=${SONAR_PROJECT}&issues=${i.key}&open=${i.key}`,
    raw: i,
  }));
}

async function fetchReviewDogAnnotations() {
  console.log("📡 Fetching ESLint (ReviewDog) check-run annotations…");
  const headers = ghHeaders();
  if (!headers) return [];

  // Find the latest check suite on main that has the ReviewDog eslint check run
  const runs = await ghFetch(`/repos/${OWNER}/${REPO_NAME}/check-runs`, {
    check_name: "ESLint suggestions",
    status: "completed",
    filter: "latest",
  });

  const checkRun = runs[0];
  if (!checkRun) {
    console.warn("  No completed 'ESLint suggestions' check-run found.");
    return [];
  }

  console.log(`  Using check-run #${checkRun.id} (${checkRun.head_sha?.slice(0, 7)})`);
  const annotations = await ghFetch(
    `/repos/${OWNER}/${REPO_NAME}/check-runs/${checkRun.id}/annotations`,
  );

  return annotations.map((a) => ({
    source: "eslint",
    severity: mapAnnotationLevel(a.annotation_level),
    rule: extractEslintRule(a.message ?? a.title ?? ""),
    description: (a.message ?? "").split("\n")[0],
    file: a.path ?? "",
    startLine: a.start_line ?? null,
    url: `https://github.com/${REPO}/blob/${checkRun.head_sha}/${a.path}#L${a.start_line}`,
    raw: a,
  }));
}

// ─── Severity mappers ────────────────────────────────────────────────────────

function mapCodeQLSeverity(s) {
  const m = { critical: 1, high: 2, medium: 3, error: 2, warning: 4, note: 5, none: 5, unknown: 4 };
  return { label: s, rank: m[s?.toLowerCase()] ?? 4 };
}

function mapSonarSeverity(s) {
  const m = { BLOCKER: 1, CRITICAL: 2, MAJOR: 3, MINOR: 4, INFO: 5 };
  return { label: s ?? "UNKNOWN", rank: m[s] ?? 4 };
}

function mapAnnotationLevel(level) {
  const m = { failure: 2, warning: 4, notice: 5 };
  return { label: level ?? "warning", rank: m[level] ?? 4 };
}

function extractEslintRule(msg) {
  const m = msg.match(/\(([a-z@/\-_]+(?:\/[a-z@/\-_]+)?)\)\s*$/i);
  return m ? m[1] : "eslint";
}

// ─── Grouping & rendering ────────────────────────────────────────────────────

function groupByFile(issues) {
  const map = {};
  for (const i of issues) {
    const key = i.file || "(no file)";
    if (!map[key]) map[key] = [];
    map[key].push(i);
  }
  // Sort each file's issues by severity rank
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.severity.rank - b.severity.rank);
  }
  return map;
}

function severityIcon(rank) {
  return ["", "🔴", "🟠", "🟡", "🔵", "⚪"][rank] ?? "⚪";
}

function printReport(all) {
  const bySource = { codeql: [], sonarcloud: [], eslint: [] };
  for (const i of all) bySource[i.source]?.push(i);

  const totals = {
    critical: all.filter((i) => i.severity.rank <= 2).length,
    major: all.filter((i) => i.severity.rank === 3).length,
    minor: all.filter((i) => i.severity.rank >= 4).length,
  };

  console.log("\n" + "═".repeat(70));
  console.log("  ISSUE REPORT");
  console.log("═".repeat(70));
  console.log(`  Total: ${all.length}  |  🔴 Critical/High: ${totals.critical}  |  🟡 Major: ${totals.major}  |  🔵 Minor/Info: ${totals.minor}`);
  console.log(`  CodeQL: ${bySource.codeql.length}  |  SonarCloud: ${bySource.sonarcloud.length}  |  ESLint: ${bySource.eslint.length}`);
  console.log("═".repeat(70) + "\n");

  for (const [source, issues] of Object.entries(bySource)) {
    if (issues.length === 0) continue;
    const label = { codeql: "CodeQL Security", sonarcloud: "SonarCloud", eslint: "ESLint (ReviewDog)" }[source];
    console.log(`\n── ${label} (${issues.length}) ──`);
    const byFile = groupByFile(issues);
    for (const [file, fileIssues] of Object.entries(byFile)) {
      console.log(`\n  📄 ${file}`);
      for (const i of fileIssues) {
        const line = i.startLine ? `:${i.startLine}` : "";
        const icon = severityIcon(i.severity.rank);
        const sev = `[${i.severity.label}]`.padEnd(12);
        const rule = `(${i.rule})`.padEnd(40);
        console.log(`    ${icon} ${sev} ${rule} ${i.description.slice(0, 80)}`);
        if (i.url) console.log(`       ${i.url}`);
      }
    }
  }
  console.log("\n" + "═".repeat(70));
}

function writeJson(all) {
  const out = {
    generatedAt: new Date().toISOString(),
    repo: REPO,
    totals: {
      total: all.length,
      codeql: all.filter((i) => i.source === "codeql").length,
      sonarcloud: all.filter((i) => i.source === "sonarcloud").length,
      eslint: all.filter((i) => i.source === "eslint").length,
    },
    issues: all
      .sort((a, b) => a.severity.rank - b.severity.rank)
      .map(({ raw: _raw, ...rest }) => rest),
  };
  writeFileSync("issues-report.json", JSON.stringify(out, null, 2));
  console.log("\n✅ Wrote issues-report.json");
}

function writeFixPlan(all) {
  const ranked = [...all].sort((a, b) => a.severity.rank - b.severity.rank);
  const lines = [
    `# Fix Plan — ${REPO}`,
    `Generated: ${new Date().toISOString()}`,
    `Total open issues: ${all.length}`,
    "",
    "## Priority order (fix top → bottom)",
    "",
  ];

  let idx = 1;
  for (const i of ranked) {
    const line = i.startLine ? `:${i.startLine}` : "";
    lines.push(
      `### ${idx}. [${i.source.toUpperCase()}] ${severityIcon(i.severity.rank)} ${i.severity.label} — ${i.rule}`,
      `**File:** \`${i.file}${line}\``,
      `**Issue:** ${i.description}`,
      `**Link:** ${i.url}`,
      "",
    );
    idx++;
  }
  writeFileSync("fix-plan.md", lines.join("\n"));
  console.log("✅ Wrote fix-plan.md");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const [codeql, sonar, eslint] = await Promise.all([
    fetchCodeQLAlerts(),
    fetchSonarIssues(),
    fetchReviewDogAnnotations(),
  ]);

  const all = [...codeql, ...sonar, ...eslint];

  if (all.length === 0) {
    console.log("\n✅ No open issues found across all sources.");
    return;
  }

  printReport(all);

  if (WRITE_JSON) writeJson(all);
  if (WRITE_PLAN) writeFixPlan(all);

  if (!WRITE_JSON && !WRITE_PLAN) {
    console.log("\nTip: run with --json or --fix-plan to save results to a file.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
