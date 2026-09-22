import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { calculateTiltAngles, calculateGlarePosition } from "../components/motion/use3DTilt";
import { TiltCard } from "../components/motion/TiltCard";
import { NeonBorderGlow } from "../components/motion/NeonBorderGlow";
import { SpringButton } from "../components/motion/SpringButton";

describe("3D Tilt Dynamics & Calculations (Feature F5)", () => {
  it("calculates neutral 0 rotation when cursor is centered (0, 0)", () => {
    const { rotateX, rotateY } = calculateTiltAngles(0, 0, 8);
    expect(rotateX).toBe(0);
    expect(rotateY).toBe(0);
  });

  it("calculates proper pitch and yaw angles at boundaries", () => {
    // Top-left (-0.5, -0.5): top tilts back (rotateX = +maxTilt), left tilts back (rotateY = -maxTilt)
    const topLeft = calculateTiltAngles(-0.5, -0.5, 10);
    expect(topLeft.rotateX).toBe(10);
    expect(topLeft.rotateY).toBe(-10);

    // Bottom-right (0.5, 0.5): bottom tilts back (rotateX = -maxTilt), right tilts back (rotateY = +maxTilt)
    const bottomRight = calculateTiltAngles(0.5, 0.5, 10);
    expect(bottomRight.rotateX).toBe(-10);
    expect(bottomRight.rotateY).toBe(10);

    // Top-right (0.5, -0.5)
    const topRight = calculateTiltAngles(0.5, -0.5, 8);
    expect(topRight.rotateX).toBe(8);
    expect(topRight.rotateY).toBe(8);
  });

  it("clamps rotation within [-maxTilt, maxTilt] when cursor exceeds bounds", () => {
    const extreme = calculateTiltAngles(1.5, -2.0, 8);
    expect(extreme.rotateX).toBe(8);
    expect(extreme.rotateY).toBe(8);
  });

  it("completely bypasses 3D tilt when reduced motion is requested", () => {
    const reducedTilt = calculateTiltAngles(0.5, 0.5, 12, true);
    expect(reducedTilt.rotateX).toBe(0);
    expect(reducedTilt.rotateY).toBe(0);
  });

  it("calculates specular glare coordinates as percentage strings", () => {
    const centeredGlare = calculateGlarePosition(0, 0, true, 0.18, false);
    expect(centeredGlare.glareX).toBe("50%");
    expect(centeredGlare.glareY).toBe("50%");
    expect(centeredGlare.glareOpacity).toBe(0.18);

    const cornerGlare = calculateGlarePosition(-0.5, -0.5, true, 0.2, false);
    expect(cornerGlare.glareX).toBe("0%");
    expect(cornerGlare.glareY).toBe("0%");
    expect(cornerGlare.glareOpacity).toBe(0.2);
  });

  it("sets glare opacity to 0 when not hovered or when reduced motion is active", () => {
    const unhovered = calculateGlarePosition(0.3, 0.3, false, 0.15, false);
    expect(unhovered.glareOpacity).toBe(0);

    const reduced = calculateGlarePosition(0.3, 0.3, true, 0.15, true);
    expect(reduced.glareOpacity).toBe(0);
  });
});

describe("TiltCard Component (Feature F5)", () => {
  it("renders children cleanly into the DOM", () => {
    const html = renderToString(
      React.createElement(
        TiltCard,
        { className: "test-card", maxTilt: 6 },
        React.createElement("span", null, "Card Content")
      )
    );
    expect(html).toContain("Card Content");
    expect(html).toContain("test-card");
  });

  it("encapsulates perspective and 3D transform container", () => {
    const html = renderToString(
      React.createElement(
        TiltCard,
        { maxTilt: 8 },
        React.createElement("p", null, "Telemetry Card")
      )
    );
    expect(html).toContain("[perspective:1000px]");
    expect(html).toContain("transform-gpu");
  });

  it("enforces pointer-events: none and overflow-hidden on glare overlay invariant", () => {
    const html = renderToString(
      React.createElement(
        TiltCard,
        { glare: true },
        React.createElement("button", null, "Click Target")
      )
    );
    // Must contain pointer-events-none and overflow-hidden to ensure clicks and selection are never blocked
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("overflow-hidden");
    expect(html).toContain('aria-hidden="true"');
  });

  it("supports rendering as a native button element when as='button'", () => {
    const html = renderToString(
      React.createElement(
        TiltCard,
        { as: "button", role: "button", "aria-pressed": true },
        "Interactive Card Button"
      )
    );
    expect(html).toContain("<button");
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Interactive Card Button");
  });
});

describe("NeonBorderGlow Component (Feature F6)", () => {
  it("renders children and encapsulates relative wrapper", () => {
    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { className: "custom-wrapper" },
        React.createElement("div", null, "Neon Inner")
      )
    );
    expect(html).toContain("Neon Inner");
    expect(html).toContain("custom-wrapper");
    expect(html).toContain("group relative");
  });

  it("strictly enforces pointer-events: none on glow aura overlays", () => {
    const html = renderToString(
      React.createElement(
        NeonBorderGlow,
        { active: true, color: "cyan" },
        React.createElement("button", null, "Action")
      )
    );
    expect(html).toContain("pointer-events-none");
    expect(html).toContain('aria-hidden="true"');
  });

  it("supports cyan, emerald, and gold neon glow palettes", () => {
    const cyanHtml = renderToString(
      React.createElement(NeonBorderGlow, { color: "cyan" }, "Cyan Content")
    );
    expect(cyanHtml).toContain("109, 216, 255");

    const emeraldHtml = renderToString(
      React.createElement(NeonBorderGlow, { color: "emerald" }, "Emerald Content")
    );
    expect(emeraldHtml).toContain("52, 211, 153");

    const goldHtml = renderToString(
      React.createElement(NeonBorderGlow, { color: "gold" }, "Gold Content")
    );
    expect(goldHtml).toContain("214, 170, 82");
  });
});

describe("SpringButton Component (Feature F6)", () => {
  it("renders button with children and standard button attributes", () => {
    const html = renderToString(
      React.createElement(
        SpringButton,
        { className: "px-4 py-2 bg-cyan", type: "button", "aria-label": "Submit" },
        "Confirm Fix"
      )
    );
    expect(html).toContain("<button");
    expect(html).toContain("Confirm Fix");
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Submit"');
    expect(html).toContain("px-4 py-2 bg-cyan");
  });
});
