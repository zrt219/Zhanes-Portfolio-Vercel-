import { z } from "zod";

export const chatRequestSchema = z.object({
  prompt: z.string().min(3).default("Summarize the deployment failure and choose the lowest-risk provider."),
  scenario: z.enum(["normal", "primary_outage", "rate_limited", "cost_guardrail"]).default("normal"),
  policy: z.enum(["balanced", "lowest_latency", "lowest_cost", "highest_reliability"]).default("balanced"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const providers = [
  { id: "primary-large", label: "Primary Large", reliability: 0.99, latencyMs: 820, costUsd: 0.012, quality: 0.94 },
  { id: "fast-small", label: "Fast Small", reliability: 0.96, latencyMs: 260, costUsd: 0.003, quality: 0.78 },
  { id: "backup-balanced", label: "Backup Balanced", reliability: 0.985, latencyMs: 540, costUsd: 0.007, quality: 0.88 },
];

function unavailableProvider(scenario: ChatRequest["scenario"]) {
  if (scenario === "primary_outage") return "primary-large";
  if (scenario === "rate_limited") return "fast-small";
  return "";
}

export function routeRequest(input: ChatRequest) {
  const unavailable = unavailableProvider(input.scenario);
  const candidates = providers.filter((provider) => provider.id !== unavailable);
  const ordered = [...candidates].sort((a, b) => {
    if (input.scenario === "cost_guardrail" || input.policy === "lowest_cost") return a.costUsd - b.costUsd;
    if (input.policy === "lowest_latency") return a.latencyMs - b.latencyMs;
    if (input.policy === "highest_reliability") return b.reliability - a.reliability;
    return b.quality + b.reliability - (a.quality + a.reliability);
  });
  const selected = ordered[0] ?? providers[0];
  const fallbackUsed = unavailable.length > 0 || input.scenario === "cost_guardrail";
  const trace = [
    { step: "request_received", status: "PASS", detail: "Prompt accepted by unified /api/chat endpoint." },
    { step: "policy_eval", status: "PASS", detail: `Routing policy: ${input.policy}; scenario: ${input.scenario}.` },
    ...(unavailable ? [{ step: "provider_health", status: "REVIEW", detail: `${unavailable} unavailable; fallback pool activated.` }] : []),
    { step: "provider_selected", status: "PASS", detail: `${selected.label} selected.` },
    { step: "cost_latency_recorded", status: "PASS", detail: `$${selected.costUsd.toFixed(3)} estimated; ${selected.latencyMs}ms simulated latency.` },
  ];

  return {
    mode: "DEMO PROVIDER MOCKS",
    provider: selected,
    fallbackUsed,
    response: `Simulated response from ${selected.label}: route chosen for ${input.policy} under ${input.scenario}.`,
    trace,
    dashboard: {
      latencyMs: selected.latencyMs,
      costUsd: selected.costUsd,
      reliability: selected.reliability,
      requestId: `trace_${input.scenario}_${input.policy}`,
    },
    safetyNotes: [
      "No real provider API keys are used.",
      "Provider adapter behavior is deterministic.",
      "Fallback decisions are auditable in the request trace.",
    ],
  };
}

export const evalFixtures: ChatRequest[] = [
  { prompt: "normal request", scenario: "normal", policy: "balanced" },
  { prompt: "primary outage request", scenario: "primary_outage", policy: "highest_reliability" },
  { prompt: "rate limit request", scenario: "rate_limited", policy: "lowest_latency" },
  { prompt: "cost guardrail request", scenario: "cost_guardrail", policy: "lowest_cost" },
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
