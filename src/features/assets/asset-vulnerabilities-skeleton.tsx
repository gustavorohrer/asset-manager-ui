import { Skeleton } from "@/components/ui/skeleton";

export function AssetVulnerabilitiesSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-1 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <ul className="grid gap-3">
            {[1, 2].map((j) => (
              <li
                key={j}
                className="rounded-lg border border-border/70 bg-background/30 p-4"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
