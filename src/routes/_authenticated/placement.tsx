import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Cpu, TrendingUp, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/placement")({
  head: () => ({ meta: [{ title: "Placement Preparation — Student Hub" }] }),
  component: Placement,
});

const SECTIONS = [
  {
    icon: Brain, title: "Aptitude & Reasoning", color: "bg-gradient-brand", items: [
      { t: "Quantitative Aptitude", u: "https://www.indiabix.com/aptitude/questions-and-answers/" },
      { t: "Logical Reasoning", u: "https://www.indiabix.com/logical-reasoning/questions-and-answers/" },
      { t: "Verbal Ability", u: "https://www.indiabix.com/verbal-ability/questions-and-answers/" },
    ],
  },
  {
    icon: Cpu, title: "DSA Roadmap", color: "bg-accent", items: [
      { t: "Striver's SDE Sheet", u: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
      { t: "Love Babbar 450", u: "https://450dsa.com/" },
      { t: "NeetCode 150", u: "https://neetcode.io/practice" },
    ],
  },
  {
    icon: Users, title: "HR & Behavioral", color: "bg-success", items: [
      { t: "STAR method guide", u: "https://www.themuse.com/advice/star-interview-method" },
      { t: "Common HR questions", u: "https://www.indeed.com/career-advice/interviewing/common-interview-questions" },
      { t: "Mock interview tips", u: "https://www.interviewing.io/" },
    ],
  },
  {
    icon: TrendingUp, title: "System Design", color: "bg-warning", items: [
      { t: "System Design Primer", u: "https://github.com/donnemartin/system-design-primer" },
      { t: "ByteByteGo", u: "https://bytebytego.com/" },
      { t: "High Scalability", u: "http://highscalability.com/" },
    ],
  },
];

function Placement() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Placement Preparation</h1>
        <p className="mt-1 text-muted-foreground">A structured prep kit — aptitude, DSA, system design and HR.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-6 transition-shadow hover:shadow-elegant">
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.color} text-primary-foreground`}><s.icon className="h-6 w-6" /></div>
              <div><h2 className="text-lg font-semibold">{s.title}</h2><Badge variant="secondary">{s.items.length} resources</Badge></div>
            </div>
            <ul className="mt-4 space-y-2">
              {s.items.map((i) => (
                <li key={i.t}>
                  <a href={i.u} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-medium hover:bg-secondary">
                    {i.t} <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
        <h3 className="text-lg font-semibold">12-week placement roadmap</h3>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Week 1–2: Aptitude + basics revision",
            "Week 3–4: Arrays, Strings, Hashing",
            "Week 5–6: Trees, Graphs, Recursion",
            "Week 7–8: DP + OOPs + DBMS + OS",
            "Week 9–10: System Design + Projects",
            "Week 11–12: Mock interviews + HR prep",
          ].map((w, i) => (
            <li key={i} className="rounded-lg bg-white/10 px-3 py-2 text-sm backdrop-blur">{w}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
