"use client";

import { Calendar, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";

type AssetsListFilterControlsProps = {
  showAdvancedFilters: boolean;
  hasAdvancedFiltersActive: boolean;
  withVulnerabilities?: boolean;
  withThreats?: boolean;
  hasActiveFilters: boolean;
  localLastScanFrom: string;
  localLastScanTo: string;
  lastScanFrom: string;
  lastScanTo: string;
  isDateRangeInvalid: boolean;
  dateRangeErrorId: string;
  onToggleAdvancedFilters: () => void;
  onToggleVulnerabilities: () => void;
  onToggleThreats: () => void;
  onClearFilters: () => void;
  onLocalLastScanFromChange: (value: string) => void;
  onLocalLastScanToChange: (value: string) => void;
  onApplyDateRange: () => void;
};

export function AssetsListFilterControls({
  showAdvancedFilters,
  hasAdvancedFiltersActive,
  withVulnerabilities,
  withThreats,
  hasActiveFilters,
  localLastScanFrom,
  localLastScanTo,
  lastScanFrom,
  lastScanTo,
  isDateRangeInvalid,
  dateRangeErrorId,
  onToggleAdvancedFilters,
  onToggleVulnerabilities,
  onToggleThreats,
  onClearFilters,
  onLocalLastScanFromChange,
  onLocalLastScanToChange,
  onApplyDateRange,
}: AssetsListFilterControlsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={showAdvancedFilters}
          data-pressed={showAdvancedFilters || undefined}
          onClick={onToggleAdvancedFilters}
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {hasAdvancedFiltersActive && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-pressed={withVulnerabilities || undefined}
          aria-pressed={Boolean(withVulnerabilities)}
          onClick={onToggleVulnerabilities}
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          With vulnerabilities
          {withVulnerabilities && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-pressed={withThreats || undefined}
          aria-pressed={Boolean(withThreats)}
          onClick={onToggleThreats}
          className="relative data-[pressed]:border-primary/60 data-[pressed]:bg-primary/10 data-[pressed]:text-primary"
        >
          With threats
          {withThreats && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </Button>
      </div>

      {showAdvancedFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/50 bg-background/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last scan from
            </span>
            <input
              id="assets-last-scan-from"
              type="date"
              value={localLastScanFrom}
              onChange={(event) =>
                onLocalLastScanFromChange(event.target.value)
              }
              max={localLastScanTo || undefined}
              aria-invalid={isDateRangeInvalid}
              aria-describedby={
                isDateRangeInvalid ? dateRangeErrorId : undefined
              }
              className={`date-input h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-all focus:border-primary ${localLastScanFrom ? "border-primary/60 bg-primary/5" : ""}`}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last scan to
            </span>
            <input
              id="assets-last-scan-to"
              type="date"
              value={localLastScanTo}
              onChange={(event) => onLocalLastScanToChange(event.target.value)}
              min={localLastScanFrom || undefined}
              aria-invalid={isDateRangeInvalid}
              aria-describedby={
                isDateRangeInvalid ? dateRangeErrorId : undefined
              }
              className={`date-input h-10 rounded-md border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition-all focus:border-primary ${localLastScanTo ? "border-primary/60 bg-primary/5" : ""} ${isDateRangeInvalid ? "border-red-500/50 bg-red-500/5" : ""}`}
            />
          </label>
          <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-2 lg:flex-row lg:items-end">
            <Button
              type="button"
              size="sm"
              onClick={onApplyDateRange}
              disabled={
                isDateRangeInvalid ||
                (localLastScanFrom === lastScanFrom &&
                  localLastScanTo === lastScanTo)
              }
              className="px-8"
            >
              Apply
            </Button>
            {isDateRangeInvalid && (
              <p
                id={dateRangeErrorId}
                role="alert"
                className="flex items-center text-xs text-red-500/80"
              >
                "From" date cannot be after "To" date.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
