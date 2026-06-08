import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calculator } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cgpa")({
  head: () => ({ meta: [{ title: "CGPA Calculator — Student Hub" }] }),
  component: CgpaPage,
});

const GRADE_POINTS: Record<string, number> = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0 };
const GRADES = Object.keys(GRADE_POINTS);

type Sub = { name: string; credits: string; grade: string };
type Sem = { name: string; sgpa: string; credits: string };

function SgpaCalc() {
  const [subs, setSubs] = useState<Sub[]>([
    { name: "Subject 1", credits: "4", grade: "A" },
    { name: "Subject 2", credits: "3", grade: "A+" },
    { name: "Subject 3", credits: "3", grade: "B+" },
  ]);

  const { sgpa, totalCredits } = useMemo(() => {
    let pts = 0, cr = 0;
    for (const s of subs) {
      const c = parseFloat(s.credits) || 0;
      const g = GRADE_POINTS[s.grade] ?? 0;
      pts += c * g; cr += c;
    }
    return { sgpa: cr ? (pts / cr).toFixed(2) : "0.00", totalCredits: cr };
  }, [subs]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-3 p-5">
        <div className="hidden gap-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_120px_40px]">
          <span>Subject</span><span>Credits</span><span>Grade</span><span></span>
        </div>
        {subs.map((s, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_120px_40px]">
            <Input value={s.name} onChange={(e) => { const c = [...subs]; c[i].name = e.target.value; setSubs(c); }} />
            <Input type="number" min="0" value={s.credits} onChange={(e) => { const c = [...subs]; c[i].credits = e.target.value; setSubs(c); }} />
            <select value={s.grade} onChange={(e) => { const c = [...subs]; c[i].grade = e.target.value; setSubs(c); }} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              {GRADES.map((g) => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
            </select>
            <Button size="icon" variant="ghost" onClick={() => setSubs(subs.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => setSubs([...subs, { name: `Subject ${subs.length + 1}`, credits: "3", grade: "A" }])}><Plus className="mr-2 h-4 w-4" /> Add subject</Button>
      </Card>
      <Card className="bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
        <div className="text-sm opacity-80">Your SGPA</div>
        <div className="mt-1 text-6xl font-bold tabular-nums">{sgpa}</div>
        <div className="mt-2 text-sm opacity-90">Across {totalCredits} credits • {subs.length} subjects</div>
        <div className="mt-6 rounded-lg bg-white/10 p-3 text-xs backdrop-blur">SGPA = Σ(Credit × Grade Point) ÷ Σ(Credits)</div>
      </Card>
    </div>
  );
}

function CgpaCalc() {
  const [sems, setSems] = useState<Sem[]>([
    { name: "Semester 1", sgpa: "8.5", credits: "24" },
    { name: "Semester 2", sgpa: "8.8", credits: "26" },
  ]);

  const { cgpa, totalCredits } = useMemo(() => {
    let pts = 0, cr = 0;
    for (const s of sems) {
      const c = parseFloat(s.credits) || 0;
      const g = parseFloat(s.sgpa) || 0;
      pts += c * g; cr += c;
    }
    return { cgpa: cr ? (pts / cr).toFixed(2) : "0.00", totalCredits: cr };
  }, [sems]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-3 p-5">
        <div className="hidden gap-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_120px_40px]">
          <span>Semester</span><span>SGPA</span><span>Credits</span><span></span>
        </div>
        {sems.map((s, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_120px_40px]">
            <Input value={s.name} onChange={(e) => { const c = [...sems]; c[i].name = e.target.value; setSems(c); }} />
            <Input type="number" step="0.01" min="0" max="10" value={s.sgpa} onChange={(e) => { const c = [...sems]; c[i].sgpa = e.target.value; setSems(c); }} />
            <Input type="number" min="0" value={s.credits} onChange={(e) => { const c = [...sems]; c[i].credits = e.target.value; setSems(c); }} />
            <Button size="icon" variant="ghost" onClick={() => setSems(sems.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => setSems([...sems, { name: `Semester ${sems.length + 1}`, sgpa: "8.0", credits: "24" }])}><Plus className="mr-2 h-4 w-4" /> Add semester</Button>
      </Card>
      <Card className="bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
        <div className="text-sm opacity-80">Your CGPA</div>
        <div className="mt-1 text-6xl font-bold tabular-nums">{cgpa}</div>
        <div className="mt-2 text-sm opacity-90">Across {totalCredits} credits • {sems.length} semesters</div>
        <div className="mt-6 rounded-lg bg-white/10 p-3 text-xs backdrop-blur">≈ {(parseFloat(cgpa) * 9.5).toFixed(2)}% (CGPA × 9.5)</div>
      </Card>
    </div>
  );
}

function CgpaPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-primary-foreground"><Calculator className="h-6 w-6" /></div>
        <div>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
          <p className="mt-1 text-muted-foreground">Calculate SGPA from subjects, then aggregate CGPA across semesters.</p>
        </div>
      </div>
      <Tabs defaultValue="sgpa">
        <TabsList><TabsTrigger value="sgpa">SGPA</TabsTrigger><TabsTrigger value="cgpa">CGPA</TabsTrigger></TabsList>
        <TabsContent value="sgpa" className="mt-4"><SgpaCalc /></TabsContent>
        <TabsContent value="cgpa" className="mt-4"><CgpaCalc /></TabsContent>
      </Tabs>
    </div>
  );
}
