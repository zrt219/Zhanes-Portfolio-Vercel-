"use client";

import { useMemo, useState } from "react";
import { generateAuditReport, generateWorkflow, toolRegistry, type WorkflowRequest } from "@/lib/workflow-studio";
import { socialLinks } from "@/lib/social";

const defaultRequest: WorkflowRequest = {
  objective: "Coordinate an enterprise customer escalation with evidence gathering, ticket drafting, and human approval before write actions.",
  selectedTools: ["crm_lookup", "policy_search", "ticket_update", "human_approval"],
  riskLevel: "high",
  dataClass: "internal",
};

export function EnterpriseStudioApp() {
  const [objective, setObjective] = useState(defaultRequest.objective);
  const [riskLevel, setRiskLevel] = useState<WorkflowRequest["riskLevel"]>(defaultRequest.riskLevel);
  const [dataClass, setDataClass] = useState<WorkflowRequest["dataClass"]>(defaultRequest.dataClass);
  const [selectedTools, setSelectedTools] = useState<string[]>(defaultRequest.selectedTools ?? []);
  const request = useMemo(() => ({ objective, selectedTools, riskLevel, dataClass }), [objective, selectedTools, riskLevel, dataClass]);
  const workflow = generateWorkflow(request);
  const report = generateAuditReport(workflow);

  function toggleTool(toolId: string) {
    setSelectedTools((current) => current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId]);
  }

  return (
    <main className="shell">
      <header className="panel" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="muted mono" style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" }}>ZRT Agent Systems Lab</div>
          <strong>Enterprise Agent Workflow Studio</strong>
        </div>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-label="ZRT social links">
          {socialLinks.map((link) => <a key={link.href} className="chip" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
        </nav>
      </header>

      <section className="grid two" style={{ marginTop: 24 }}>
        <div className="panel" style={{ padding: 28 }}>
          <span className="chip review">DEMO LOCAL ONLY</span>
          <h1 style={{ fontSize: 48, lineHeight: 1, margin: "24px 0 16px" }}>Design enterprise-safe agent workflows before tools can act.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>Interactive workflow builder with risk scoring, data classification, approval gates, eval readiness, and exportable audit evidence.</p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Readiness</h2>
          <p className={workflow.readiness.status === "READY" ? "chip pass" : "chip review"}>{workflow.readiness.status}</p>
          <p style={{ fontSize: 42, margin: "12px 0" }}>{workflow.riskScore}/100</p>
          <p className="muted">{workflow.auditSummary}</p>
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Workflow Definition</h2>
          <label className="muted" htmlFor="objective">Objective</label>
          <textarea id="objective" value={objective} onChange={(event) => setObjective(event.target.value)} style={{ width: "100%", minHeight: 96, marginTop: 8, padding: 12, borderRadius: 8, border: "1px solid #31445b", background: "#090f18", color: "#edf5ff" }} />
          <div className="grid two" style={{ marginTop: 12 }}>
            <label>Risk level<select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as WorkflowRequest["riskLevel"])} style={{ width: "100%", marginTop: 8, padding: 10 }}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label>
            <label>Data class<select value={dataClass} onChange={(event) => setDataClass(event.target.value as WorkflowRequest["dataClass"])} style={{ width: "100%", marginTop: 8, padding: 10 }}><option value="public">public</option><option value="internal">internal</option><option value="regulated">regulated</option></select></label>
          </div>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Tool Registry</h2>
          {toolRegistry.map((tool) => (
            <label key={tool.id} style={{ display: "block", border: "1px solid #31445b", borderRadius: 8, padding: 12, marginBottom: 10, background: selectedTools.includes(tool.id) ? "rgba(86,185,255,.12)" : "rgba(0,0,0,.2)" }}>
              <input type="checkbox" checked={selectedTools.includes(tool.id)} onChange={() => toggleTool(tool.id)} /> <strong>{tool.name}</strong>
              <span className="muted"> | {tool.risk} | {tool.scope}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Generated Agent Graph</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {workflow.nodes.map((node) => (
            <div key={node.id} style={{ border: "1px solid #31445b", borderRadius: 8, padding: 14, background: "rgba(0,0,0,.24)" }}>
              <div className="mono muted">{node.type}</div>
              <strong>{node.label}</strong>
              <p className={node.status === "APPROVAL REQUIRED" ? "chip review" : "chip pass"}>{node.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Launch Checklist</h2>
          {workflow.readiness.launchChecklist.map((item) => <p key={item} className="chip" style={{ marginRight: 8 }}>{item}</p>)}
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Audit Export</h2>
          <pre className="mono" style={{ whiteSpace: "pre-wrap", color: "#cfe0f5", maxHeight: 280, overflow: "auto" }}>{report}</pre>
        </div>
      </section>
    </main>
  );
}
