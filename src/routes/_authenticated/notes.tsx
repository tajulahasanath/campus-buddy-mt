import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Semester Notes — Student Hub" }] }),
  component: Notes,
});

type Note = { title: string; sem: number; branch: string; size: string; url: string };

const NOTES: Note[] = [
  { title: "Engineering Mathematics I", sem: 1, branch: "All", size: "4.2 MB", url: "https://archive.org/download/notes-em1/EM1.pdf" },
  { title: "Engineering Physics", sem: 1, branch: "All", size: "3.1 MB", url: "#" },
  { title: "Programming in C", sem: 1, branch: "CSE/IT", size: "2.8 MB", url: "#" },
  { title: "Data Structures", sem: 3, branch: "CSE/IT", size: "5.6 MB", url: "#" },
  { title: "Digital Logic Design", sem: 3, branch: "ECE/CSE", size: "3.9 MB", url: "#" },
  { title: "Operating Systems", sem: 4, branch: "CSE/IT", size: "6.1 MB", url: "#" },
  { title: "DBMS", sem: 4, branch: "CSE/IT", size: "4.7 MB", url: "#" },
  { title: "Computer Networks", sem: 5, branch: "CSE/IT", size: "5.3 MB", url: "#" },
  { title: "Theory of Computation", sem: 5, branch: "CSE", size: "3.4 MB", url: "#" },
  { title: "Compiler Design", sem: 6, branch: "CSE", size: "4.9 MB", url: "#" },
  { title: "Machine Learning", sem: 7, branch: "CSE/AIML", size: "7.2 MB", url: "#" },
  { title: "Cloud Computing", sem: 7, branch: "CSE/IT", size: "3.8 MB", url: "#" },
];

function Notes() {
  const [q, setQ] = useState("");
  const [sem, setSem] = useState<number | "all">("all");
  const filtered = NOTES.filter((n) =>
    (sem === "all" || n.sem === sem) &&
    (q === "" || n.title.toLowerCase().includes(q.toLowerCase()) || n.branch.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Semester Notes</h1>
        <p className="mt-1 text-muted-foreground">Curated notes organized by semester and branch.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subjects or branches…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setSem("all")} className={`rounded-md px-3 py-1.5 text-sm font-medium ${sem === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>All</button>
          {[1,2,3,4,5,6,7,8].map((s) => (
            <button key={s} onClick={() => setSem(s)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${sem === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>Sem {s}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <Card key={n.title} className="p-5 transition-shadow hover:shadow-elegant">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground"><BookOpen className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{n.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">Sem {n.sem}</Badge>
                  <Badge variant="outline">{n.branch}</Badge>
                  <Badge variant="outline">{n.size}</Badge>
                </div>
              </div>
            </div>
            <a href={n.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/70">
              <Download className="h-4 w-4" /> Download PDF
            </a>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-12 text-center text-muted-foreground">No notes match your search.</div>}
      </div>
    </div>
  );
}
