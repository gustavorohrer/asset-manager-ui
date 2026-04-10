import Link from "next/link";

import type { Asset } from "@/domain/assets";
import { getTopRiskyAssets } from "@/features/assets/get-top-risky-assets";

type TopRiskyAssetsInsightProps = {
  assets: Asset[];
};

export function TopRiskyAssetsInsight({ assets }: TopRiskyAssetsInsightProps) {
  const topRiskyAssets = getTopRiskyAssets(assets);

  if (topRiskyAssets.length < 2) {
    return null;
  }

  return (
    <section
      className="space-y-3 rounded-lg border border-border/60 bg-background/30 p-4"
      aria-label="Top risky assets insight"
    >
      <h2 className="text-sm font-semibold text-foreground">
        Top risky assets (current page)
      </h2>

      <ul className="space-y-2">
        {topRiskyAssets.map((asset) => (
          <li
            key={asset.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-background/50 px-3 py-2"
          >
            <div className="min-w-0">
              <Link
                href={`/assets/${asset.id}`}
                className="truncate text-sm font-medium text-foreground hover:text-primary"
              >
                {asset.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                Risk score: {asset.riskScore}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-[10px]">
              <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                Threats {asset.threatCount}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                Vulnerabilities {asset.vulnerabilityCount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
