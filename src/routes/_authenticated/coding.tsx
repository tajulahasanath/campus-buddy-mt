import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Code2, Trophy, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coding")({
  head: () => ({ meta: [{ title: "Coding Practice — Student Hub" }] }),
  component: Coding,
});

const PLATFORMS = [
  { name: "LeetCode", desc: "The gold standard for interview prep.", url: "https://leetcode.com", color: "bg-warning text-warning-foreground" },
  { name: "Codeforces", desc: "Competitive programming contests.", url: "https://codeforces.com", color: "bg-destructive text-destructive-foreground" },
  { name: "GeeksforGeeks", desc: "Concept-wise practice & articles.", url: "https://www.geeksforgeeks.org", color: "bg-success text-success-foreground" },
  { name: "HackerRank", desc: "Skill-based challenges & certs.", url: "https://www.hackerrank.com", color: "bg-accent text-accent-foreground" },
  { name: "CodeChef", desc: "Long & short contests + practice.", url: "https://www.codechef.com", color: "bg-gradient-brand text-primary-foreground" },
  { name: "AtCoder", desc: "High-quality weekend contests.", url: "https://atcoder.jp", color: "bg-primary text-primary-foreground" },
];

const TRACKS = [
  { icon: Target, name: "Beginner DSA (30 days)", problems: 60, level: "Beginner" },
  { icon: Code2, name: "Top Interview 150 (LeetCode)", problems: 150, level: "Intermediate" },
  { icon: Trophy, name: "Striver's A2Z Sheet", problems: 455, level: "All levels" },
  { icon: Target, name: "Dynamic Programming Patterns", problems: 50, level: "Advanced" },
];

function Coding() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Coding Practice</h1>
        <p className="mt-1 text-muted-foreground">The best platforms and curated tracks to sharpen your problem-solving.</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Top platforms</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer">
              <Card className="p-5 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className={`mb-3 grid h-11 w-11 place-items-center rounded-lg font-bold ${p.color}`}>{p.name[0]}</div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Curated tracks</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TRACKS.map((t) => (
            <Card key={t.name} className="flex items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground"><t.icon className="h-6 w-6" /></div>
              <div className="flex-1">
                <h3 className="font-semibold">{t.name}</h3>
                <div className="mt-1 flex gap-2"><Badge variant="secondary">{t.problems} problems</Badge><Badge variant="outline">{t.level}</Badge></div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
