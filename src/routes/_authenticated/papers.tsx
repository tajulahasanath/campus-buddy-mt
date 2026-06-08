import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/papers")({
  head: () => ({ meta: [{ title: "Previous Year Papers — Student Hub" }] }),
  component: Papers,
});

const PAPERS = [
  { subject: "Data Structures", year: 2024, sem: 3, branch: "CSE" },
  { subject: "Data Structures", year: 2023, sem: 3, branch: "CSE" },
  { subject: "Operating Systems", year: 2024, sem: 4, branch: "CSE" },
  { subject: "Operating Systems", year: 2023, sem: 4, branch: "CSE" },
  { subject: "DBMS", year: 2024, sem: 4, branch: "CSE/IT" },
  { subject: "Computer Networks", year: 2024, sem: 5, branch: "CSE/IT" },
  { subject: "Computer Networks", year: 2022, sem: 5, branch: "CSE/IT" },
  { subject: "Theory of Computation", year: 2024, sem: 5, branch: "CSE" },
  { subject: "Compiler Design", year: 2023, sem: 6, branch: "CSE" },
  { subject: "Machine Learning", year: 2024, sem: 7, branch: "CSE/AIML" },
  { subject: "Engineering Mathematics", year: 2024, sem: 1, branch: "All" },
  { subject: "Digital Logic", year: 2023, sem: 3, branch: "ECE/CSE" },
];

function Papers() {
  const [q, setQ] = useState("");
  const filtered = PAPERS.filter((p) => q === "" || `${p.subject} ${p.year} ${p.branch}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Previous Year Papers</h1>
        <p className="mt-1 text-muted-foreground">Question papers from past exams — sorted by subject and year.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject, year, branch…" className="pl-9" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Card key={i} className="p-5 transition-shadow hover:shadow-elegant">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{p.subject}</h3>
                <p className="text-xs text-muted-foreground">{p.year} • Sem {p.sem}</p>
                <Badge variant="outline" className="mt-2">{p.branch}</Badge>
              </div>
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/70">
              <Download className="h-4 w-4" /> Download
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
