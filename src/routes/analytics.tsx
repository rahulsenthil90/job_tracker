import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { getApplications } from "@/actions";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [
    { title: "Application Analytics — Jobdesk" }, { name: "description", content: "Understand weekly application activity and platform distribution." },
    { property: "og:title", content: "Application Analytics — Jobdesk" }, { property: "og:description", content: "Understand weekly application activity and platform distribution." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  loader: () => getApplications(),
  component: Analytics,
});

function Analytics() {
  const applications = Route.useLoaderData();
  
  const thisWeek = applications.filter(a => new Date(a.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const thisMonth = applications.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length;
  const responseCount = applications.filter(a => ["Screening", "Interview", "Offer"].includes(a.status)).length;
  const responseRate = applications.length > 0 ? Math.round((responseCount / applications.length) * 100) : 0;
  
  const platformCounts: Record<string, number> = {};
  applications.forEach(a => {
    platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1;
  });
  
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

  const platforms = Object.entries(platformCounts).map(([name, count], idx) => {
    const tones = ["bg-primary", "bg-success", "bg-platform-indeed-foreground", "bg-chart-4", "bg-highlight"];
    return [name, count, tones[idx % tones.length]];
  });

  // Calculate last 7 days chart data
  const barsData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split("T")[0];
    return {
      count: applications.filter(a => a.date === dayStr).length,
      label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]
    };
  });
  const maxBar = Math.max(...barsData.map(b => b.count), 1);

  return <><PageHeader title="Analytics" subtitle="Patterns across your search" /><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["This week",thisWeek.toString(),""],["This month",thisMonth.toString(),""],["Response rate",`${responseRate}%`,""],["Top platform",topPlatform[0] as string,`${topPlatform[1]} apps`]].map(([label,value,delta]) => <Surface key={label} className="p-4"><p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="truncate font-heading text-xl font-semibold sm:text-2xl">{value}</p><span className="shrink-0 text-[11px] text-success">{delta}</span></div></Surface>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]"><Surface className="p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><div><h2 className="font-heading font-medium">Weekly momentum</h2><p className="text-xs text-muted-foreground">Applications submitted over seven days</p></div><span className="text-xs text-muted-foreground">Last 7 days</span></div><div className="mt-8 flex h-56 items-end justify-between gap-3 border-b border-border px-2">{barsData.map((data, i) => {
      const height = (data.count / maxBar) * 100;
      return <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2"><div className={`chart-rise w-full rounded-t-md ${height > 0 ? "bg-primary" : "bg-primary/20"}`} style={{ height: `${Math.max(height, 5)}%` }} /><span className="pb-2 text-center text-[10px] text-muted-foreground">{data.label}</span></div>
    })}</div></Surface>
      <Surface className="p-5"><h2 className="font-heading font-medium">Platform distribution</h2><p className="text-xs text-muted-foreground">Where applications came from</p><div className="mx-auto my-7 grid size-40 place-items-center rounded-full bg-platform-chart"><div className="grid size-24 place-items-center rounded-full bg-card text-center"><span><strong className="block font-heading text-2xl">{applications.length}</strong><span className="text-[10px] text-muted-foreground">total</span></span></div></div><div className="space-y-3">{platforms.map(([name,count,tone]) => <div key={name as string} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs"><span className={`size-2 rounded-full ${tone}`} /><span className="text-muted-foreground">{name as string}</span><strong>{count as number}</strong></div>)}</div></Surface>
    </div>
  </div></>;
}