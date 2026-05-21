import { FileCheck2, SearchCheck, ShieldAlert } from "lucide-react";
import { auditRequestSchema, auditResumeClaims, evidenceCorpus, runEvalSuite } from "@/lib/rag-auditor";
import { socialLinks } from "@/lib/social";

export default function Page() {
  const audit = auditResumeClaims(auditRequestSchema.parse({}));
  const evals = runEvalSuite();

  return (
    <main className="shell">
      <header className="panel" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="muted mono" style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" }}>ZRT Evidence Systems Lab</div>
          <strong>Resume Evidence RAG Auditor</strong>
        </div>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-label="ZRT social links">
          {socialLinks.map((link) => <a key={link.href} className="chip" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
        </nav>
      </header>

      <section className="grid two" style={{ marginTop: 24 }}>
        <div className="panel" style={{ padding: 28 }}>
          <span className="chip review">DEMO JSON RETRIEVAL</span>
          <h1 style={{ fontSize: 54, lineHeight: 1, margin: "24px 0 16px" }}>Verify resume claims against project evidence before tailoring bullets.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>
            RAG-style evidence retrieval over project docs, job-description matching, claim verification, unverified-claim flagging, and grounded bullet generation.
          </p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Audit Score</h2>
          <p style={{ fontSize: 48, margin: 0 }}>{audit.summary.score}%</p>
          <p className="muted">{audit.summary.verified}/{audit.summary.total} claims verified from local evidence.</p>
          <p className="chip pass">Eval score {evals.score}%</p>
        </div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 20 }}><SearchCheck /><h3>Retrieval</h3><p className="muted">{evidenceCorpus.length} local evidence records with tags and proof notes.</p></div>
        <div className="panel" style={{ padding: 20 }}><ShieldAlert /><h3>Claim Safety</h3><p className="muted">{audit.summary.unverified} unverified claim(s) flagged instead of inflated.</p></div>
        <div className="panel" style={{ padding: 20 }}><FileCheck2 /><h3>Tailored Bullets</h3><p className="muted">{audit.tailoredBullets.length} grounded bullet(s) generated from matched evidence.</p></div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Claim Review</h2>
        <div className="grid">
          {audit.auditedClaims.map((claim) => (
            <div key={claim.claim} style={{ border: "1px solid #31445b", borderRadius: 8, padding: 14, background: "rgba(0,0,0,.24)" }}>
              <p className={claim.status === "VERIFIED" ? "chip pass" : "chip review"}>{claim.status}</p>
              <strong>{claim.claim}</strong>
              <p className="muted">Confidence {Math.round(claim.confidence * 100)}%</p>
              {claim.evidence.map((item) => <p key={item.id} className="muted">Evidence: {item.title}</p>)}
              {claim.flags.map((flag) => <p key={flag} className="muted">Flag: {flag}</p>)}
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Grounded Bullets</h2>
        <pre className="mono" style={{ whiteSpace: "pre-wrap", color: "#dceaff" }}>{audit.tailoredBullets.map((bullet) => `- ${bullet}`).join("\n")}</pre>
      </section>
    </main>
  );
}
