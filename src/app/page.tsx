import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16 sm:px-8 lg:px-12">
      <section className="rounded-2xl border border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur">
        <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Eclypsium Frontend Challenge
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Frontend bootstrap complete
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          This first atomic step prepares the stack and app shell only. Asset listing,
          API integration, and feature logic are intentionally deferred to the next steps.
        </p>

        <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-background/60 p-4">
            <p className="font-medium text-foreground">Stack</p>
            <p className="mt-1">Next.js, React, TypeScript, Tailwind, shadcn/ui</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/60 p-4">
            <p className="font-medium text-foreground">Data Layer Foundation</p>
            <p className="mt-1">TanStack Query + Zod ready for upcoming API work</p>
          </div>
        </div>

        <div className="mt-8">
          <Button variant="outline" disabled>
            Asset listing arrives in next atomic step
          </Button>
        </div>
      </section>
    </main>
  );
}
