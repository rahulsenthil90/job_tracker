import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardPaste, FileImage, ImagePlus, ScanText, Sparkles, Trash2, X } from "lucide-react";
import { type ClipboardEvent, type ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { type Application } from "@/lib/applications";
import { addApplication, extractWithAI } from "@/actions";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [
    { title: "Add Application — Jobdesk" }, { name: "description", content: "Paste text or an image to extract and review job application details." },
    { property: "og:title", content: "Add Application — Jobdesk" }, { property: "og:description", content: "Paste text or an image to extract and review job application details." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: AddApplication,
});

type Platform = Application["platform"];
const platforms: Platform[] = ["LinkedIn", "Naukri", "Indeed", "Company site", "Referral"];

type Entry = { id: number; company: string; role: string; date: string; platform: Platform };

const today = "2026-09-21";

function initialsFor(company: string) {
  return company.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "NA";
}

let nextId = 1;

function AddApplication() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState(false);
  const [extractingAI, setExtractingAI] = useState(false);

  const handleAIExtract = async () => {
    if (!text.trim()) return;
    setExtractingAI(true);
    try {
      const res = await extractWithAI({ data: { text } });
      if (res.success && res.data) {
        setEntries(res.data.map((e: any) => ({
          id: nextId++,
          company: e.company || "Unknown",
          role: e.role || "Unknown",
          date: e.date || today,
          platform: e.platform || "LinkedIn"
        })));
      }
    } catch (e: any) {
      alert("AI Extraction failed: " + e.message);
    } finally {
      setExtractingAI(false);
    }
  };

  const updateEntry = (id: number, patch: Partial<Entry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEntry = (id: number) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const loadImage = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(typeof reader.result === "string" ? reader.result : null);
      setEntries([{ id: nextId++, company: "", role: "", date: today, platform: "LinkedIn" }]);
    };
    reader.readAsDataURL(file);
  };
  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const file = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"))?.getAsFile();
    if (file) { setMode("image"); loadImage(file); }
  };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => loadImage(event.target.files?.[0]);

  const saveAll = async () => {
    setSaved(true);
    for (const e of entries) {
      await addApplication({ data: {
        id: `${e.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${e.id}`,
        role: e.role, company: e.company, location: "—", date: e.date,
        platform: e.platform, status: "Applied", initials: initialsFor(e.company),
        source: text || "Pasted image", notes: "",
      }});
    }
    navigate({ to: "/" });
  };

  const ready = entries.length > 0 && entries.every((e) => e.company && e.role);

  return <div onPaste={onPaste}>
    <PageHeader title="Add application" subtitle="Paste one or many listings, or an image, and review the details" />
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex w-fit gap-1 rounded-md border border-border bg-card/75 p-1"><Button size="sm" variant={mode === "text" ? "default" : "ghost"} onClick={() => setMode("text")}><ClipboardPaste />Paste text</Button><Button size="sm" variant={mode === "image" ? "default" : "ghost"} onClick={() => setMode("image")}><FileImage />Image</Button></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <Surface className="p-5"><div className="mb-4"><h2 className="font-heading font-medium">Source</h2><p className="text-xs text-muted-foreground">Paste several applications at once — separate them with a blank line, a --- line, or numbering (1. 2. 3.).</p></div>
          {mode === "text" ? <><Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 1000000))} className="min-h-72 resize-none bg-background/70" placeholder={'Paste copied job text here — one or many listings.\n\nExample:\nSenior Product Designer at Northwind Studio\nApplied via LinkedIn\n\nFrontend Engineer at Cobalt Labs\nApplied via Naukri on 2026-09-17'} /><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{text.length}/1000000</span><Button onClick={handleAIExtract} disabled={!text.trim() || extractingAI}><Sparkles className={`mr-2 size-4 ${extractingAI ? "animate-pulse" : ""}`} />{extractingAI ? "Extracting..." : "Extract with AI ✨"}</Button></div></> : preview ? <div className="relative overflow-hidden rounded-md border border-border bg-secondary"><img src={preview} alt="Pasted job listing" className="max-h-80 w-full object-contain" /><Button variant="outline" size="icon" className="absolute right-2 top-2 bg-card" onClick={() => { setPreview(null); setEntries([]); }} aria-label="Remove image"><X /></Button></div> : <label className="grid min-h-72 cursor-pointer place-items-center rounded-md border border-dashed border-border bg-secondary/50 p-8 text-center"><span><ImagePlus className="mx-auto size-8 text-primary" /><span className="mt-3 block font-heading font-medium">Paste or upload an image</span><span className="mt-1 block text-xs text-muted-foreground">Use a screenshot from LinkedIn, Naukri, Indeed, or a company site.</span></span><input type="file" accept="image/*" className="sr-only" onChange={onFile} /></label>}
        </Surface>
        <Surface className="p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-heading font-medium">Extracted details</h2><p className="text-xs text-muted-foreground">Review each application before saving.</p></div>{entries.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-[11px] font-medium text-success"><Sparkles className="size-3" />{entries.length} ready</span>}</div>
          {entries.length === 0 ? <p className="rounded-md border border-dashed border-border bg-secondary/40 p-6 text-center text-xs text-muted-foreground">Nothing extracted yet. Paste text or an image on the left.</p> :
          <div className="max-h-[26rem] space-y-4 overflow-y-auto pr-1">{entries.map((entry, index) => (
            <div key={entry.id} className="rounded-md border border-border bg-background/60 p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Application {index + 1}</span>{entries.length > 1 && <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => removeEntry(entry.id)} aria-label={`Remove application ${index + 1}`}><Trash2 className="size-3.5" /></Button>}</div>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-muted-foreground">Company name<Input value={entry.company} onChange={(e) => updateEntry(entry.id, { company: e.target.value })} className="mt-1 bg-background/70 text-foreground" placeholder="Company name" /></label>
                <label className="block text-xs font-medium text-muted-foreground">Role<Input value={entry.role} onChange={(e) => updateEntry(entry.id, { role: e.target.value })} className="mt-1 bg-background/70 text-foreground" placeholder="Role" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-muted-foreground">Applied date<Input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, { date: e.target.value })} className="mt-1 bg-background/70 text-foreground" /></label>
                  <label className="block text-xs font-medium text-muted-foreground">Platform<select value={entry.platform} onChange={(e) => updateEntry(entry.id, { platform: e.target.value as Platform })} className="mt-1 h-9 w-full rounded-md border border-input bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">{platforms.map((p) => <option key={p}>{p}</option>)}</select></label>
                </div>
              </div>
            </div>
          ))}</div>}
          <Button className="mt-6 w-full" disabled={!ready || saved} onClick={saveAll}>{entries.length > 1 ? `Save ${entries.length} applications` : "Save application"}</Button>
        </Surface>
      </div>
    </div>
  </div>;
}
