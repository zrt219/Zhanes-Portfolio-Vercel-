import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const defaultSource = path.resolve(repoRoot, "..", "..", "live-workflow-events-tracker.md");
const sourcePath = path.resolve(process.env.WORKFLOW_TRACKER_SOURCE ?? defaultSource);

function readSource() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Workflow tracker source not found: ${sourcePath}`);
  }

  return fs.readFileSync(sourcePath, "utf8");
}

function parseNumber(value) {
  const cleaned = value.replace(/[,+\s]/g, "");
  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse numeric value: ${value}`);
  }

  return parsed;
}

function parseBullet(source, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, "m"));

  if (!match?.[1]) {
    throw new Error(`Missing tracker field: ${label}`);
  }

  return match[1].trim();
}

function parseHistory(source) {
  const rows = [...source.matchAll(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([\d,]+)\s*\|\s*([+\-\d,]+)\s*\|\s*([\d,]+)\s*\|$/gm)];

  if (rows.length === 0) {
    throw new Error("No workflow history rows found.");
  }

  return rows.map((row) => ({
    date: row[1],
    workflowEvents: parseNumber(row[2]),
    dailyDelta: parseNumber(row[3]),
    sessionRows: parseNumber(row[4]),
  }));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : "-"}${formatNumber(Math.abs(value))}`;
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(repoRoot, relativePath), content.replace(/\n/g, "\r\n"));
}

function updateReadme(snapshot) {
  const readmePath = path.join(repoRoot, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const replacement = `## Evidence Snapshot

Latest public-safe metric snapshot: \`${snapshot.lastRefreshed}\`

| Metric | Value | Source Label |
|---|---:|---|
| Workflow events | ${formatNumber(snapshot.currentWorkflowEvents)} | Workflow Events Tracker |
| Daily delta | ${formatSigned(snapshot.currentDelta)} | Workflow Events Tracker |
| Codex sessions | ${formatNumber(snapshot.sessionIndexRows)} | Workflow Events Tracker |
| Unique thread ids | ${formatNumber(snapshot.uniqueThreadIds)} | Workflow Events Tracker |
| JSONL files | ${formatNumber(snapshot.jsonlFiles)} | Workflow Events Tracker |
| Corpus size | ${snapshot.corpusSizeGb.toFixed(1)} GB | Workflow Events Tracker |
| Source-code lines | ${formatNumber(snapshot.sourceCodeLines)} | Workflow Events Tracker |
| Sessions updated today | ${formatNumber(snapshot.sessionsUpdatedToday)} | Workflow Events Tracker |
| Public GitHub repos scanned | 22 | GitHub Source Memory |
| Foundry projects | 18 | Daily Evidence Report |
| Solidity files | 326 | Daily Evidence Report |
| AI/RAG/agent files | 12,891 | Daily Evidence Report |
| Generated exports | 8 | Daily Evidence Report |

Public-safe evidence files:

- \`evidence/public/live-workflow-events-tracker.md\`
- \`evidence/public/daily-evidence-report-2026-05-24.md\`
- \`evidence/public/session-index-summary.md\`
- \`evidence/public/github-profile-source-memory.md\`
`;

  const updated = readme.replace(/## Evidence Snapshot[\s\S]*?(?=\n## Featured Systems)/, replacement);

  if (updated === readme && !readme.includes(replacement)) {
    throw new Error("README Evidence Snapshot section was not found.");
  }

  if (updated !== readme) {
    fs.writeFileSync(readmePath, updated);
  }
}

const source = readSource();
const history = parseHistory(source);
const latest = history[history.length - 1];

const snapshot = {
  lastRefreshed: parseBullet(source, "Last refreshed"),
  codexMode: parseBullet(source, "Codex mode"),
  currentWorkflowEvents: parseNumber(parseBullet(source, "Current workflow events")),
  currentDelta: parseNumber(parseBullet(source, "Current delta vs previous day in this tracker")),
  sessionIndexRows: parseNumber(parseBullet(source, "Session index rows")),
  uniqueThreadIds: parseNumber(parseBullet(source, "Unique thread ids")),
  jsonlFiles: parseNumber(parseBullet(source, "JSONL files")),
  corpusSizeGb: parseFloat(parseBullet(source, "Corpus size").replace(/\s*GB$/i, "")),
  sourceCodeLines: parseNumber(parseBullet(source, "Source code lines")),
  sessionsUpdatedToday: parseNumber(parseBullet(source, "Sessions updated today")),
  purpose: parseBullet(source, "Purpose"),
};

