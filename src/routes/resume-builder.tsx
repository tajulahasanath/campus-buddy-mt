import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, LogIn } from "lucide-react";
import { createEmptyResume, normalizeResumeData, getResumeTitle, uid, type ResumeData } from "@/lib/resume/types";
import { computeCompletion } from "@/lib/resume/ats";
import { TEMPLATES, type TemplateId } from "@/components/resume/templates";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { toast } from "sonner";

const STORAGE_KEY = "studenthub.publicResume.v1";
const TEMPLATE_KEY = "studenthub.publicResume.template.v1";

export const Route = createFileRoute("/resume-builder")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Free Resume Builder — Student Hub" },
      { name: "description", content: "Build an ATS-friendly resume for free — no signup needed. Export to PDF or DOCX." },
    ],
  }),
  component: PublicResumeBuilder,
});

function PublicResumeBuilder() {
  const [data, setData] = useState<ResumeData>(() => createEmptyResume());
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(normalizeResumeData(JSON.parse(raw)));
      const t = localStorage.getItem(TEMPLATE_KEY);
      if (t) setTemplate(t as TemplateId);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(TEMPLATE_KEY, template); } catch { /* ignore */ }
  }, [template, hydrated]);

  const completion = useMemo(() => computeCompletion(data), [data]);
  const title = getResumeTitle(data, "My Resume");

  const setPersonal = (k: keyof ResumeData["personal"], v: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  const addSkill = () => setData((d) => ({ ...d, skills: [...d.skills, { id: uid(), name: "", level: "Intermediate", category: "Technical" }] }));
  const updSkill = (i: number, name: string) =>
    setData((d) => ({ ...d, skills: d.skills.map((s, x) => (x === i ? { ...s, name } : s)) }));
  const rmSkill = (i: number) => setData((d) => ({ ...d, skills: d.skills.filter((_, x) => x !== i) }));

  const addEdu = () =>
    setData((d) => ({ ...d, education: [...d.education, { id: uid(), degree: "", course: "", college: "", university: "", startYear: "", endYear: "", score: "", description: "" }] }));
  const updEdu = (i: number, patch: Partial<ResumeData["education"][number]>) =>
    setData((d) => ({ ...d, education: d.education.map((e, x) => (x === i ? { ...e, ...patch } : e)) }));
  const rmEdu = (i: number) => setData((d) => ({ ...d, education: d.education.filter((_, x) => x !== i) }));

  const addProject = () =>
    setData((d) => ({ ...d, projects: [...d.projects, { id: uid(), title: "", link: "", github: "", startDate: "", endDate: "", tech: "", description: "" }] }));
  const updProject = (i: number, patch: Partial<ResumeData["projects"][number]>) =>
    setData((d) => ({ ...d, projects: d.projects.map((p, x) => (x === i ? { ...p, ...patch } : p)) }));
  const rmProject = (i: number) => setData((d) => ({ ...d, projects: d.projects.filter((_, x) => x !== i) }));

  const reset = () => {
    if (!confirm("Clear this resume? This can't be undone.")) return;
    setData(createEmptyResume());
    toast.success("Reset");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button size="icon" variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">Free builder · saved in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={template} onValueChange={(v) => setTemplate(v as TemplateId)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="hidden w-32 items-center gap-2 text-xs md:flex">
              <Progress value={completion} className="h-2" /><span className="tabular-nums">{completion}%</span>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex"><Save className="mr-1 h-3 w-3" /> Auto-saved</Badge>
            <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-violet-600">
              <Link to="/auth"><LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign in to save online</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Personal Information</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Full name</Label><Input value={data.personal.name} onChange={(e) => setPersonal("name", e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={data.personal.email} onChange={(e) => setPersonal("email", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={data.personal.phone} onChange={(e) => setPersonal("phone", e.target.value)} /></div>
              <div><Label>City</Label><Input value={data.personal.city} onChange={(e) => setPersonal("city", e.target.value)} /></div>
              <div><Label>LinkedIn</Label><Input value={data.personal.linkedin} onChange={(e) => setPersonal("linkedin", e.target.value)} placeholder="linkedin.com/in/you" /></div>
              <div><Label>GitHub</Label><Input value={data.personal.github} onChange={(e) => setPersonal("github", e.target.value)} placeholder="github.com/you" /></div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Career Objective</h2>
            <Textarea rows={4} value={data.objective} onChange={(e) => setData((d) => ({ ...d, objective: e.target.value }))}
              placeholder="2–3 sentences about your goals and strengths." />
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Education</h2>
              <Button size="sm" onClick={addEdu}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
            </div>
            <div className="space-y-3">
              {data.education.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
              {data.education.map((e, i) => (
                <Card key={e.id} className="space-y-2 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="College" value={e.college} onChange={(ev) => updEdu(i, { college: ev.target.value })} />
                    <Input placeholder="Degree" value={e.degree} onChange={(ev) => updEdu(i, { degree: ev.target.value })} />
                    <Input placeholder="Start year" value={e.startYear} onChange={(ev) => updEdu(i, { startYear: ev.target.value })} />
                    <Input placeholder="End year" value={e.endYear} onChange={(ev) => updEdu(i, { endYear: ev.target.value })} />
                    <Input className="col-span-2" placeholder="CGPA / %" value={e.score} onChange={(ev) => updEdu(i, { score: ev.target.value })} />
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => rmEdu(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Skills</h2>
              <Button size="sm" onClick={addSkill}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
            </div>
            <div className="space-y-2">
              {data.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills yet.</p>}
              {data.skills.map((s, i) => (
                <div key={s.id} className="flex gap-2">
                  <Input placeholder="e.g. React, Python" value={s.name} onChange={(e) => updSkill(i, e.target.value)} />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => rmSkill(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projects</h2>
              <Button size="sm" onClick={addProject}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
            </div>
            <div className="space-y-3">
              {data.projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
              {data.projects.map((p, i) => (
                <Card key={p.id} className="space-y-2 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Title" value={p.title} onChange={(e) => updProject(i, { title: e.target.value })} />
                    <Input placeholder="Tech stack" value={p.tech} onChange={(e) => updProject(i, { tech: e.target.value })} />
                    <Input className="col-span-2" placeholder="Link (github / demo)" value={p.link} onChange={(e) => updProject(i, { link: e.target.value })} />
                  </div>
                  <Textarea rows={2} placeholder="What did you build? Impact?" value={p.description} onChange={(e) => updProject(i, { description: e.target.value })} />
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => rmProject(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button>
                </Card>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={reset} className="text-destructive"><Trash2 className="mr-1.5 h-4 w-4" /> Reset resume</Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-[76px] lg:h-[calc(100vh-96px)]">
          <ResumePreview r={data} template={template} title={title} />
        </div>
      </div>
    </div>
  );
}
