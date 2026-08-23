# Public-Safe Daily Evidence Report Summary - 2026-07-05

- Source: Daily Codex Evidence Refresh Report
- Scope: public-safe summary for portfolio UI verification
- Public boundary: private absolute paths, raw session logs, tokens, prompts, and secrets are excluded.

## Live Counts

| Metric | Current Count | Evidence Source | Confidence |
|---|---:|---|---|
| Codex sessions found | 1,018 | Rebuilt session index plus stored rollout corpus | High |
| Live workflow events | 1,335,420 | Non-empty JSONL records across active and archived local session storage | High |
| Local session logs | 1,018 | JSONL files across local Codex session storage | High |
| Source code lines | 681,420 | Source-extension line count across the scanned workspace | Medium |
| Sessions updated today | 8 | Current-day JSONL rollouts plus rebuilt index rows dated 2026-08-23 | High |
| Public GitHub repos scanned | 34 | Effective public GitHub snapshot for zrt219 | High |
| Solidity files found | 326 | Workspace .sol scan excluding build/dependency directories | Medium |
| Foundry projects found | 18 | Workspace foundry.toml scan excluding build/dependency directories | Medium |
| AI/RAG/agent files found | 13,550 | Workspace path scan for AI/agent/RAG/eval terms | Medium |
| Generated exports | 8 | Root resume/packet/diary DOCX, PDF, HTML, and ATS TXT artifacts | High |

## Evidence Boundary

These counts are a dated evidence snapshot, not live telemetry. The public portfolio must label them as last verified on 2026-08-23 unless the evidence refresh pipeline runs again.
