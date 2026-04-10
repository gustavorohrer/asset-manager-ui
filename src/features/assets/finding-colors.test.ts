import { describe, expect, it } from "vitest";
import {
  getFindingStateChipStyle,
  getFindingTabStyle,
  getThreatChipStyle,
  getThreatColor,
  getThreatFilterActiveStyle,
  getVulnerabilityChipStyle,
  getVulnerabilityColor,
  getVulnerabilityFilterActiveStyle,
  mapRiskLevelToSeverity,
} from "./finding-colors";

describe("finding-colors", () => {
  it("maps HIGH threat risk to CRITICAL severity and shares the same color token", () => {
    expect(mapRiskLevelToSeverity("HIGH")).toBe("CRITICAL");
    expect(getThreatColor("HIGH")).toBe(getVulnerabilityColor("CRITICAL"));
  });

  it("returns the same chip style for threat HIGH and vulnerability CRITICAL", () => {
    expect(getThreatChipStyle("HIGH")).toEqual(
      getVulnerabilityChipStyle("CRITICAL"),
    );
  });

  it("returns active filter styles with contrast-aware text color", () => {
    expect(getThreatFilterActiveStyle("MEDIUM")).toEqual({
      backgroundColor: getThreatColor("MEDIUM"),
      color: "#000000",
    });

    expect(getVulnerabilityFilterActiveStyle("LOW")).toEqual({
      backgroundColor: getVulnerabilityColor("LOW"),
      color: "#ffffff",
    });
  });

  it("returns neutral state styles for healthy and unknown", () => {
    expect(getFindingStateChipStyle("HEALTHY")).toEqual({
      color: "var(--muted-foreground)",
      borderColor: "var(--border)",
      backgroundColor: "var(--background)",
    });

    expect(getFindingStateChipStyle("UNKNOWN")).toEqual({
      color: "var(--muted-foreground)",
      borderColor: "var(--border)",
      backgroundColor: "var(--muted)",
    });
  });

  it("returns deterministic tab styles for active and inactive states", () => {
    expect(getFindingTabStyle(true, "#e84749")).toEqual({
      color: "#000000",
      borderBottomColor: "#e84749",
      borderBottomWidth: "3px",
      boxShadow: "inset 0 -1px 0 #e84749",
      backgroundColor: "#e84749",
      fontWeight: 600,
    });

    expect(getFindingTabStyle(false, "#e84749")).toEqual({
      color: "var(--muted-foreground)",
      borderBottomColor: "transparent",
      borderBottomWidth: "2px",
      boxShadow: "none",
      backgroundColor: "transparent",
      fontWeight: 500,
    });
  });
});
