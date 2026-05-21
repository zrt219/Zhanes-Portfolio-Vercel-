# Build Doctor Executive Technical Brief

> Document spec: US Letter, 1 inch margins, white background, primary accent `#0B5FFF`, secondary accent `#1F2937`, light callout `#F5F7FA`, Courier New for headings/labels/code, Arial for body, footer `Build Doctor Executive Technical Brief | Page X`.

## Cover

| Field | Value |
|---|---|
| Title | Build Doctor Executive Technical Brief |
| Subtitle | Deterministic Next.js and Vercel Build Failure Diagnosis |
| Value Proposition | Turn failed build logs into a traceable diagnosis, safe patch draft, and exportable incident report. |
| Stack | Next.js 16, React 19, TypeScript, Tailwind CSS, Zod, Vercel, Supabase, OpenRouter DeepSeek free mode |
| Live URL | https://vercel-build-doctor-agent.vercel.app/build-doctor |
| Deployment | https://vercel-build-doctor-agent.vercel.app |
| Deployment ID | `dpl_251nHCbKjvck2zthFXunuCcTEG2p` |
| Repository | https://github.com/zrt219/Build-Doctor |

## Executive Summary

Build Doctor is a production-deployed developer tool that converts failed Next.js and Vercel build logs into a deterministic root-cause diagnosis, evidence trail, safe patch draft, and markdown incident report. The system matters because build failures are high-friction, high-context events: they block deployment, hide the first failure signal behind cascaded errors, and often expose secrets inside raw logs. Build Doctor solves that by redacting sensitive values, extracting the first strong signal, and presenting a human-readable incident workflow instead of a wall of terminal noise.

The hardest technical constraint was keeping the diagnosis deterministic while still allowing an optional provider review. That required a strict boundary: the local engine owns classification, trace generation, patch planning, and report export, while the DeepSeek/OpenRouter layer receives only sanitized diagnosis JSON and is blocked from becoming the source of truth. That boundary also had to fail closed under rate limits, invalid JSON, schema mismatches, and missing credentials so the app could keep working without paid model access.

The outcome is a verified release that runs in production on Vercel, passes `typecheck`, unit tests, browser tests, build checks, and audit checks, and now includes deterministic suggested solutions, editable fix-plan autofill, Supabase-backed evidence readiness, and a read-only integration-health surface. The engineering log captures the shipped work in sequence, so the repo reads like a proof-backed product build rather than a marketing claim.

## Problem Statement

Build failures are operationally expensive because they interrupt deployment, obscure causality, and require developers to manually sort signal from noise. In practice, the root cause is often buried under follow-up errors, secret values, and environment drift between local, preview, and production contexts.

Existing workflows fail for three reasons:

1. They treat the log as unstructured text instead of a diagnostic input.
2. They do not separate the root cause from downstream noise.
3. They either ignore secret handling or rely on a model without a hard safety boundary.

Build Doctor fixes this by converting raw build output into deterministic evidence. It redacts secrets, maps the failure to a taxonomy, extracts lines and file paths, generates a traceable remediation plan, and exports a report that can be reviewed or shared without re-running the incident.

The encoded data in the system is intentionally simple and auditable:

- failure type
- confidence
- redaction count
- affected subsystem
- likely files
- verification commands
- remaining risks

The audit trail is event-based rather than narrative-based. Every diagnosis produces trace steps, patch guidance, and report metadata that can be verified in tests and preserved in exported markdown.

## System Architecture

### Deterministic Pipeline

The local engine is the source of truth.

1. `redactSecrets()` removes tokens, API keys, database URLs, bearer tokens, and other sensitive values.
2. `parseBuildLog()` classifies the strongest failure signal.
3. The taxonomy layer maps the failure type to a remediation recipe.
4. The report layer turns diagnosis data into a markdown incident report.
5. The suggested-solutions layer generates deterministic remediation options and an editable fix plan.

This keeps the system explainable. Every report section is derived from the same diagnosis object, so the final artifact cannot drift away from the evidence that produced it.

### State Model

Build Doctor behaves like a small state machine:

- intake
- redact
- classify
- extract evidence
- map remediation
- draft patch
- suggest solutions
- optionally enrich
- export report

Terminal states are explicit:

- `READY`
- `FALLBACK`
- `openrouter_success`
- `free_model_rate_limited`
- `free_model_unavailable`
- `llm_json_parse_failed`
- `llm_schema_validation_failed`
- `llm_timeout`
- `llm_error`

Those statuses are important because they prevent provider failure from being mistaken for product failure.

### Provider Boundary

Optional DeepSeek review is intentionally narrow.

