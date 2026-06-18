import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, BookOpen, FileQuestion, FileText, Briefcase, FileEdit,
  GraduationCap, Code2, Calculator, LogOut, Menu, X, Flame, ClipboardCheck, Settings as SettingsIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notes", label: "Semester Notes", icon: BookOpen },
  { to: "/questions", label: "Important Questions", icon: FileQuestion },
  { to: "/papers", label: "Previous Year Papers", icon: FileText },
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/resumes", label: "Resume Builder", icon: FileEdit },
  { to: "/placement", label: "Placement Prep", icon: GraduationCap },
  { to: "/coding", label: "Coding Practice", icon: Code2 },
  { to: "/challenges", label: "Daily Challenges", icon: Flame },
  { to: "/daily-test", label: "Daily Interview Test", icon: ClipboardCheck },
  { to: "/cgpa", label: "CGPA Calculator", icon: Calculator },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(/[ @]/).filter(Boolean).slice(0, 2).map((s: string) => s[0]).join("").toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-gradient-subtle">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            StudentHub
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-gradient-brand text-primary-foreground shadow-elegant" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <n.icon className="h-4 w-4" /> {t(n.label)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">{initials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.user_metadata?.full_name || user.email}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleSignOut} title={t("Sign out")}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="text-sm font-medium text-muted-foreground">
            {(() => { const label = nav.find((n) => n.to === pathname)?.label; return label ? t(label) : "Student Hub"; })()}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
