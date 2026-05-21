import { z } from "zod";

export const workflowRequestSchema = z.object({
  objective: z.string().min(10).default("Resolve a customer intake escalation with tool-safe evidence gathering."),
  selectedTools: z.array(z.string()).default(["crm_lookup", "policy_search", "ticket_update", "human_approval"]),
  riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
});

export type WorkflowRequest = z.infer<typeof workflowRequestSchema>;

export const toolRegistry = [
  { id: "crm_lookup", name: "CRM Lookup", risk: "medium", scope: "Read customer account context", approval: false },
  { id: "policy_search", name: "Policy Search", risk: "low", scope: "Retrieve policy snippets", approval: false },
  { id: "ticket_update", name: "Ticket Update", risk: "medium", scope: "Draft case notes", approval: true },
  { id: "refund_api", name: "Refund API", risk: "high", scope: "Prepare refund action", approval: true },
  { id: "human_approval", name: "Human Approval", risk: "high", scope: "Gate irreversible actions", approval: true },
];

export const evalFixtures = [
  { id: "approval-gate", objective: "High-risk refund workflow", tools: ["crm_lookup", "refund_api", "human_approval"], mustGate: "refund_api" },
  { id: "read-only", objective: "Read-only policy answer", tools: ["policy_search"], mustGate: "" },
  { id: "ticket-note", objective: "Update support ticket after evidence review", tools: ["crm_lookup", "ticket_update"], mustGate: "ticket_update" },
];

export function generateWorkflow(input: WorkflowRequest) {
  const selected = toolRegistry.filter((tool) => input.selectedTools.includes(tool.id));
  const nodes = [
    { id: "intake", label: "Intake Agent", type: "agent", status: "READY" },
    { id: "scribe", label: "Scribe Agent", type: "agent", status: "READY" },
    ...selected.map((tool) => ({
      id: tool.id,
      label: tool.name,
      type: "tool",
      status: tool.approval || tool.risk === "high" || input.riskLevel === "high" ? "APPROVAL REQUIRED" : "READY",
    })),
    { id: "audit", label: "Audit Report", type: "evidence", status: "READY" },
  ];

  const approvalGates = selected
    .filter((tool) => tool.approval || tool.risk === "high" || input.riskLevel === "high")
    .map((tool) => ({
      toolId: tool.id,
      label: tool.name,
      gate: "Human approval required before execution",
      evidenceRequired: ["request intent", "retrieved context", "proposed action", "rollback path"],
    }));

  const edges = nodes.slice(0, -1).map((node, index) => ({ from: node.id, to: nodes[index + 1].id }));

  return {
    objective: input.objective,
    mode: "DEMO LOCAL ONLY",
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
  };
}

export function generateAuditReport(workflow: ReturnType<typeof generateWorkflow>) {
  return `# Enterprise Agent Workflow Audit Report

## Objective
${workflow.objective}

## Mode
${workflow.mode}

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
    const workflow = generateWorkflow({ objective: fixture.objective, selectedTools: fixture.tools, riskLevel: fixture.mustGate ? "high" : "low" });
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
