import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const aiEngineerRoot = path.resolve(repoRoot, "..", "..");
const defaultSource = path.resolve(aiEngineerRoot, "live-workflow-events-tracker.md");
const sourcePath = path.resolve(process.env.WORKFLOW_TRACKER_SOURCE ?? defaultSource);
const rootEvidenceSourceMemory = path.resolve(aiEngineerRoot, "evidence", "source-memory", "github-profile-source-memory.md");

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

function findLatestDailyEvidenceReport() {
  const files = fs
    .readdirSync(aiEngineerRoot)
    .filter((name) => /^daily-evidence-report-\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .sort();

  if (!files.length) {
    throw new Error(`No daily evidence reports found under ${aiEngineerRoot}`);
  }

  return path.join(aiEngineerRoot, files[files.length - 1]);
}

function parseTableMetric(source, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`^\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "m"));

  if (!match?.[1]) {
    throw new Error(`Missing daily report table metric: ${label}`);
  }

  return match[1].trim();
}

function loadDailyReportSnapshot() {
  const reportPath = findLatestDailyEvidenceReport();
  const source = fs.readFileSync(reportPath, "utf8");
  const reportDateMatch = source.match(/^# Daily Codex Evidence Refresh Report - (\d{4}-\d{2}-\d{2})$/m);

  if (!reportDateMatch?.[1]) {
    throw new Error(`Unable to parse report date from ${reportPath}`);
  }

  return {
    reportPath,
    reportDate: reportDateMatch[1],
    publicGitHubReposScanned: parseNumber(parseTableMetric(source, "Public GitHub repos scanned")),
    solidityFilesFound: parseNumber(parseTableMetric(source, "Solidity files found")),
    foundryProjectsFound: parseNumber(parseTableMetric(source, "Foundry projects found")),
    aiRagAgentFilesFound: parseNumber(parseTableMetric(source, "AI/RAG/agent files found")),
    generatedExports: parseNumber(parseTableMetric(source, "Generated exports")),
  };
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(repoRoot, relativePath), content.replace(/\n/g, "\r\n"));
}

function updateReadme(snapshot, dailyReport) {
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
| Public GitHub repos scanned | ${formatNumber(dailyReport.publicGitHubReposScanned)} | GitHub Source Memory |
| Foundry projects | ${formatNumber(dailyReport.foundryProjectsFound)} | Daily Evidence Report |
| Solidity files | ${formatNumber(dailyReport.solidityFilesFound)} | Daily Evidence Report |
| AI/RAG/agent files | ${formatNumber(dailyReport.aiRagAgentFilesFound)} | Daily Evidence Report |
| Generated exports | ${formatNumber(dailyReport.generatedExports)} | Daily Evidence Report |

Public-safe evidence files:

- \`evidence/public/live-workflow-events-tracker.md\`
- \`evidence/public/daily-evidence-report-${dailyReport.reportDate}.md\`
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
const dailyReport = loadDailyReportSnapshot();

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
  `evidence/public/daily-evidence-report-${dailyReport.reportDate}.md`,
  `# Public-Safe Daily Evidence Report Summary - ${dailyReport.reportDate}

- Source: Daily Codex Evidence Refresh Report
- Scope: public-safe summary for portfolio UI verification
- Public boundary: private absolute paths, raw session logs, tokens, prompts, and secrets are excluded.

## Live Counts

| Metric | Current Count | Evidence Source | Confidence |
|---|---:|---|---|
| Codex sessions found | ${formatNumber(snapshot.sessionIndexRows)} | Rebuilt session index plus stored rollout corpus | High |
| Live workflow events | ${formatNumber(snapshot.currentWorkflowEvents)} | Non-empty JSONL records across active and archived local session storage | High |
| Local session logs | ${formatNumber(snapshot.jsonlFiles)} | JSONL files across local Codex session storage | High |
| Source code lines | ${formatNumber(snapshot.sourceCodeLines)} | Source-extension line count across the scanned workspace | Medium |
| Sessions updated today | ${formatNumber(snapshot.sessionsUpdatedToday)} | Current-day JSONL rollouts plus rebuilt index rows dated ${snapshot.lastRefreshed} | High |
| Public GitHub repos scanned | ${formatNumber(dailyReport.publicGitHubReposScanned)} | Effective public GitHub snapshot for zrt219 | High |
| Solidity files found | ${formatNumber(dailyReport.solidityFilesFound)} | Workspace .sol scan excluding build/dependency directories | Medium |
| Foundry projects found | ${formatNumber(dailyReport.foundryProjectsFound)} | Workspace foundry.toml scan excluding build/dependency directories | Medium |
| AI/RAG/agent files found | ${formatNumber(dailyReport.aiRagAgentFilesFound)} | Workspace path scan for AI/agent/RAG/eval terms | Medium |
| Generated exports | ${formatNumber(dailyReport.generatedExports)} | Root resume/packet/diary DOCX, PDF, HTML, and ATS TXT artifacts | High |

## Evidence Boundary

These counts are a dated evidence snapshot, not live telemetry. The public portfolio must label them as last verified on ${snapshot.lastRefreshed} unless the evidence refresh pipeline runs again.
`,
);

if (fs.existsSync(rootEvidenceSourceMemory)) {
  writeFile(
    "evidence/public/github-profile-source-memory.md",
    fs.readFileSync(rootEvidenceSourceMemory, "utf8"),
  );
}

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
  publicGitHubReposScanned: ${dailyReport.publicGitHubReposScanned},
  solidityFilesFound: ${dailyReport.solidityFilesFound},
  foundryProjectsFound: ${dailyReport.foundryProjectsFound},
  aiRagAgentFilesFound: ${dailyReport.aiRagAgentFilesFound},
  generatedExports: ${dailyReport.generatedExports},
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
      lastRefreshed: "${dailyReport.reportDate}",
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
export const portfolioStatsSnapshotLabel = "${snapshot.lastRefreshed} Codex Evidence Refresh";
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
    value: "${formatNumber(dailyReport.publicGitHubReposScanned)}",
    displayValue: "${formatNumber(dailyReport.publicGitHubReposScanned)}",
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
    value: "${formatNumber(dailyReport.foundryProjectsFound)}",
    displayValue: "${formatNumber(dailyReport.foundryProjectsFound)}",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-${dailyReport.reportDate}.md",
    confidence: "Medium",
    detail: "Workspace foundry.toml scan excluding build and dependency directories.",
    description: "Foundry project count from the ${dailyReport.reportDate} workspace scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "solidity-files",
    label: "Solidity files",
    value: "${formatNumber(dailyReport.solidityFilesFound)}",
    displayValue: "${formatNumber(dailyReport.solidityFilesFound)}",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-${dailyReport.reportDate}.md",
    confidence: "Medium",
    detail: "Workspace .sol scan excluding build and dependency directories.",
    description: "Solidity files counted in the evidence workspace scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "ai-rag-agent-files",
    label: "AI/RAG/agent files",
    value: "${formatNumber(dailyReport.aiRagAgentFilesFound)}",
    displayValue: "${formatNumber(dailyReport.aiRagAgentFilesFound)}",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-${dailyReport.reportDate}.md",
    confidence: "Medium",
    detail: "Path scan for AI, agent, RAG, and eval terms across the workspace.",
    description: "AI, agent, RAG, and eval file-name/path matches from the scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "generated-exports",
    label: "Generated exports",
    value: "${formatNumber(dailyReport.generatedExports)}",
    displayValue: "${formatNumber(dailyReport.generatedExports)}",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-${dailyReport.reportDate}.md",
    confidence: "High",
    detail: "Root resume, application packet, diary, HTML, DOCX, PDF, and ATS text artifacts.",
    description: "Generated public-safe resume/application artifacts recorded by the refresh.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
];

export const portfolioStatsConflictNotes = [
  "Workflow tracker metrics are generated from the canonical tracker file with npm run refresh:workflow-tracker.",
  "GitHub source memory is a public fallback snapshot, not a private repository inventory.",
  "Public GitHub repo counts come from recruiter-safe source memory and exclude private inventory.",
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

updateReadme(snapshot, dailyReport);

console.log(`Synced workflow tracker from ${sourcePath}`);
console.log(`Current workflow events: ${formatNumber(snapshot.currentWorkflowEvents)}`);
