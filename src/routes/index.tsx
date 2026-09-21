import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, Check, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { platformTone, statusTone } from "@/lib/applications";
import { getApplications } from "@/actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Application Overview — Jobdesk" },
    { name: "description", content: "Search, filter, and track every job application in one calm workspace." },
    { property: "og:title", content: "Application Overview — Jobdesk" },
    { property: "og:description", content: "Search, filter, and track every job application in one calm workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), 
  loader: () => getApplications(),
  component: Overview,
});

function Overview() {
  const applications = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Week");
  const [platform, setPlatform] = useState("All");
  const visible = useMemo(() => applications.filter((item) => {
    const matchQuery = `${item.company} ${item.role}`.toLowerCase().includes(query.toLowerCase());
    const matchPlatform = platform === "All" || item.platform === platform;
    const matchPeriod = period === "All" || (period === "Week" ? item.date >= "2026-09-14" : item.date >= "2026-09-01");
    return matchQuery && matchPlatform && matchPeriod;
  }), [query, platform, period]);
  return <>
    <PageHeader title="Application overview" subtitle="Your pipeline at a glance" actions={<Button asChild size="sm"><Link to="/add"><Plus />Add application</Link></Button>} />
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative min-w-0"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-card/75 pl-9" placeholder="Search roles or companies" aria-label="Search applications" /></div>
        <div className="flex gap-1 rounded-md border border-border bg-card/75 p-1">{["Week", "Month", "All"].map((item) => <Button key={item} size="sm" variant={period === item ? "default" : "ghost"} onClick={() => setPeriod(item)}>{item}</Button>)}</div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{["All", "LinkedIn", "Naukri", "Indeed", "Company site", "Referral"].map((item) => <Button key={item} size="sm" variant={platform === item ? "secondary" : "outline"} className="shrink-0" onClick={() => setPlatform(item)}>{item}</Button>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Active','6','text-foreground'],['Interviews','2','text-primary'],['Offers','1','text-success'],['Response rate','43%','text-foreground']].map(([label,value,tone]) => <Surface key={label} className="rise p-4"><p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p><p className={cn("mt-1 font-heading text-2xl font-semibold", tone)}>{value}</p></Surface>)}
      </div>
      <section className="mt-7"><div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"><div><h2 className="font-heading text-base font-medium">Recent applications</h2><p className="text-xs text-muted-foreground">Sorted by activity</p></div><span className="text-xs text-muted-foreground">{visible.length} shown</span></div>
        <div className="space-y-3">{visible.map((item) => <Link key={item.id} to="/applications/$id" params={{ id: item.id }} className="rise grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card/75 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-highlight font-heading text-xs font-semibold text-primary">{item.initials}</span>
          <span className="min-w-0"><span className="flex min-w-0 items-center gap-2"><strong className="truncate font-heading text-sm font-semibold">{item.role}</strong><span className={cn("hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline", platformTone[item.platform])}>{item.platform}</span></span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.company} · {item.location}</span></span>
          <span className="flex items-center gap-3 text-right"><span><span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium", statusTone[item.status])}>{item.status === "Offer" && <Check className="size-3" />}{item.status}</span><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></span><ChevronRight className="hidden size-4 text-muted-foreground sm:block" /></span>
        </Link>)}{visible.length === 0 && <Surface className="p-8 text-center text-sm text-muted-foreground">No applications match these filters.</Surface>}</div>
      </section>
    </div>
  </>;
}