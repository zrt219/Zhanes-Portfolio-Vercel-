import { describe, expect, it } from "vitest";
import { generateAuditReport, generateWorkflow, runEvalSuite } from "@/lib/workflow-studio";

describe("Enterprise Agent Workflow Studio", () => {
  it("adds approval gates for high-risk tool use", () => {
    const workflow = generateWorkflow({ objective: "Approve a refund after evidence review", selectedTools: ["crm_lookup", "refund_api"], riskLevel: "high" });
    expect(workflow.approvalGates.some((gate) => gate.toolId === "refund_api")).toBe(true);
  });

  it("keeps read-only workflows ungated", () => {
    const workflow = generateWorkflow({ objective: "Answer a policy question from internal documents", selectedTools: ["policy_search"], riskLevel: "low" });
    expect(workflow.approvalGates).toHaveLength(0);
  });

  it("runs deterministic evals", () => {
    expect(runEvalSuite().score).toBe(100);
  });

  it("exports an audit report", () => {
    const report = generateAuditReport(generateWorkflow({ objective: "Update a case with approval", selectedTools: ["ticket_update"], riskLevel: "medium" }));
    expect(report).toContain("Enterprise Agent Workflow Audit Report");
    expect(report).toContain("Approval Gates");
  });
});