if (latest.date !== snapshot.lastRefreshed || latest.workflowEvents !== snapshot.currentWorkflowEvents) {
  throw new Error("Latest history row does not match the current tracker snapshot.");
}

writeFile(
  "evidence/public/live-workflow-events-tracker.md",
  `# Public-Safe Workflow Events Tracker Summary

- Source: canonical local workflow tracker markdown
- Last refreshed: ${snapshot.lastRefreshed}
- Public boundary: summary counts only; raw JSONL logs, prompts, tokens, secrets, and private paths are not included.
- Refresh note: Generated by \`npm run refresh:workflow-tracker\` from the canonical tracker file.

## Counts

- Current workflow events: ${formatNumber(snapshot.currentWorkflowEvents)}
- Current delta vs previous point in this tracker: ${formatSigned(snapshot.currentDelta)}
- Session index rows: ${formatNumber(snapshot.sessionIndexRows)}
- Unique thread ids: ${formatNumber(snapshot.uniqueThreadIds)}
- JSONL files: ${formatNumber(snapshot.jsonlFiles)}
- Corpus size: ${snapshot.corpusSizeGb.toFixed(1)} GB
- Source code lines: ${formatNumber(snapshot.sourceCodeLines)}
- Sessions updated today: ${formatNumber(snapshot.sessionsUpdatedToday)}

## History

| Date | Workflow events | Daily delta | Session rows |
|---|---:|---:|---:|
${history.map((row) => `| ${row.date} | ${formatNumber(row.workflowEvents)} | ${formatSigned(row.dailyDelta)} | ${formatNumber(row.sessionRows)} |`).join("\n")}
`,
);

writeFile(
  "evidence/public/session-index-summary.md",
  `# Public-Safe Codex Session Index Summary

- Last refreshed: ${snapshot.lastRefreshed}
- Session index rows: ${formatNumber(snapshot.sessionIndexRows)}
- Unique thread ids: ${formatNumber(snapshot.uniqueThreadIds)}
- JSONL files: ${formatNumber(snapshot.jsonlFiles)}
- Corpus size: ${snapshot.corpusSizeGb.toFixed(1)} GB
- Source code lines: ${formatNumber(snapshot.sourceCodeLines)}
- Public boundary: aggregate counts only; raw session rows, private paths, prompts, and secrets are excluded.
- Source: \`evidence/public/live-workflow-events-tracker.md\`
`,
);

writeFile(
  "src/data/workflowEvents.ts",
  `export type WorkflowEventPoint = {
  date: string;
  workflowEvents: number;
  dailyDelta: number;
  sessionRows: number;
  status: "verified" | "review";
  sourceFile: string;
  note?: string;
};

export const workflowEventsLastUpdated = "${snapshot.lastRefreshed}";
export const workflowEventsSourceLabel = "Workflow Events Tracker";
export const workflowEventsSourceFile = "evidence/public/live-workflow-events-tracker.md";

export const workflowEventHistory: WorkflowEventPoint[] = [
${history
  .map(
    (row, index) => `  {
    date: "${row.date}",
    workflowEvents: ${row.workflowEvents},
    dailyDelta: ${row.dailyDelta},
    sessionRows: ${row.sessionRows},
    status: "${index === 0 ? "review" : "verified"}",
    sourceFile: workflowEventsSourceFile,${index === 0 ? '\n    note: "Baseline tracker snapshot retained for day-over-day comparison.",' : ""}
  },`,
  )
  .join("\n")}
];

export const latestWorkflowSnapshot = workflowEventHistory[workflowEventHistory.length - 1];
`,
);

