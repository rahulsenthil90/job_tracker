import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarDays, LayoutDashboard, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/" as const, label: "Overview", icon: LayoutDashboard },
  { to: "/add" as const, label: "Add application", icon: Plus },
  { to: "/timeline" as const, label: "Timeline", icon: CalendarDays },
  { to: "/analytics" as const, label: "Analytics", icon: BarChart3 },
];

export function JobdeskShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="min-h-screen bg-background font-body text-foreground antialiased">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar/75 px-5 py-6 backdrop-blur-xl md:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary font-heading text-base font-semibold text-primary-foreground">J</span>
            <span><span className="block font-heading font-semibold leading-tight">Jobdesk</span><span className="block text-[11px] text-muted-foreground">Career tracker</span></span>
          </Link>
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return <Link key={to} to={to} className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-highlight text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}><Icon className="size-4 shrink-0" />{label}</Link>;
            })}
          </nav>
          <div className="mt-auto space-y-3">
            <div className="rounded-lg bg-highlight/70 p-3">
              <div className="flex items-center gap-2 font-heading text-[13px] font-medium"><Sparkles className="size-3.5 text-primary" />This week</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">2 interviews, 1 offer in view.</p>
            </div>
            <button onClick={async () => {
              const { logout } = await import('@/actions');
              await logout();
              window.location.href = '/login';
            }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-20 md:ml-60 md:pb-0">{children}</main>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-lg border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-xl md:hidden">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return <Link key={to} to={to} aria-label={label} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium", active ? "bg-highlight text-primary" : "text-muted-foreground")}><Icon className="size-4 shrink-0" /><span className="truncate">{label.replace(" application", "")}</span></Link>;
          })}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8"><div className="min-w-0"><h1 className="truncate font-heading text-lg font-semibold">{title}</h1><p className="truncate text-xs text-muted-foreground">{subtitle}</p></div>{actions}</header>;
}

export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-border bg-card/75 backdrop-blur-xl", className)}>{children}</div>;
}