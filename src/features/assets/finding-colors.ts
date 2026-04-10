import type { RiskLevel } from "@/domain/threats";
import type { VulnerabilitySeverity } from "@/domain/vulnerabilities";

export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type FindingState = "HEALTHY" | "UNKNOWN";

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#000000";

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

const hexToRgb = (hexColor: string): [number, number, number] => {
  const normalized = hexColor.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return [red, green, blue];
};

const srgbToLinear = (value: number): number => {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = (hexColor: string): number => {
  const [red, green, blue] = hexToRgb(hexColor);
  const linearRed = srgbToLinear(red);
  const linearGreen = srgbToLinear(green);
  const linearBlue = srgbToLinear(blue);

  return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
};

const getContrastRatio = (
  backgroundColor: string,
  textColor: string,
): number => {
  const backgroundLuminance = getRelativeLuminance(backgroundColor);
  const textLuminance = getRelativeLuminance(textColor);
  const lighter = Math.max(backgroundLuminance, textLuminance);
  const darker = Math.min(backgroundLuminance, textLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const getReadableTextColor = (backgroundColor: string): string => {
  const contrastWithLight = getContrastRatio(backgroundColor, LIGHT_TEXT);
  const contrastWithDark = getContrastRatio(backgroundColor, DARK_TEXT);
  return contrastWithDark >= contrastWithLight ? DARK_TEXT : LIGHT_TEXT;
};

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
  const backgroundColor = getSeverityColor(severity);
  const textColor = getReadableTextColor(backgroundColor);

  return {
    color: textColor,
    borderColor: backgroundColor,
    backgroundColor,
  } as const;
};

export const getThreatChipStyle = (riskLevel: RiskLevel) =>
  getSeverityChipStyle(mapRiskLevelToSeverity(riskLevel));

export const getVulnerabilityChipStyle = (severity: VulnerabilitySeverity) =>
  getSeverityChipStyle(severity);

export const getFindingStateChipStyle = (state: FindingState) =>
  FINDING_STATE_CHIP_STYLES[state];

export const getSeverityFilterActiveStyle = (severity: FindingSeverity) =>
  (() => {
    const backgroundColor = getSeverityColor(severity);
    return {
      backgroundColor,
      color: getReadableTextColor(backgroundColor),
    } as const;
  })();

export const getThreatFilterActiveStyle = (riskLevel: RiskLevel) =>
  getSeverityFilterActiveStyle(mapRiskLevelToSeverity(riskLevel));

export const getVulnerabilityFilterActiveStyle = (
  severity: VulnerabilitySeverity,
) => getSeverityFilterActiveStyle(severity);

export const getFindingTabStyle = (isActive: boolean, color: string) => ({
  color: isActive ? getReadableTextColor(color) : "var(--muted-foreground)",
  borderBottomColor: isActive ? color : "transparent",
  borderBottomWidth: isActive ? "3px" : "2px",
  boxShadow: isActive ? `inset 0 -1px 0 ${color}` : "none",
  backgroundColor: isActive ? color : "transparent",
  fontWeight: isActive ? 600 : 500,
});

export const THREAT_COLOR = getThreatColor("HIGH");
export const VULNERABILITY_COLOR = getVulnerabilityColor("MEDIUM");

export const THREAT_CHIP_STYLE = getThreatChipStyle("HIGH");
export const VULNERABILITY_CHIP_STYLE = getVulnerabilityChipStyle("MEDIUM");

export const HEALTHY_CHIP_STYLE = getFindingStateChipStyle("HEALTHY");
export const UNKNOWN_CHIP_STYLE = getFindingStateChipStyle("UNKNOWN");
