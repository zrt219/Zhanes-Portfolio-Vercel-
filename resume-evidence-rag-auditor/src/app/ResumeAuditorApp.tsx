"use client";

import { useMemo, useState } from "react";
import { auditRequestSchema, auditResumeClaims, evidenceCorpus } from "@/lib/rag-auditor";
import { socialLinks } from "@/lib/social";

export function ResumeAuditorApp() {
  const defaults = auditRequestSchema.parse({});
  const [jobDescription, setJobDescription] = useState(defaults.jobDescription);
  const [claimsText, setClaimsText] = useState(defaults.claims.join("\n"));
  const claims = claimsText.split("\n").map((claim) => claim.trim()).filter(Boolean);
  const audit = useMemo(() => auditResumeClaims({ jobDescription, claims }), [jobDescription, claimsText]);

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
          <h1 style={{ fontSize: 48, lineHeight: 1, margin: "24px 0 16px" }}>Audit resume claims against project evidence before tailoring bullets.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>Editable job description and claim list with local retrieval, evidence gaps, grounded bullets, and readiness checks.</p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Readiness</h2>
          <p className={audit.readiness.status === "READY" ? "chip pass" : "chip review"}>{audit.readiness.status}</p>
          <p style={{ fontSize: 42, margin: "12px 0" }}>{audit.summary.score}%</p>
          <p className="muted">{audit.summary.verified}/{audit.summary.total} claims verified.</p>
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Inputs</h2>
          <label className="muted" htmlFor="jd">Job description</label>
          <textarea id="jd" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} style={{ width: "100%", minHeight: 120, marginTop: 8, padding: 12, borderRadius: 8, border: "1px solid #31445b", background: "#090f18", color: "#edf5ff" }} />
          <label className="muted" htmlFor="claims">Claims, one per line</label>
          <textarea id="claims" value={claimsText} onChange={(event) => setClaimsText(event.target.value)} style={{ width: "100%", minHeight: 150, marginTop: 8, padding: 12, borderRadius: 8, border: "1px solid #31445b", background: "#090f18", color: "#edf5ff" }} />
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Evidence Corpus</h2>
          {evidenceCorpus.map((item) => <p key={item.id} className="muted"><strong>{item.title}</strong>: {item.tags.join(", ")}</p>)}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Claim Review</h2>
        <div className="grid">
          {audit.auditedClaims.map((claim) => (
            <div key={claim.claim} style={{ border: "1px solid #31445b", borderRadius: 8, padding: 14, background: "rgba(0,0,0,.24)" }}>
              <p className={claim.status === "VERIFIED" ? "chip pass" : "chip review"}>{claim.status}</p>
              <strong>{claim.claim}</strong>
              <p className="muted">Confidence {Math.round(claim.confidence * 100)}% | Job overlap: {claim.jobOverlap.join(", ") || "none"}</p>
              {claim.evidence.map((item) => <p key={item.id} className="muted">Evidence: {item.title} | {item.matchedTags.join(", ")}</p>)}
              {claim.flags.map((flag) => <p key={flag} className="muted">Flag: {flag}</p>)}
            </div>
          ))}
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Evidence Gaps</h2>
          {audit.evidenceGaps.length ? audit.evidenceGaps.map((gap) => <p key={gap.claim} className="chip review" style={{ marginRight: 8 }}>{gap.gap}</p>) : <p className="chip pass">No gaps detected</p>}
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Grounded Bullets</h2>
          <pre className="mono" style={{ whiteSpace: "pre-wrap", color: "#dceaff", maxHeight: 260, overflow: "auto" }}>{audit.tailoredBullets.map((bullet) => `- ${bullet}`).join("\n")}</pre>
        </div>
      </section>
    </main>
  );
}
