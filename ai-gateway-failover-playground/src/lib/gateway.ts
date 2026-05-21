import { z } from "zod";

export const chatRequestSchema = z.object({
  prompt: z.string().min(3).max(4000).default("Summarize the deployment failure and choose the lowest-risk provider."),
  scenario: z.enum(["normal", "primary_outage", "rate_limited", "cost_guardrail"]).default("normal"),
  policy: z.enum(["balanced", "lowest_latency", "lowest_cost", "highest_reliability"]).default("balanced"),
  maxLatencyMs: z.number().int().positive().max(5000).default(900),
  maxCostUsd: z.number().positive().max(1).default(0.02),
});

export type ChatRequest = z.input<typeof chatRequestSchema>;

export const providers = [
  { id: "primary-large", label: "Primary Large", reliability: 0.99, latencyMs: 820, costUsd: 0.012, quality: 0.94, region: "iad1" },
  { id: "fast-small", label: "Fast Small", reliability: 0.96, latencyMs: 260, costUsd: 0.003, quality: 0.78, region: "cle1" },
  { id: "backup-balanced", label: "Backup Balanced", reliability: 0.985, latencyMs: 540, costUsd: 0.007, quality: 0.88, region: "sfo1" },
];

export const circuitBreakers = [
  { id: "primary_outage", providerId: "primary-large", reason: "Synthetic outage event", state: "OPEN" },
  { id: "rate_limited", providerId: "fast-small", reason: "Synthetic 429 rate-limit event", state: "OPEN" },
];

function unavailableProvider(scenario: z.infer<typeof chatRequestSchema>["scenario"]) {
  if (scenario === "primary_outage") return "primary-large";
  if (scenario === "rate_limited") return "fast-small";
  return "";
}

export function routeRequest(input: ChatRequest) {
  const config = chatRequestSchema.parse(input);
  const unavailable = unavailableProvider(config.scenario);
  const candidates = providers
    .filter((provider) => provider.id !== unavailable)
    .filter((provider) => provider.latencyMs <= config.maxLatencyMs)
    .filter((provider) => provider.costUsd <= config.maxCostUsd);
  const fallbackCandidates = providers.filter((provider) => provider.id !== unavailable);
  const pool = candidates.length ? candidates : fallbackCandidates;
  const ordered = [...pool].sort((a, b) => {
    if (config.scenario === "cost_guardrail" || config.policy === "lowest_cost") return a.costUsd - b.costUsd;
    if (config.policy === "lowest_latency") return a.latencyMs - b.latencyMs;
    if (config.policy === "highest_reliability") return b.reliability - a.reliability;
    return b.quality + b.reliability - (a.quality + a.reliability);
  });
  const selected = ordered[0] ?? providers[0];
  const fallbackUsed = unavailable.length > 0 || config.scenario === "cost_guardrail" || candidates.length === 0;
  const budgetStatus = selected.costUsd <= config.maxCostUsd ? "PASS" : "REVIEW";
  const latencyStatus = selected.latencyMs <= config.maxLatencyMs ? "PASS" : "REVIEW";
  const trace = [
    { step: "request_received", status: "PASS", detail: "Prompt accepted by unified /api/chat endpoint." },
    { step: "policy_eval", status: "PASS", detail: `Routing policy: ${config.policy}; scenario: ${config.scenario}.` },
    ...(unavailable ? [{ step: "provider_health", status: "REVIEW", detail: `${unavailable} unavailable; fallback pool activated.` }] : []),
    { step: "latency_budget", status: latencyStatus, detail: `${selected.latencyMs}ms selected against ${config.maxLatencyMs}ms budget.` },
    { step: "cost_budget", status: budgetStatus, detail: `$${selected.costUsd.toFixed(3)} selected against $${config.maxCostUsd.toFixed(3)} budget.` },
    { step: "provider_selected", status: "PASS", detail: `${selected.label} selected.` },
    { step: "cost_latency_recorded", status: "PASS", detail: `$${selected.costUsd.toFixed(3)} estimated; ${selected.latencyMs}ms simulated latency.` },
  ];

  return {
    mode: "DEMO PROVIDER MOCKS",
    provider: selected,
    fallbackUsed,
    response: `Simulated response from ${selected.label}: route chosen for ${config.policy} under ${config.scenario}.`,
    trace,
    dashboard: {
      latencyMs: selected.latencyMs,
      costUsd: selected.costUsd,
      reliability: selected.reliability,
      requestId: `trace_${config.scenario}_${config.policy}`,
      budgetStatus,
      latencyStatus,
      fallbackPoolSize: pool.length,
    },
    readiness: {
      status: budgetStatus === "PASS" && latencyStatus === "PASS" ? "READY" : "REVIEW",
      reasons: [
        ...(budgetStatus === "PASS" ? [] : ["Selected fallback exceeds configured cost budget."]),
        ...(latencyStatus === "PASS" ? [] : ["Selected fallback exceeds configured latency budget."]),
      ],
    },
    safetyNotes: [
      "No real provider API keys are used.",
      "Provider adapter behavior is deterministic.",
      "Fallback decisions are auditable in the request trace.",
    ],
  };
}

export const evalFixtures: ChatRequest[] = [
  { prompt: "normal request", scenario: "normal", policy: "balanced", maxLatencyMs: 900, maxCostUsd: 0.02 },
  { prompt: "primary outage request", scenario: "primary_outage", policy: "highest_reliability", maxLatencyMs: 900, maxCostUsd: 0.02 },
  { prompt: "rate limit request", scenario: "rate_limited", policy: "lowest_latency", maxLatencyMs: 900, maxCostUsd: 0.02 },
  { prompt: "cost guardrail request", scenario: "cost_guardrail", policy: "lowest_cost", maxLatencyMs: 900, maxCostUsd: 0.005 },
  { prompt: "tight latency budget", scenario: "primary_outage", policy: "lowest_latency", maxLatencyMs: 300, maxCostUsd: 0.02 },
];

export function runEvalSuite() {
  const cases = evalFixtures.map((fixture) => {
    const routed = routeRequest(fixture);
    const pass =
      fixture.scenario === "normal"
        ? !routed.fallbackUsed
        : routed.fallbackUsed && routed.trace.some((item) => item.step === "provider_selected");
    return {
      id: `${fixture.scenario}-${fixture.policy}`,
      result: pass ? "PASS" : "FAIL",
      selectedProvider: routed.provider.id,
      latencyMs: routed.dashboard.latencyMs,
      costUsd: routed.dashboard.costUsd,
    };
  });
  const passed = cases.filter((item) => item.result === "PASS").length;
  return { total: cases.length, passed, failed: cases.length - passed, score: Math.round((passed / cases.length) * 100), cases };
}
