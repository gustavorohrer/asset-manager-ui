export function calculateRiskPercentage(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  const rawPercentage = Math.round((count / total) * 100);
  return Math.min(100, Math.max(0, rawPercentage));
}
