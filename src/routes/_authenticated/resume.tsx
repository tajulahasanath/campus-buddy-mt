import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Builder — Student Hub" }] }),
  component: ResumeBuilder,
});

type Edu = { school: string; degree: string; year: string; score: string };
type Exp = { company: string; role: string; period: string; bullets: string };
type Resume = {
  name: string; title: string; email: string; phone: string; location: string; links: string;
  summary: string;
  education: Edu[];
  experience: Exp[];
  skills: string;
  projects: { name: string; desc: string }[];
};

const EMPTY: Resume = {
  name: "", title: "", email: "", phone: "", location: "", links: "",
  summary: "",
  education: [{ school: "", degree: "", year: "", score: "" }],
  experience: [{ company: "", role: "", period: "", bullets: "" }],
  skills: "",
  projects: [{ name: "", desc: "" }],
};

const STORAGE_KEY = "studenthub:resume";

function ResumeBuilder() {
  const [r, setR] = useState<Resume>(EMPTY);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setR({ ...EMPTY, ...JSON.parse(s) }); } catch {}
  }, []);

  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); toast.success("Resume saved"); };

  const printPdf = () => { save(); window.print(); };

  return (
    <div className="mx-auto max-w-7xl">
      <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; inset: 0; background: white; padding: 40px; } .no-print { display: none !important; } }`}</style>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="mt-1 text-muted-foreground">Fill it out, save, then export to PDF.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={save}><Save className="mr-2 h-4 w-4" /> Save</Button>
          <Button onClick={printPdf} className="bg-gradient-brand"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="no-print space-y-5">
          <Card className="space-y-3 p-5">
            <h3 className="font-semibold">Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full name</Label><Input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /></div>
              <div><Label>Title / Role</Label><Input value={r.title} onChange={(e) => setR({ ...r, title: e.target.value })} placeholder="CS Undergrad" /></div>
              <div><Label>Email</Label><Input value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={r.phone} onChange={(e) => setR({ ...r, phone: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={r.location} onChange={(e) => setR({ ...r, location: e.target.value })} /></div>
              <div><Label>Links (comma sep)</Label><Input value={r.links} onChange={(e) => setR({ ...r, links: e.target.value })} placeholder="github.com/you, linkedin.com/in/you" /></div>
            </div>
            <div><Label>Summary</Label><Textarea rows={3} value={r.summary} onChange={(e) => setR({ ...r, summary: e.target.value })} /></div>
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Education</h3>
              <Button size="sm" variant="ghost" onClick={() => setR({ ...r, education: [...r.education, { school: "", degree: "", year: "", score: "" }] })}><Plus className="h-4 w-4" /></Button>
            </div>
            {r.education.map((e, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-md border p-3">
                <Input placeholder="School / College" value={e.school} onChange={(ev) => { const c = [...r.education]; c[i].school = ev.target.value; setR({ ...r, education: c }); }} />
                <Input placeholder="Degree" value={e.degree} onChange={(ev) => { const c = [...r.education]; c[i].degree = ev.target.value; setR({ ...r, education: c }); }} />
                <Input placeholder="Year" value={e.year} onChange={(ev) => { const c = [...r.education]; c[i].year = ev.target.value; setR({ ...r, education: c }); }} />
                <Input placeholder="CGPA / %" value={e.score} onChange={(ev) => { const c = [...r.education]; c[i].score = ev.target.value; setR({ ...r, education: c }); }} />
                <Button size="sm" variant="ghost" className="col-span-2 justify-self-end text-destructive" onClick={() => setR({ ...r, education: r.education.filter((_, x) => x !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Experience / Projects</h3>
              <Button size="sm" variant="ghost" onClick={() => setR({ ...r, experience: [...r.experience, { company: "", role: "", period: "", bullets: "" }] })}><Plus className="h-4 w-4" /></Button>
            </div>
            {r.experience.map((e, i) => (
              <div key={i} className="space-y-2 rounded-md border p-3">
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Company" value={e.company} onChange={(ev) => { const c = [...r.experience]; c[i].company = ev.target.value; setR({ ...r, experience: c }); }} />
                  <Input placeholder="Role" value={e.role} onChange={(ev) => { const c = [...r.experience]; c[i].role = ev.target.value; setR({ ...r, experience: c }); }} />
                  <Input placeholder="Period" value={e.period} onChange={(ev) => { const c = [...r.experience]; c[i].period = ev.target.value; setR({ ...r, experience: c }); }} />
                </div>
                <Textarea placeholder="Achievements (one per line)" rows={3} value={e.bullets} onChange={(ev) => { const c = [...r.experience]; c[i].bullets = ev.target.value; setR({ ...r, experience: c }); }} />
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setR({ ...r, experience: r.experience.filter((_, x) => x !== i) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </Card>

          <Card className="space-y-3 p-5">
            <h3 className="font-semibold">Skills</h3>
            <Textarea rows={2} placeholder="JavaScript, React, Node.js, Python, SQL…" value={r.skills} onChange={(e) => setR({ ...r, skills: e.target.value })} />
          </Card>
        </div>

        {/* Preview */}
        <div className="print-area">
          <Card className="min-h-[800px] bg-white p-8 text-[13px] leading-relaxed text-zinc-800 shadow-elegant">
            <div className="border-b border-zinc-300 pb-4">
              <h1 className="text-2xl font-bold text-zinc-900">{r.name || "Your Name"}</h1>
              <p className="text-zinc-600">{r.title || "Your Title"}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {[r.email, r.phone, r.location].filter(Boolean).join(" • ")}
                {r.links && <> • {r.links}</>}
              </p>
            </div>
            {r.summary && (<section className="mt-4"><h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Summary</h2><p className="mt-1">{r.summary}</p></section>)}
            <section className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Education</h2>
              {r.education.filter((e) => e.school).map((e, i) => (
                <div key={i} className="mt-1.5"><div className="flex justify-between"><strong>{e.school}</strong><span className="text-zinc-500">{e.year}</span></div><div className="text-zinc-600">{e.degree} {e.score && `— ${e.score}`}</div></div>
              ))}
            </section>
            <section className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Experience & Projects</h2>
              {r.experience.filter((e) => e.company || e.role).map((e, i) => (
                <div key={i} className="mt-1.5">
                  <div className="flex justify-between"><strong>{e.role}</strong><span className="text-zinc-500">{e.period}</span></div>
                  <div className="italic text-zinc-600">{e.company}</div>
                  <ul className="ml-5 mt-1 list-disc">{e.bullets.split("\n").filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
                </div>
              ))}
            </section>
            {r.skills && (<section className="mt-4"><h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Skills</h2><p className="mt-1">{r.skills}</p></section>)}
          </Card>
        </div>
      </div>
    </div>
  );
}
