import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, FileQuestion, Briefcase, FileEdit, GraduationCap, Code2, Calculator, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Hub — Everything you need to ace college" },
      { name: "description", content: "Notes, previous year papers, internships, resume builder, placement prep, coding practice & CGPA calculator — all in one place." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: BookOpen, title: "Semester Notes", desc: "Curated, well-organized notes for every subject and semester." },
  { icon: FileQuestion, title: "Important Questions", desc: "Most-asked questions handpicked by toppers and faculty." },
  { icon: FileText, title: "Previous Year Papers", desc: "Years of question papers with solutions, sorted by branch." },
  { icon: Briefcase, title: "Internship Opportunities", desc: "Fresh internship listings updated regularly across domains." },
  { icon: FileEdit, title: "Resume Builder", desc: "Build a clean, ATS-friendly resume in minutes — and export to PDF." },
  { icon: GraduationCap, title: "Placement Preparation", desc: "Aptitude, HR rounds, system design, DSA roadmap — all in one." },
  { icon: Code2, title: "Coding Practice", desc: "Curated problem lists, contests, and direct links to top platforms." },
  { icon: Calculator, title: "CGPA Calculator", desc: "Calculate SGPA and CGPA accurately with branch-specific grade points." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-elegant">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span>Student<span className="text-gradient">Hub</span></span>
          </Link>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#why" className="text-muted-foreground hover:text-foreground">Why us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/resume-builder" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">Resume Builder</Link>
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-card-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built by students, for students
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
            Everything you need to <span className="text-gradient">crush college</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Notes, previous year papers, internships, resume builder, placement prep, coding practice and a CGPA calculator — beautifully unified in one student hub.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-brand shadow-elegant hover:opacity-90">
              <Link to="/auth">Start Learning <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/resume-builder">Build Resume</Link>
            </Button>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8 text-center">
            {[["10k+","Students"],["8","Powerful tools"],["100%","Free to use"]].map(([n,l]) => (
              <div key={l}>
                <div className="text-3xl font-bold text-gradient">{n}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">All your tools, one place</h2>
          <p className="mt-3 text-muted-foreground">Stop juggling tabs. Everything a student needs, finally together.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 shadow-card-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="border-t border-border bg-gradient-subtle py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Ready when you are</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create your free account and unlock notes, papers, your personal resume and the full toolkit.
          </p>
          <Button asChild size="lg" className="mt-8 bg-gradient-brand shadow-elegant">
            <Link to="/auth">Create your free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6">
          © {new Date().getFullYear()} StudentHub. Made with care for students.
        </div>
      </footer>
    </div>
  );
}
