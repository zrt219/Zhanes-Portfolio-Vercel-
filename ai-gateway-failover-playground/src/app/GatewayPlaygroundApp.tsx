"use client";

import { useMemo, useState } from "react";
import { circuitBreakers, providers, routeRequest, type ChatRequest } from "@/lib/gateway";
import { socialLinks } from "@/lib/social";

export function GatewayPlaygroundApp() {
  const [scenario, setScenario] = useState<ChatRequest["scenario"]>("primary_outage");
  const [policy, setPolicy] = useState<ChatRequest["policy"]>("highest_reliability");
  const [maxLatencyMs, setMaxLatencyMs] = useState(900);
  const [maxCostUsd, setMaxCostUsd] = useState(0.02);
  const routed = useMemo(
    () => routeRequest({ prompt: "Route this request through a deterministic provider policy.", scenario, policy, maxLatencyMs, maxCostUsd }),
    [scenario, policy, maxLatencyMs, maxCostUsd],
  );

  return (
    <main className="shell">
      <header className="panel" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="muted mono" style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" }}>ZRT Platform AI Infra Lab</div>
          <strong>AI Gateway Failover Playground</strong>
        </div>
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-label="ZRT social links">
          {socialLinks.map((link) => <a key={link.href} className="chip" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
        </nav>
      </header>

      <section className="grid two" style={{ marginTop: 24 }}>
        <div className="panel" style={{ padding: 28 }}>
          <span className="chip review">DEMO PROVIDER MOCKS</span>
          <h1 style={{ fontSize: 48, lineHeight: 1, margin: "24px 0 16px" }}>Exercise provider routing, fallback, and budgets before production scale exists.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>Interactive controls for routing policy, outage simulation, latency budget, cost budget, trace review, and readiness state.</p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Selected Route</h2>
          <p className={routed.readiness.status === "READY" ? "chip" : "chip review"}>{routed.readiness.status}</p>
          <p style={{ fontSize: 36, margin: "12px 0" }}>{routed.provider.label}</p>
          <p className="muted">{routed.dashboard.latencyMs}ms | ${routed.dashboard.costUsd.toFixed(3)} | {routed.provider.region}</p>
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Routing Controls</h2>
          <label>Scenario<select value={scenario} onChange={(event) => setScenario(event.target.value as ChatRequest["scenario"])} style={{ width: "100%", marginTop: 8, padding: 10 }}><option value="normal">normal</option><option value="primary_outage">primary_outage</option><option value="rate_limited">rate_limited</option><option value="cost_guardrail">cost_guardrail</option></select></label>
          <label>Policy<select value={policy} onChange={(event) => setPolicy(event.target.value as ChatRequest["policy"])} style={{ width: "100%", marginTop: 8, padding: 10 }}><option value="balanced">balanced</option><option value="lowest_latency">lowest_latency</option><option value="lowest_cost">lowest_cost</option><option value="highest_reliability">highest_reliability</option></select></label>
          <label>Max latency ms<input type="number" value={maxLatencyMs} onChange={(event) => setMaxLatencyMs(Number(event.target.value))} style={{ width: "100%", marginTop: 8, padding: 10 }} /></label>
          <label>Max cost USD<input type="number" step="0.001" value={maxCostUsd} onChange={(event) => setMaxCostUsd(Number(event.target.value))} style={{ width: "100%", marginTop: 8, padding: 10 }} /></label>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Circuit Breakers</h2>
          {circuitBreakers.map((breaker) => <p key={breaker.id} className="chip review" style={{ marginRight: 8 }}>{breaker.providerId}: {breaker.state}</p>)}
          <h2>Provider Pool</h2>
          {providers.map((provider) => <p key={provider.id} className="muted">{provider.label}: {provider.latencyMs}ms, ${provider.costUsd.toFixed(3)}, reliability {Math.round(provider.reliability * 1000) / 10}%</p>)}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Request Trace Viewer</h2>
        {routed.trace.map((event) => (
          <div key={event.step} style={{ border: "1px solid #31445b", borderRadius: 8, padding: 12, marginBottom: 10, background: "rgba(0,0,0,.24)" }}>
            <p className={event.status === "PASS" ? "chip" : "chip review"}>{event.step}: {event.status}</p>
            <p className="muted">{event.detail}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
