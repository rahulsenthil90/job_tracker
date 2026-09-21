import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { applications, statusTone } from "@/lib/applications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [
    { title: "Application Timeline — Jobdesk" }, { name: "description", content: "Review job applications chronologically by week and month." },
    { property: "og:title", content: "Application Timeline — Jobdesk" }, { property: "og:description", content: "Review job applications chronologically by week and month." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: Timeline,
});

function Timeline() {
  return <><PageHeader title="Application timeline" subtitle="Every opportunity, in order" /><div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section><h2 className="mb-4 font-heading text-base font-medium">September 2026</h2><div className="relative space-y-3 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-border">{applications.map((item) => <Link key={item.id} to="/applications/$id" params={{ id: item.id }} className="relative grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card/75 p-4 backdrop-blur-xl transition hover:shadow-sm"><span className="z-10 grid size-10 place-items-center rounded-md bg-highlight font-heading text-[11px] font-semibold text-primary">{new Date(`${item.date}T00:00:00`).getDate()}</span><span className="min-w-0"><strong className="block truncate font-heading text-sm font-semibold">{item.role}</strong><span className="block truncate text-xs text-muted-foreground">{item.company} · {item.platform}</span></span><span className="flex items-center gap-2"><span className={cn("hidden rounded-full px-2 py-1 text-[10px] font-medium sm:inline", statusTone[item.status])}>{item.status}</span><ChevronRight className="size-4 text-muted-foreground" /></span></Link>)}</div></section>
      <aside className="space-y-3"><Surface className="p-4"><p className="text-[11px] font-medium uppercase text-muted-foreground">This week</p><p className="mt-1 font-heading text-2xl font-semibold">3</p><p className="text-xs text-muted-foreground">New applications</p></Surface><Surface className="p-4"><p className="text-[11px] font-medium uppercase text-muted-foreground">This month</p><p className="mt-1 font-heading text-2xl font-semibold">5</p><p className="text-xs text-muted-foreground">Across 4 platforms</p></Surface><Surface className="bg-highlight/60 p-4"><p className="font-heading text-sm font-medium">Strongest week</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">September 14–20 had your highest response rate.</p></Surface></aside>
    </div>
  </div></>;
}