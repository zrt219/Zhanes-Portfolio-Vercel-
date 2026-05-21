import { describe, expect, it } from "vitest";
import { routeRequest, runEvalSuite } from "@/lib/gateway";

describe("AI Gateway Failover Playground", () => {
  it("routes normal balanced requests without fallback", () => {
    const result = routeRequest({ prompt: "hello", scenario: "normal", policy: "balanced" });
    expect(result.fallbackUsed).toBe(false);
    expect(result.provider.id).toBe("primary-large");
  });

  it("uses fallback during primary outage", () => {
    const result = routeRequest({ prompt: "hello", scenario: "primary_outage", policy: "highest_reliability" });
    expect(result.fallbackUsed).toBe(true);
    expect(result.provider.id).not.toBe("primary-large");
  });

  it("uses the lowest-cost provider under cost guardrail", () => {
    const result = routeRequest({ prompt: "hello", scenario: "cost_guardrail", policy: "lowest_cost" });
    expect(result.provider.id).toBe("fast-small");
  });

  it("passes eval fixtures", () => {
    expect(runEvalSuite().score).toBe(100);
  });
});
