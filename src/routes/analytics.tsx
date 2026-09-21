import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Surface } from "@/components/jobdesk-shell";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [
    { title: "Application Analytics — Jobdesk" }, { name: "description", content: "Understand weekly application activity and platform distribution." },
    { property: "og:title", content: "Application Analytics — Jobdesk" }, { property: "og:description", content: "Understand weekly application activity and platform distribution." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: Analytics,
});

const bars = [40, 28, 62, 22, 88, 16, 12];
const platforms = [["LinkedIn", 3, "bg-primary"], ["Naukri", 1, "bg-success"], ["Indeed", 1, "bg-platform-indeed-foreground"], ["Referral", 1, "bg-chart-4"]] as const;
function Analytics() {
  return <><PageHeader title="Analytics" subtitle="Patterns across your search" /><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["This week","3","+50%"],["This month","5","+25%"],["Response rate","43%","+8%"],["Top platform","LinkedIn","3 apps"]].map(([label,value,delta]) => <Surface key={label} className="p-4"><p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="truncate font-heading text-xl font-semibold sm:text-2xl">{value}</p><span className="shrink-0 text-[11px] text-success">{delta}</span></div></Surface>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]"><Surface className="p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><div><h2 className="font-heading font-medium">Weekly momentum</h2><p className="text-xs text-muted-foreground">Applications submitted over seven days</p></div><span className="text-xs text-muted-foreground">14–20 Sep</span></div><div className="mt-8 flex h-56 items-end justify-between gap-3 border-b border-border px-2">{bars.map((height, i) => <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2"><div className={`chart-rise w-full rounded-t-md ${i === 4 ? "bg-success" : "bg-primary"}`} style={{ height: `${height}%` }} /><span className="pb-2 text-center text-[10px] text-muted-foreground">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span></div>)}</div></Surface>
      <Surface className="p-5"><h2 className="font-heading font-medium">Platform distribution</h2><p className="text-xs text-muted-foreground">Where applications came from</p><div className="mx-auto my-7 grid size-40 place-items-center rounded-full bg-platform-chart"><div className="grid size-24 place-items-center rounded-full bg-card text-center"><span><strong className="block font-heading text-2xl">6</strong><span className="text-[10px] text-muted-foreground">total</span></span></div></div><div className="space-y-3">{platforms.map(([name,count,tone]) => <div key={name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs"><span className={`size-2 rounded-full ${tone}`} /><span className="text-muted-foreground">{name}</span><strong>{count}</strong></div>)}</div></Surface>
    </div>
  </div></>;
}