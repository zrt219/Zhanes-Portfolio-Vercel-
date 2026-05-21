import { z } from "zod";

export const workflowRequestSchema = z.object({
  objective: z.string().min(10).default("Resolve a customer intake escalation with tool-safe evidence gathering."),
  selectedTools: z.array(z.string()).default(["crm_lookup", "policy_search", "ticket_update", "human_approval"]),
  riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
  dataClass: z.enum(["public", "internal", "regulated"]).default("internal"),
});

export type WorkflowRequest = z.input<typeof workflowRequestSchema>;

export const toolRegistry = [
  { id: "crm_lookup", name: "CRM Lookup", risk: "medium", scope: "Read customer account context", approval: false },
  { id: "policy_search", name: "Policy Search", risk: "low", scope: "Retrieve policy snippets", approval: false },
  { id: "ticket_update", name: "Ticket Update", risk: "medium", scope: "Draft case notes", approval: true },
  { id: "refund_api", name: "Refund API", risk: "high", scope: "Prepare refund action", approval: true },
  { id: "ehr_context", name: "EHR Context", risk: "high", scope: "Read regulated patient-adjacent context", approval: true },
  { id: "human_approval", name: "Human Approval", risk: "high", scope: "Gate irreversible actions", approval: true },
];

export const evalFixtures = [
  { id: "approval-gate", objective: "High-risk refund workflow", tools: ["crm_lookup", "refund_api", "human_approval"], mustGate: "refund_api" },
  { id: "read-only", objective: "Read-only policy answer", tools: ["policy_search"], mustGate: "" },
  { id: "ticket-note", objective: "Update support ticket after evidence review", tools: ["crm_lookup", "ticket_update"], mustGate: "ticket_update" },
  { id: "regulated-context", objective: "Regulated care context review", tools: ["ehr_context", "policy_search"], mustGate: "ehr_context" },
];

export function generateWorkflow(input: WorkflowRequest) {
  const config = workflowRequestSchema.parse(input);
  const selected = toolRegistry.filter((tool) => config.selectedTools.includes(tool.id));
  const selectedIds = new Set(selected.map((tool) => tool.id));
  const unknownTools = config.selectedTools.filter((id) => !selectedIds.has(id));
  const riskScore = selected.reduce((score, tool) => score + (tool.risk === "high" ? 35 : tool.risk === "medium" ? 18 : 6), config.dataClass === "regulated" ? 30 : config.dataClass === "internal" ? 10 : 0);
  const nodes = [
    { id: "intake", label: "Intake Agent", type: "agent", status: "READY" },
    { id: "scribe", label: "Scribe Agent", type: "agent", status: "READY" },
    ...selected.map((tool) => ({
      id: tool.id,
      label: tool.name,
      type: "tool",
      status: tool.approval || tool.risk === "high" || config.riskLevel === "high" ? "APPROVAL REQUIRED" : "READY",
    })),
    { id: "audit", label: "Audit Report", type: "evidence", status: "READY" },
  ];

  const approvalGates = selected
    .filter((tool) => tool.approval || tool.risk === "high" || config.riskLevel === "high" || config.dataClass === "regulated")
    .map((tool) => ({
      toolId: tool.id,
      label: tool.name,
      gate: "Human approval required before execution",
      evidenceRequired: ["request intent", "retrieved context", "proposed action", "rollback path"],
    }));

  const edges = nodes.slice(0, -1).map((node, index) => ({ from: node.id, to: nodes[index + 1].id }));

  return {
    objective: config.objective,
    mode: "DEMO LOCAL ONLY",
    dataClass: config.dataClass,
    riskScore: Math.min(100, riskScore),
    readiness: {
      status: unknownTools.length ? "BLOCKED" : approvalGates.length ? "APPROVAL REQUIRED" : "READY",
      blockers: unknownTools.map((tool) => `Unknown tool requested: ${tool}`),
      launchChecklist: [
        "Confirm tool scopes before execution.",
        "Capture retrieved evidence before write actions.",
        "Require human approval for regulated or irreversible actions.",
        "Export audit report after workflow simulation.",
      ],
    },
    nodes,
    edges,
    approvalGates,
    evalCases: evalFixtures.length,
    auditSummary: approvalGates.length
      ? `${approvalGates.length} approval gate(s) inserted before risky tool use.`
      : "Read-only workflow can run without human approval gates.",
    safetyNotes: [
      "No real enterprise systems are called.",
      "Tool/API registry is mocked for deterministic evaluation.",
      "High-risk and write-capable tools are gated with explicit approval.",
    ],
    runbook: [
      "Define objective and data classification.",
      "Select the smallest safe set of tools.",
      "Review generated gates and evidence requirements.",
      "Run eval cases before promoting a workflow template.",
      "Export the audit report for reviewer sign-off.",
    ],
  };
}

export function generateAuditReport(workflow: ReturnType<typeof generateWorkflow>) {
  return `# Enterprise Agent Workflow Audit Report

## Objective
${workflow.objective}

## Mode
${workflow.mode}

## Readiness
${workflow.readiness.status}; risk score ${workflow.riskScore}/100.

## Approval Gates
${workflow.approvalGates.length ? workflow.approvalGates.map((gate) => `- ${gate.label}: ${gate.gate}`).join("\n") : "- None required for selected read-only workflow."}

## Agent Graph
${workflow.edges.map((edge) => `- ${edge.from} -> ${edge.to}`).join("\n")}

## Safety Notes
${workflow.safetyNotes.map((note) => `- ${note}`).join("\n")}
`;
}

export function runEvalSuite() {
  const cases = evalFixtures.map((fixture) => {
    const workflow = generateWorkflow({ objective: fixture.objective, selectedTools: fixture.tools, riskLevel: fixture.mustGate ? "high" : "low", dataClass: fixture.id === "regulated-context" ? "regulated" : "internal" });
    const gated = fixture.mustGate ? workflow.approvalGates.some((gate) => gate.toolId === fixture.mustGate) : workflow.approvalGates.length === 0;
    return {
      id: fixture.id,
      result: gated ? "PASS" : "FAIL",
      notes: gated ? "Approval behavior matched expected enterprise policy." : "Approval policy did not match expected gate.",
    };
  });

  const passed = cases.filter((item) => item.result === "PASS").length;
  return { total: cases.length, passed, failed: cases.length - passed, score: Math.round((passed / cases.length) * 100), cases };
}
