import type { RiskLevel } from "@/domain/threats";
import type { VulnerabilitySeverity } from "@/domain/vulnerabilities";

export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type FindingState = "HEALTHY" | "UNKNOWN";

const CHIP_ALPHA_SUFFIX = "1A";
const TAB_ALPHA_SUFFIX = "14";
const FILTER_ACTIVE_TEXT_COLOR = "#ffffff";

const FINDING_SEVERITY_COLORS: Record<FindingSeverity, string> = {
  CRITICAL: "#e84749",
  HIGH: "#f56a00",
  MEDIUM: "#d89614",
  LOW: "#595959",
};

const FINDING_STATE_CHIP_STYLES = {
  HEALTHY: {
    color: "var(--muted-foreground)",
    borderColor: "var(--border)",
    backgroundColor: "var(--background)",
  },
  UNKNOWN: {
    color: "var(--muted-foreground)",
    borderColor: "var(--border)",
    backgroundColor: "var(--muted)",
  },
} as const satisfies Record<
  FindingState,
  {
    color: string;
    borderColor: string;
    backgroundColor: string;
  }
>;

const withAlpha = (hexColor: string, alphaSuffix: string): string =>
  `${hexColor}${alphaSuffix}`;

export const mapRiskLevelToSeverity = (
  riskLevel: RiskLevel,
): FindingSeverity => {
  if (riskLevel === "HIGH") {
    return "CRITICAL";
  }

  return riskLevel;
};

export const getSeverityColor = (severity: FindingSeverity): string =>
  FINDING_SEVERITY_COLORS[severity];

export const getThreatColor = (riskLevel: RiskLevel): string =>
  getSeverityColor(mapRiskLevelToSeverity(riskLevel));

export const getVulnerabilityColor = (
  severity: VulnerabilitySeverity,
): string => getSeverityColor(severity);

export const getSeverityChipStyle = (severity: FindingSeverity) => {
  const color = getSeverityColor(severity);

  return {
    color,
    borderColor: color,
    backgroundColor: withAlpha(color, CHIP_ALPHA_SUFFIX),
  } as const;
};

export const getThreatChipStyle = (riskLevel: RiskLevel) =>
  getSeverityChipStyle(mapRiskLevelToSeverity(riskLevel));

export const getVulnerabilityChipStyle = (severity: VulnerabilitySeverity) =>
  getSeverityChipStyle(severity);

export const getFindingStateChipStyle = (state: FindingState) =>
  FINDING_STATE_CHIP_STYLES[state];

export const getSeverityFilterActiveStyle = (severity: FindingSeverity) =>
  ({
    backgroundColor: getSeverityColor(severity),
    color: FILTER_ACTIVE_TEXT_COLOR,
  }) as const;

export const getThreatFilterActiveStyle = (riskLevel: RiskLevel) =>
  getSeverityFilterActiveStyle(mapRiskLevelToSeverity(riskLevel));

export const getVulnerabilityFilterActiveStyle = (
  severity: VulnerabilitySeverity,
) => getSeverityFilterActiveStyle(severity);

export const getFindingTabStyle = (isActive: boolean, color: string) => ({
  color,
  borderBottomColor: isActive ? color : "transparent",
  borderBottomWidth: isActive ? "3px" : "2px",
  boxShadow: isActive ? `inset 0 -1px 0 ${color}` : "none",
  backgroundColor: isActive
    ? withAlpha(color, TAB_ALPHA_SUFFIX)
    : "transparent",
  fontWeight: isActive ? 600 : 500,
});

export const THREAT_COLOR = getThreatColor("HIGH");
export const VULNERABILITY_COLOR = getVulnerabilityColor("MEDIUM");

export const THREAT_CHIP_STYLE = getThreatChipStyle("HIGH");
export const VULNERABILITY_CHIP_STYLE = getVulnerabilityChipStyle("MEDIUM");

export const HEALTHY_CHIP_STYLE = getFindingStateChipStyle("HEALTHY");
export const UNKNOWN_CHIP_STYLE = getFindingStateChipStyle("UNKNOWN");
