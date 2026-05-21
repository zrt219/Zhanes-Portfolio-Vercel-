import { z } from "zod";

export const failureTypeSchema = z.enum([
  "MISSING_ENV_VAR",
  "TYPESCRIPT_ERROR",
  "MODULE_NOT_FOUND",
  "NEXT_BUILD_ERROR",
  "PACKAGE_INSTALL_ERROR",
  "PRISMA_DATABASE_ERROR",
  "SUPABASE_CONFIG_ERROR",
  "STRIPE_WEBHOOK_ERROR",
  "VERCEL_RUNTIME_ERROR",
  "OUT_OF_MEMORY",
  "UNKNOWN",
]);

export type FailureType = z.infer<typeof failureTypeSchema>;

export const taxonomyEntrySchema = z.object({
  id: failureTypeSchema,
  label: z.string(),
  description: z.string(),
  symptoms: z.array(z.string()),
  likelyCauses: z.array(z.string()),
  fixSteps: z.array(z.string()),
  verificationCommands: z.array(z.string()),
  preventionChecks: z.array(z.string()),
});

export const evidenceLineSchema = z.object({
  lineNumber: z.number(),
  kind: z.enum(["error", "warning", "stack", "file", "info"]),
  content: z.string(),
});

export const diagnosisSchema = z.object({
  failureType: failureTypeSchema,
  label: z.string(),
  confidence: z.number().min(0).max(1),
  affectedSubsystem: z.string(),
  probableRootCause: z.string(),
  evidence: z.array(evidenceLineSchema),
  affectedFiles: z.array(z.string()),
  warnings: z.array(z.string()),
  fixPlan: z.array(z.string()),
  patchChecklist: z.array(z.string()),
  verificationCommands: z.array(z.string()),
  preventionChecklist: z.array(z.string()),
  readinessReport: z.object({
    status: z.enum(["READY_AFTER_FIX", "NEEDS_REVIEW", "BLOCKED"]),
    summary: z.string(),
    remainingRisks: z.array(z.string()),
  }),
  redactedLog: z.string(),
  redactions: z.array(z.string()),
  generatedAt: z.string(),
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type EvidenceLine = z.infer<typeof evidenceLineSchema>;

export const diagnoseRequestSchema = z.object({
  log: z.string().min(1),
  sampleId: z.string().optional(),
});

export const reportRequestSchema = z.object({
  diagnosis: diagnosisSchema,
});

export const evalCaseResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  expected: failureTypeSchema,
  actual: failureTypeSchema,
  result: z.enum(["PASS", "PARTIAL", "FAIL"]),
  notes: z.array(z.string()),
});

export const evalResultsSchema = z.object({
  total: z.number(),
  passed: z.number(),
  partial: z.number(),
  failed: z.number(),
  score: z.number(),
  cases: z.array(evalCaseResultSchema),
});

export type EvalResults = z.infer<typeof evalResultsSchema>;
