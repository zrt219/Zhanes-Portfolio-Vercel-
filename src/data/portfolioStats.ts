export type PortfolioStat = {
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

export const portfolioStatsLastUpdated = "2026-09-21";
export const portfolioStatsSnapshotLabel = "2026-09-21 Codex Evidence Refresh";
export const portfolioStatsPrivacyBoundary =
  "Public UI shows dated snapshot counts and source labels only. Private evidence contents, local paths, credentials, and sensitive logs are excluded.";

export const portfolioStats: PortfolioStat[] = [
  {
    id: "workflow-events",
    label: "Workflow events",
    value: "1,542,858",
    displayValue: "1,542,858",
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
    value: "1,283",
    displayValue: "1,283",
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
    value: "927,915",
    displayValue: "927,915",
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
    value: "41",
    displayValue: "41",
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
    value: "26",
    displayValue: "26",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-09-21.md",
    confidence: "Medium",
    detail: "Workspace foundry.toml scan excluding build and dependency directories.",
    description: "Foundry project count from the 2026-09-21 workspace scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "solidity-files",
    label: "Solidity files",
    value: "548",
    displayValue: "548",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-09-21.md",
    confidence: "Medium",
    detail: "Workspace .sol scan excluding build and dependency directories.",
    description: "Solidity files counted in the evidence workspace scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "ai-rag-agent-files",
    label: "AI/RAG/agent files",
    value: "15,126",
    displayValue: "15,126",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-09-21.md",
    confidence: "Medium",
    detail: "Path scan for AI, agent, RAG, and eval terms across the workspace.",
    description: "AI, agent, RAG, and eval file-name/path matches from the scan.",
    publicSafe: true,
    lastVerified: portfolioStatsLastUpdated,
  },
  {
    id: "generated-exports",
    label: "Generated exports",
    value: "8",
    displayValue: "8",
    sourceLabel: "Daily Evidence Report",
    sourceFile: "evidence/public/daily-evidence-report-2026-09-21.md",
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
    value: "+1,264",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "jsonl-files",
    label: "JSONL logs",
    value: "1,283",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "corpus-size",
    label: "Corpus size",
    value: "19.1 GB",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
  {
    id: "sessions-updated",
    label: "Sessions updated today",
    value: "8",
    sourceLabel: "Workflow Events Tracker",
    sourceFile: "evidence/public/live-workflow-events-tracker.md",
  },
];