- It uses `deepseek/deepseek-v4-flash:free`.
- Paid models are blocked by default.
- `openrouter/free` and `openrouter/auto` are blocked.
- Raw logs are never sent to the provider.
- Secrets are never sent to the provider.
- Plain JSON output is parsed and Zod-validated.
- Invalid output fails closed and does not block deterministic diagnosis.

### Access Control

The app is designed for public demo use with explicit server-side controls:

- read-only `GET /api/integration-health`
- no public write probe route
- Vercel production env vars stored as encrypted project variables
- `.vercelignore` excludes local `.env`, `.omx`, `.next`, `node_modules`, and test artifacts from deployment uploads
- Supabase service-role values remain server-side only

### Report Contract

The exported markdown report is stable and reviewer-friendly:

- Summary
- Root Cause
- Evidence
- Trace
- Patch Draft
- Optional LLM Review
- Verification Commands
- Remaining Risks
- Export Metadata

That contract matters because it creates a predictable artifact for recruiters, hiring managers, and technical reviewers.

## Platform / Infrastructure Specifics

- Platform: Next.js 16 on Vercel
- Runtime model: server-rendered routes and static pages where appropriate
- Deployment target: `https://vercel-build-doctor-agent.vercel.app`
- Database: Supabase Postgres for shared evidence tables
- Provider layer: OpenRouter with DeepSeek free mode
- Environment model: deterministic mode works without provider keys
- Build verification: local build, E2E tests, and audit harnesses all run in the repo

The production deployment is now configured with encrypted Vercel environment variables, so release builds no longer depend on a committed `.env` file.

## Build Log Diary

| # | Issue | Root Cause | Technical Fix | Tries | Impact If Missed |
|---|---|---|---|---|---|
| 1 | DeepSeek free returned rate limits | OpenRouter free model was throttled under live review | Added explicit provider status handling and kept deterministic diagnosis visible | 2 | The app would look broken when the optional review layer was unavailable |
| 2 | Production build failed after Next 16 upgrade | Next expected a proper App Router `not-found` route | Added `src/app/not-found.tsx` so page collection completed cleanly | 1 | Production deploy would stop at build time |
| 3 | Security audit flagged nested PostCSS | Next pulled a vulnerable nested `postcss` version into the tree | Upgraded the dependency chain and verified `npm audit` returned zero vulnerabilities | 2 | The release would carry an avoidable moderate-severity advisory |
| 4 | Public integration-health write probe existed | The route exposed a POST probe that wrote demo rows | Removed POST handlers, cleaned probe rows from Supabase, and kept the endpoint read-only | 1 | Stale evidence and public write behavior would remain in the product |
| 5 | Vercel attempted to upload local env files | Deployment inputs were not excluded explicitly | Added `.vercelignore` and moved runtime secrets into Vercel encrypted env vars | 2 | Local secrets could be uploaded during deployment packaging |
| 6 | Local smoke test hit a stale server | An older process on port 3000 returned misleading errors | Restarted on a clean port and verified the production build against a fresh server | 1 | The release check would be based on a false negative |

## Engineering Principles

1. Deterministic diagnosis must stay ahead of optional AI review. The model can improve explanation, but it cannot redefine the failure.
2. Fail closed on provider uncertainty. Rate limits, invalid JSON, and schema mismatches should return status, not break the workflow.
3. Keep remediation artifacts reusable. Trace steps, patch drafts, suggested solutions, and verification commands should all come from the same diagnosis object.
4. Treat deployment inputs as a security boundary. If a file should not be in production, exclude it explicitly and verify the production environment variables instead.
5. Make the report export the product. The exported incident report is the artifact that proves the workflow worked.

## Forward Look

The production architecture can evolve in several concrete ways:

- stronger access control for evidence persistence and export history
- multi-project or multi-tenant incident isolation
- richer provider routing with cached non-live examples when free models are rate-limited
- PDF or DOCX export for executive review workflows
- broader CI taxonomy coverage for additional build systems and monorepos
- more formal incident history storage with review, compare, and re-run capabilities

## Engineering Log

The canonical proof trail for the shipped work lives here:

- [`ai-engineering/daily-engineering-log.md`](../ai-engineering/daily-engineering-log.md)

That log records the verified sequence of work across:

- Build Doctor UI and report polish
- DeepSeek/OpenRouter guardrails
- deterministic suggested solutions
- Supabase verification and probe cleanup
- Vercel release hardening
- GitHub publication

## Closing Position

Build Doctor demonstrates a specific engineering posture: the system stays useful when the optional model layer fails, it exports a stable incident artifact instead of a transient UI state, and it is backed by tests, audits, deployment evidence, and a running engineering log.
