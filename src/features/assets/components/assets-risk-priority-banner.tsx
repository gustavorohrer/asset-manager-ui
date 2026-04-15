"use client";

import { Button } from "@/components/ui/button";

type AssetsRiskPriorityBannerProps = {
  onViewFullInventory: () => void;
};

export function AssetsRiskPriorityBanner({
  onViewFullInventory,
}: AssetsRiskPriorityBannerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-foreground">
        You are viewing a risk-prioritized inventory (assets with
        vulnerabilities or threats).
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onViewFullInventory}
      >
        View full inventory
      </Button>
    </div>
  );
}