writeFile(
  "src/data/liveWorkflowTracker.ts",
  `import type { LiveWorkflowTrackerSnapshot } from "@/types/liveWorkflowTracker";

export const liveWorkflowTrackerSnapshot: LiveWorkflowTrackerSnapshot = {
  lastRefreshed: "${snapshot.lastRefreshed}",
  codexMode: "${snapshot.codexMode}",
  currentWorkflowEvents: ${snapshot.currentWorkflowEvents},
  currentDelta: ${snapshot.currentDelta},
  sessionIndexRows: ${snapshot.sessionIndexRows},
  uniqueThreadIds: ${snapshot.uniqueThreadIds},
  jsonlFiles: ${snapshot.jsonlFiles},
  corpusSizeGb: ${snapshot.corpusSizeGb},
  sourceCodeLines: ${snapshot.sourceCodeLines},
  sessionsUpdatedToday: ${snapshot.sessionsUpdatedToday},
  localSessionLogs: ${snapshot.jsonlFiles},
  portfolioStatsRefreshed: true,
  publicGitHubReposScanned: 22,
  solidityFilesFound: 326,
  foundryProjectsFound: 18,
  aiRagAgentFilesFound: 12891,
  generatedExports: 8,
  sourceLabel: "Generated from the canonical local workflow tracker with npm run refresh:workflow-tracker.",
  privacyNote: "Only aggregate metrics are shown. Raw logs, private paths, secrets, and local file contents are not exposed.",
  history: [
${history
  .map(
    (row, index) => `    {
      date: "${row.date}",
      workflowEvents: ${row.workflowEvents},
      dailyDelta: ${row.dailyDelta},
      sessionRows: ${row.sessionRows},
      label: "${index === 0 ? "Baseline tracker snapshot" : `${row.date} tracker refresh`}",
    },`,
  )
  .join("\n")}
  ],
  evidenceSources: [
    {
      id: "workflow-events-tracker",
      label: "Workflow Events Tracker",
      sourceType: "markdown-tracker",
      publicSafeLabel: "Public-safe tracker summary",
      lastRefreshed: "${snapshot.lastRefreshed}",
      confidence: "high",
      privatePathRedacted: true,
      supports: [
        "current workflow events",
        "daily delta",
        "session rows",
        "JSONL file count",
        "corpus size",
        "source-code lines",
        "history points",
      ],
    },
    {
      id: "daily-evidence-report",
      label: "Daily Evidence Report",
      sourceType: "daily-report",
      publicSafeLabel: "Public-safe daily refresh summary",
      lastRefreshed: "2026-05-24",
      confidence: "medium",
      privatePathRedacted: true,
      supports: [
        "public GitHub repos scanned",
        "generated exports",
        "workspace scan confidence labels",
      ],
    },
    {
      id: "portfolio-stats-source",
      label: "Portfolio Stats Source",
      sourceType: "portfolio-stats-source",
      publicSafeLabel: "Typed portfolio stats data",
      lastRefreshed: "${snapshot.lastRefreshed}",
      confidence: "high",
      privatePathRedacted: true,
      supports: ["public stat synchronization", "safe public labels", "privacy boundary copy"],
    },
  ],
  metricDefinitions: [
    {
      id: "workflow-events",
      label: "Workflow events",
      definition: "Non-empty workflow records counted during the local evidence refresh.",
      sourceLabel: "Workflow Events Tracker",
      confidence: "high",
    },
    {
      id: "session-rows",
      label: "Codex sessions",
      definition: "Rebuilt session index rows aligned to local session logs in the dated refresh.",
      sourceLabel: "Workflow Events Tracker",
      confidence: "high",
    },
    {
      id: "source-lines",
      label: "Source-code lines",
      definition: "Source-extension line count across the scanned AI engineering workspace.",
      sourceLabel: "Workflow Events Tracker",
      confidence: "medium",
    },
    {
      id: "public-repos",
      label: "Public GitHub repos scanned",
      definition: "Public GitHub fallback snapshot for zrt219, with private repositories excluded.",
      sourceLabel: "Daily Evidence Report",
      confidence: "high",
    },
  ],
};
`,
);

