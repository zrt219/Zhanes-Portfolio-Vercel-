import { describe, expect, it } from "vitest";
import { auditResumeClaims, generateReport, runEvalSuite } from "@/lib/rag-auditor";

describe("Resume Evidence RAG Auditor", () => {
  it("verifies claims with local evidence", () => {
    const audit = auditResumeClaims({ jobDescription: "RAG and evals", claims: ["Built Vercel Build Doctor Agent with evals and reports."] });
    expect(audit.auditedClaims[0].status).toBe("VERIFIED");
    expect(audit.auditedClaims[0].evidence.length).toBeGreaterThan(0);
  });

  it("flags inflated claims without evidence", () => {
    const audit = auditResumeClaims({ jobDescription: "AI role", claims: ["Led production AI platform for millions of users."] });
    expect(audit.auditedClaims[0].status).toBe("UNVERIFIED");
  });

  it("generates an evidence report", () => {
    const audit = auditResumeClaims({ jobDescription: "agent workflows", claims: ["Built enterprise-safe agent workflow demos with approval gates and audit reports."] });
    expect(generateReport(audit)).toContain("Resume Evidence RAG Audit Report");
  });

  it("passes eval fixtures", () => {
    expect(runEvalSuite().score).toBe(100);
  });
});
