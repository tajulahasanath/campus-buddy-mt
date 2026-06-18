import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileQuestion, FileText, Briefcase, FileEdit, GraduationCap, Code2, Calculator, ArrowRight, Sparkles, Flame, ClipboardCheck, Settings as SettingsIcon } from "lucide-react";
import { Route as ParentRoute } from "./route";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Student Hub" }] }),
  component: Dashboard,
});

const tiles = [
  { to: "/notes", title: "Semester Notes", desc: "Browse subject-wise notes", icon: BookOpen },
  { to: "/questions", title: "Important Questions", desc: "Most asked, exam-ready", icon: FileQuestion },
  { to: "/papers", title: "Previous Year Papers", desc: "Year-wise question banks", icon: FileText },
  { to: "/internships", title: "Internships", desc: "Live opportunities", icon: Briefcase },
  { to: "/resumes", title: "AI Resume Builder", desc: "Build & export to PDF", icon: FileEdit },
  { to: "/placement", title: "Placement Prep", desc: "Aptitude, HR, DSA", icon: GraduationCap },
  { to: "/coding", title: "Coding Practice", desc: "Curated problem sets", icon: Code2 },
  { to: "/challenges", title: "Daily Challenges", desc: "Beginner → Advanced", icon: Flame },
  { to: "/daily-test", title: "Daily Interview Test", desc: "MCQ • HR • Aptitude", icon: ClipboardCheck },
  { to: "/cgpa", title: "CGPA Calculator", desc: "Track your grades", icon: Calculator },
  { to: "/settings", title: "Settings", desc: "Theme & language", icon: SettingsIcon },
] as const;

function Dashboard() {
  const { user } = ParentRoute.useRouteContext();
  const { t } = useI18n();
  const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Student";
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
          <Sparkles className="h-3 w-3" /> {t("Welcome back")}
        </div>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Hi {name}, ready to learn?</h1>
        <p className="mt-2 max-w-xl text-white/85">Pick a tool below and pick up where you left off — your study toolkit is just one click away.</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("Quick access")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link key={tile.to} to={tile.to} className="group rounded-xl border border-border bg-card p-5 shadow-card-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
                <tile.icon className="h-5 w-5" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{t(tile.title)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tile.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