writeFile(
  "src/data/portfolioStats.ts",
  `export type PortfolioStat = {
  id: string;
  label: string;
  value: string;
  displayValue: string;
  sourceLabel: string;
  sourceFile: string;
  confidence: "High" | "Medium";
  detail: string;
  description: string;
  publicSafe: boolean;
  lastVerified: string;
};

export const portfolioStatsLastUpdated = "${snapshot.lastRefreshed}";
export const portfolioStatsSnapshotLabel = "May 26 Codex Evidence Refresh";
export const portfolioStatsPrivacyBoundary =
  "Public UI shows dated snapshot counts and source labels only. Private evidence contents, local paths, credentials, and sensitive logs are excluded.";

export const portfolioStats: PortfolioStat[] = [
  {
    id: "workflow-events",
    label: "Workflow events",
    value: "${formatNumber(snapshot.currentWorkflowEvents)}",
    displayValue: "${formatNumber(snapshot.currentWorkflowEvents)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
    confidence: "High",
    detail: "Non-empty local Codex workflow records counted across active and archived session storage.",
    description: "Tracked workflow records across the local Codex evidence corpus.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "codex-sessions",
    label: "Codex sessions",
    value: "${formatNumber(snapshot.sessionIndexRows)}",
    displayValue: "${formatNumber(snapshot.sessionIndexRows)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
    confidence: "High",
    detail: "Session index rows aligned to local session logs in the canonical workflow tracker.",
    description: "Codex session rows recorded by the evidence refresh.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "source-lines",
    label: "Source-code lines",
    value: "${formatNumber(snapshot.sourceCodeLines)}",
    displayValue: "${formatNumber(snapshot.sourceCodeLines)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
    confidence: "Medium",
    detail: "Source-extension line count across the scanned AI engineering workspace.",
    description: "Source-line scan across included workspace file types.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "public-repos",
    label: "Public GitHub repos scanned",
    value: "22",
    displayValue: "22",
    sourceLabel: "GitHub Source Memory",
    sourceFile: "evidence/public/github-profile-source-memory.md",
    confidence: "High",
    detail: "Public GitHub fallback snapshot for zrt219 with private repositories excluded.",
    description: "Public repository count from the source-memory snapshot.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "foundry-projects",
    label: "Foundry projects",
    value: "18",
    displayValue: "18",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-05-24.md",
    confidence: "Medium",
    detail: "Workspace foundry.toml scan excluding build and dependency directories.",
    description: "Foundry project count from the May 24 workspace scan.",
    publicSafe: true,
    lastVerified: "2026-05-24",
  },
  {
    id: "solidity-files",
    label: "Solidity files",
    value: "326",
    displayValue: "326",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-05-24.md",
    confidence: "Medium",
    detail: "Workspace .sol scan excluding build and dependency directories.",
    description: "Solidity files counted in the evidence workspace scan.",
    publicSafe: true,
    lastVerified: "2026-05-24",
  },
  {
    id: "ai-rag-agent-files",
    label: "AI/RAG/agent files",
    value: "12,891",
    displayValue: "12,891",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-05-24.md",
    confidence: "Medium",
    detail: "Path scan for AI, agent, RAG, and eval terms across the workspace.",
    description: "AI, agent, RAG, and eval file-name/path matches from the scan.",
    publicSafe: true,
    lastVerified: "2026-05-24",
  },
  {
    id: "generated-exports",
    label: "Generated exports",
    value: "8",
    displayValue: "8",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-05-24.md",
    confidence: "High",
    detail: "Root resume, application packet, diary, HTML, DOCX, PDF, and ATS text artifacts.",
    description: "Generated public-safe resume/application artifacts recorded by the refresh.",
    publicSafe: true,
    lastVerified: "2026-05-24",
  },
];

export const portfolioStatsConflictNotes = [
  "Workflow tracker metrics are generated from the canonical tracker file with npm run refresh:workflow-tracker.",
  "GitHub source memory is a public fallback snapshot, not a private repository inventory.",
  "Resume markdown still contains an older 20-repo phrase; the May 24 GitHub source memory verifies 22 public repos for this UI.",
];

export const portfolioAnalytics = [
  {
    id: "daily-delta",
    label: "Daily event delta",
    value: "${formatSigned(snapshot.currentDelta)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "jsonl-files",
    label: "JSONL logs",
    value: "${formatNumber(snapshot.jsonlFiles)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "corpus-size",
    label: "Corpus size",
    value: "${snapshot.corpusSizeGb.toFixed(1)} GB",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "sessions-updated",
    label: "Sessions updated today",
    value: "${formatNumber(snapshot.sessionsUpdatedToday)}",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
];
`,
);

updateReadme(snapshot);

console.log(`Synced workflow tracker from ${sourcePath}`);
console.log(`Current workflow events: ${formatNumber(snapshot.currentWorkflowEvents)}`);
