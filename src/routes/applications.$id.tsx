import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Edit3, ExternalLink, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { platformTone, statusTone } from "@/lib/applications";
import { getApplication, updateApplication, deleteApplication } from "@/actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/applications/$id")({
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.company || "Application"} — Jobdesk` }, { name: "description", content: "Review source details, extracted application data, and personal notes." },
    { property: "og:title", content: "Application Detail — Jobdesk" }, { property: "og:description", content: "Review source details, extracted application data, and personal notes." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), 
  loader: ({ params }) => getApplication({ data: { id: params.id } }),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const navigate = useNavigate();
  const item = Route.useLoaderData();
  const [editing, setEditing] = useState(false); const [deleted, setDeleted] = useState(false);
  
  if (!item) {
    return <><PageHeader title="Application not found" subtitle="The entry you are looking for does not exist" /><div className="mx-auto max-w-xl px-4 py-16 text-center"><Surface className="p-8"><Trash2 className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 font-heading text-lg font-semibold">Not Found</h2><Button className="mt-5" onClick={() => navigate({ to: "/" })}>Back to overview</Button></Surface></div></>;
  }

  const [form, setForm] = useState({ company: item.company, role: item.role, date: item.date, platform: item.platform, notes: item.notes });

  const handleSave = async () => {
    await updateApplication({ data: { id: item.id, updates: form } });
    setEditing(false);
  };
  const handleDelete = async () => {
    await deleteApplication({ data: { id: item.id } });
    setDeleted(true);
  };

  if (deleted) return <><PageHeader title="Application removed" subtitle="This entry is no longer in your tracker" /><div className="mx-auto max-w-xl px-4 py-16 text-center"><Surface className="p-8"><Trash2 className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 font-heading text-lg font-semibold">Application deleted</h2><p className="mt-1 text-sm text-muted-foreground">The application entry has been removed.</p><Button className="mt-5" onClick={() => navigate({ to: "/" })}>Back to overview</Button></Surface></div></>;
  return <><PageHeader title={form.company} subtitle={form.role} actions={<Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })}><ArrowLeft />Back</Button>} /><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4"><span className="grid size-14 place-items-center rounded-lg bg-highlight font-heading font-semibold text-primary">{item.initials}</span><div className="min-w-0"><div className="flex flex-wrap gap-2"><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusTone[item.status])}>{item.status}</span><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", platformTone[item.platform])}>{item.platform}</span></div><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="size-3.5" />Applied {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]"><Surface className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-heading font-medium">Captured source</h2><p className="text-xs text-muted-foreground">Original pasted text</p></div><ExternalLink className="size-4 text-muted-foreground" /></div><div className="min-h-64 rounded-md border border-border bg-secondary/55 p-5 text-sm leading-7 text-secondary-foreground">{item.source}</div></Surface>
      <div className="space-y-5"><Surface className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-heading font-medium">Extracted details</h2><Button variant="ghost" size="sm" onClick={() => editing ? handleSave() : setEditing(!editing)}>{editing ? <Save /> : <Edit3 />}{editing ? "Save" : "Edit"}</Button></div><div className="space-y-4">{([['company','Company'],['role','Role'],['date','Applied date'],['platform','Platform']] as const).map(([key,label]) => <label key={key} className="block text-xs font-medium text-muted-foreground">{label}<Input type={key === "date" ? "date" : "text"} value={form[key]} disabled={!editing} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 disabled:opacity-100" /></label>)}</div></Surface>
        <Surface className="p-5"><h2 className="font-heading font-medium">Notes</h2><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value.slice(0, 1000) })} className="mt-3 min-h-32" placeholder="Add interview prep, follow-ups, or contacts…" /><div className="mt-3 flex justify-end"><Button size="sm" onClick={handleSave}><Save />Save notes</Button></div></Surface><Button variant="destructive" className="w-full" onClick={handleDelete}><Trash2 />Delete application</Button></div>
    </div>
  </div></>;
}