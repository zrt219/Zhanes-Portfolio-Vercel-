import { Activity, DollarSign, Network, TimerReset } from "lucide-react";
import { providers, routeRequest, runEvalSuite } from "@/lib/gateway";
import { socialLinks } from "@/lib/social";

export default function Page() {
  const routed = routeRequest({ prompt: "Diagnose a failed deployment and choose a fallback provider.", scenario: "primary_outage", policy: "highest_reliability" });
  const evals = runEvalSuite();

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
          <h1 style={{ fontSize: 54, lineHeight: 1, margin: "24px 0 16px" }}>Simulate AI Gateway routing before production scale exists.</h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.65 }}>
            Unified chat endpoint, provider selection, rate-limit and outage fallback, latency/cost dashboard, and request trace viewer.
          </p>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Current Trace</h2>
          <p className="chip">{routed.dashboard.requestId}</p>
          <p className="muted">{routed.response}</p>
          <p className={routed.fallbackUsed ? "chip review" : "chip"}>{routed.fallbackUsed ? "Fallback used" : "Primary route"}</p>
        </div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 20 }}><Network /><h3>Provider</h3><p>{routed.provider.label}</p><p className="muted">Selected under outage policy.</p></div>
        <div className="panel" style={{ padding: 20 }}><TimerReset /><h3>Latency</h3><p style={{ fontSize: 34, margin: 0 }}>{routed.dashboard.latencyMs}ms</p></div>
        <div className="panel" style={{ padding: 20 }}><DollarSign /><h3>Cost</h3><p style={{ fontSize: 34, margin: 0 }}>${routed.dashboard.costUsd.toFixed(3)}</p></div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 16 }}>
        <h2>Provider Adapter Mocks</h2>
        <div className="grid three">
          {providers.map((provider) => (
            <div key={provider.id} style={{ border: "1px solid #31445b", borderRadius: 8, padding: 14, background: "rgba(0,0,0,.24)" }}>
              <strong>{provider.label}</strong>
              <p className="muted">Reliability {Math.round(provider.reliability * 1000) / 10}%</p>
              <p className="muted">{provider.latencyMs}ms | ${provider.costUsd.toFixed(3)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="panel" style={{ padding: 24 }}>
          <h2><Activity size={22} /> Request Trace</h2>
          {routed.trace.map((event) => (
            <p key={event.step} className={event.status === "REVIEW" ? "chip review" : "chip"} style={{ marginRight: 8 }}>{event.step}: {event.status}</p>
          ))}
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <h2>Eval Results</h2>
          <p style={{ fontSize: 36, margin: 0 }}>{evals.score}%</p>
          <p className="muted">{evals.passed}/{evals.total} routing fixtures passed.</p>
        </div>
      </section>
    </main>
  );
}
