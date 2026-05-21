# Resume Evidence RAG Auditor

Resume Evidence RAG Auditor is a Vercel-deployable Next.js case study for RAG-style evidence matching, claim verification, and grounded resume bullet generation.

## What It Proves

- RAG/context workflow design
- Job-description matching
- Evidence-backed claim verification
- Unverified-claim flagging
- Eval and QA discipline

## Routes

- `/` product UI
- `/api/audit` POST job description and claims to structured audit JSON
- `/api/report` POST job description and claims to markdown audit report
- `/api/eval` GET deterministic eval results

## Demo Mode

The MVP uses JSON mock retrieval. It does not claim live pgvector or production user data.

## Local Development

```powershell
npm install
npm run test
npm run build
npm run dev
```

## Social Links

- Beacons: https://beacons.ai/zrt_219
- Handle: https://x.com/zrt_219
- Kick: https://kick.com/zrt-219
- LinkedIn: https://www.linkedin.com/in/zhane-grey-987258395
- Substack: https://substack.com/@zrt1

## Resume Bullet

- Built Resume Evidence RAG Auditor, a Next.js/Vercel case-study app that retrieves project evidence from local fixtures, verifies resume claims against job descriptions, flags unsupported claims, generates grounded bullets, and exposes an eval harness.
