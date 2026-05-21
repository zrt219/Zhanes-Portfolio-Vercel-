## 2026-05-20 — Verified Engineering Work

- Built/changed: Built the Vercel Build Doctor Agent MVP as a Next.js/TypeScript case-study app with deterministic log diagnosis, secret redaction, structured APIs, eval fixtures, and recruiter-facing UI.
- Systems involved: Next.js App Router, TypeScript, Tailwind CSS, Zod schemas, deterministic parser, Vercel deployment configuration, Vitest eval/test harness.
- Technical skills demonstrated: agentic workflow design, failure taxonomy modeling, log parsing, structured JSON outputs, redaction safety, developer-tool UX, eval design, deployment readiness packaging.
- Verification performed: `npm install`, `npm run test` (4/4 passing), `npm run typecheck`, `npm run build`, local HTTP smoke tests for `/`, `/case-study`, `/api/eval`, `/api/diagnose`, Browser workflow check for diagnosis/report/case-study visibility, Vercel production deploy, and deployed smoke checks for `/`, `/case-study`, and `/api/eval`.
- Evidence/files: `src/lib/build-doctor.ts`, `src/lib/log-parser.ts`, `src/lib/redact-secrets.ts`, `src/app/api/diagnose/route.ts`, `src/app/api/report/route.ts`, `src/app/api/eval/route.ts`, `src/app/page.tsx`, `src/app/case-study/page.tsx`, `README.md`, production URL `https://vercel-build-doctor-agent.vercel.app`.
- Resume-safe bullet: Built Vercel Build Doctor Agent, a Next.js/TypeScript AI debugging assistant that ingests failed build logs, classifies deployment failures, redacts secrets, generates structured root-cause reports, and includes an eval harness for diagnosis accuracy and safety.
