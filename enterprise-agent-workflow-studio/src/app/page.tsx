import { CheckCircle2, GitBranch, ShieldAlert, Wrench } from "lucide-react";
import { generateWorkflow, runEvalSuite, toolRegistry } from "@/lib/workflow-studio";
import { socialLinks } from "@/lib/social";

export default function Page() {
  const workflow = generateWorkflow({
    objective: "Coordinate an enterprise customer escalation with evidence gathering, ticket drafting, and human approval before write actions.",
    selectedTools: ["crm_lookup", "policy_search", "ticket_update", "human_approval"],
    riskLevel: "high",
  });
  const evals = runEvalSuite();

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
          <h1 style={{ fontSize: 54, lineHeight: 1, margin: "24px 0 16px" }}>Design enterprise-safe agent workflows before tools can act.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>
            Define a workflow, select mock tools, generate an agent graph, add approval gates, run eval cases, and export an audit report for enterprise review.
          </p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Workflow Proof</h2>
          {["Tool registry", "Approval gates", "Agent graph", "Eval fixtures", "Audit report"].map((item) => (
            <p key={item} className="chip pass" style={{ marginRight: 8 }}><CheckCircle2 size={15} />{item}</p>
          ))}
          <p className="muted" style={{ lineHeight: 1.6 }}>Maps to Cohere Agentic Workflows, Anthropic Enterprise Tech, and autonomous-agent workflow roles.</p>
        </div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 20 }}><GitBranch /><h3>Generated Graph</h3><p className="muted">{workflow.nodes.length} nodes and {workflow.edges.length} edges from deterministic policy.</p></div>
        <div className="panel" style={{ padding: 20 }}><ShieldAlert /><h3>Approval Gates</h3><p className="muted">{workflow.auditSummary}</p></div>
        <div className="panel" style={{ padding: 20 }}><Wrench /><h3>Tool Registry</h3><p className="muted">{toolRegistry.length} mock tools with risk, scope, and approval metadata.</p></div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Agent Graph</h2>
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
          <h2>Eval Results</h2>
          <p style={{ fontSize: 36, margin: 0 }}>{evals.score}%</p>
          <p className="muted">{evals.passed}/{evals.total} enterprise safety fixtures passed.</p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Audit Export</h2>
          <pre className="mono" style={{ whiteSpace: "pre-wrap", color: "#cfe0f5" }}>{workflow.safetyNotes.map((note) => `- ${note}`).join("\n")}</pre>
        </div>
      </section>
    </main>
  );
}
