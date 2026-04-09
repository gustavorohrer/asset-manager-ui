import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground"
        aria-hidden="true"
      >
        <span>Assets</span>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <Skeleton className="h-4 w-24" />
      </nav>

      <div className="space-y-6 rounded-xl border border-border/70 bg-card/40 p-6 sm:p-8">
        <header className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg bg-background/50 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2 rounded-lg bg-background/50 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
