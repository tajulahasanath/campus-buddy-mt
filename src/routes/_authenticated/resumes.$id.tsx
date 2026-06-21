import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Check, Loader2, ChevronLeft, ChevronRight, Sparkles, GripVertical, Save } from "lucide-react";
import { EMPTY_RESUME, uid, DEFAULT_SECTION_ORDER, type ResumeData, type Education, type Experience, type Project, type Skill, type Certification, type Internship, type Training, type Reference } from "@/lib/resume/types";
import { analyzeATS, computeCompletion } from "@/lib/resume/ats";
import { TEMPLATES, type TemplateId } from "@/components/resume/templates";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { AIButton } from "@/components/resume/AIButton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resumes/$id")({
  head: () => ({ meta: [{ title: "Resume Builder — Student Hub" }] }),
  component: ResumeBuilderPage,
});

const STEPS = [
  "Personal", "Objective", "Education", "Experience", "Internships", "Projects",
  "Skills", "Certifications", "Trainings", "Achievements", "Activities", "Languages", "Hobbies", "References", "Review",
] as const;

function ResumeBuilderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [title, setTitle] = useState("Untitled Resume");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const initialLoad = useRef(true);
  const titleAuto = useRef(true); // becomes false once user types in title manually

  const { data: row, isLoading } = useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (row && initialLoad.current) {
      const d = (row.data ?? {}) as Partial<ResumeData>;
      const merged: ResumeData = { ...EMPTY_RESUME, ...d, sectionOrder: d.sectionOrder?.length ? d.sectionOrder : DEFAULT_SECTION_ORDER };
      setData(merged);
      const initialTitle = row.title || "Untitled Resume";
      setTitle(initialTitle);
      // If saved title already matches the auto pattern (or is empty), allow auto-update; else lock it.
      const autoFromName = merged.personal.name ? `${merged.personal.name} Resume` : "";
      titleAuto.current = !initialTitle || initialTitle === "Untitled Resume" || initialTitle === autoFromName;
      setTemplate((row.template_id as TemplateId) || "modern");
      initialLoad.current = false;
    }
  }, [row]);

  // Auto-derive title from full name when the user hasn't customised it.
  useEffect(() => {
    if (initialLoad.current) return;
    if (!titleAuto.current) return;
    const name = data.personal.name.trim();
    const next = name ? `${name} Resume` : "Untitled Resume";
    setTitle((t) => (t === next ? t : next));
  }, [data.personal.name]);

  const persist = async () => {
    setSaveState("saving");
    const { error } = await supabase.from("resumes").update({
      data: data as any, title, template_id: template, updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast.error("Save failed"); setSaveState("idle"); return false; }
    setSaveState("saved");
    qc.invalidateQueries({ queryKey: ["resumes"] });
    setTimeout(() => setSaveState("idle"), 1500);
    return true;
  };

  // Autosave (debounced)
  useEffect(() => {
    if (initialLoad.current) return;
    setSaveState("saving");
    const t = setTimeout(() => { void persist(); }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, title, template, id]);

  // Cleanup: if user leaves with a completely blank resume, remove the row.
  useEffect(() => {
    return () => {
      const empty = !data.personal.name && !data.objective && data.education.length === 0
        && data.experience.length === 0 && data.skills.length === 0 && data.projects.length === 0
        && data.certifications.length === 0 && data.achievements.length === 0 && data.internships.length === 0;
      if (empty && (title === "Untitled Resume" || !title)) {
        void supabase.from("resumes").delete().eq("id", id).then(() => {
          qc.invalidateQueries({ queryKey: ["resumes"] });
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, title, id]);

  const completion = useMemo(() => computeCompletion(data), [data]);
  const ats = useMemo(() => analyzeATS(data), [data]);

  if (isLoading) return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!row) return <div className="p-8 text-center"><p className="text-muted-foreground">Resume not found.</p><Button asChild className="mt-4"><Link to="/resumes">Back</Link></Button></div>;

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Top bar */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/resumes" })}><ArrowLeft className="h-4 w-4" /></Button>
          <Input value={title} onChange={(e) => { titleAuto.current = false; setTitle(e.target.value); }} className="w-64 border-0 text-base font-semibold focus-visible:ring-1" />
        </div>
        <div className="flex items-center gap-3">
          <Select value={template} onValueChange={(v) => setTemplate(v as TemplateId)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex w-40 items-center gap-2 text-xs">
            <Progress value={completion} className="h-2" /> <span className="tabular-nums">{completion}%</span>
          </div>
          <Badge variant={ats.score >= 75 ? "default" : "secondary"} className={ats.score >= 75 ? "bg-emerald-600" : ""}>ATS {ats.score}</Badge>
          <Button size="sm" variant="outline" onClick={async () => { const ok = await persist(); if (ok) toast.success("Saved"); }} disabled={saveState === "saving"}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save
          </Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {saveState === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
            {saveState === "saved" && <><Check className="h-3 w-3 text-emerald-600" /> Saved</>}
          </div>
        </div>
      </div>


      <div className="grid gap-4 lg:grid-cols-[260px_1fr_1fr]">
        {/* Step nav */}
        <Card className="no-print h-fit p-2 lg:sticky lg:top-20">
          <div className="space-y-0.5">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${i === step ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "hover:bg-muted"}`}>
                <span><span className="mr-2 text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>{s}</span>
                {i < step && <Check className="h-3.5 w-3.5 opacity-70" />}
              </button>
            ))}
          </div>
        </Card>

        {/* Form */}
        <div className="no-print min-w-0">
          <Card className="p-5">
            <StepForm step={step} data={data} setData={setData} />
            <div className="mt-6 flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="bg-gradient-to-r from-indigo-600 to-violet-600">Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              ) : (
                <Button asChild className="bg-gradient-to-r from-emerald-600 to-emerald-500"><Link to="/resumes">Done</Link></Button>
              )}
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="min-w-0">
          <ResumePreview r={data} template={template} title={title} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step Forms ---------------- */
function StepForm({ step, data, setData }: { step: number; data: ResumeData; setData: (u: ResumeData) => void }) {
  const upd = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setData({ ...data, [k]: v });

  switch (step) {
    case 0: return <PersonalStep data={data} upd={upd} />;
    case 1: return <ObjectiveStep data={data} upd={upd} />;
    case 2: return <EducationStep data={data} upd={upd} />;
    case 3: return <ExperienceStep data={data} upd={upd} />;
    case 4: return <InternshipStep data={data} upd={upd} />;
    case 5: return <ProjectsStep data={data} upd={upd} />;
    case 6: return <SkillsStep data={data} upd={upd} />;
    case 7: return <CertStep data={data} upd={upd} />;
    case 8: return <TrainingStep data={data} upd={upd} />;
    case 9: return <ListStep title="Achievements" placeholder="e.g. Winner, Smart India Hackathon 2024" items={data.achievements} onChange={(v) => upd("achievements", v)} />;
    case 10: return <ListStep title="Extra-Curricular Activities" placeholder="e.g. Class Representative, Coding Club Lead" items={data.activities} onChange={(v) => upd("activities", v)} />;
    case 11: return <ListStep title="Languages" placeholder="e.g. English (Fluent)" items={data.languages} onChange={(v) => upd("languages", v)} />;
    case 12: return <ListStep title="Hobbies" placeholder="e.g. Chess, Photography" items={data.hobbies} onChange={(v) => upd("hobbies", v)} />;
    case 13: return <ReferencesStep data={data} upd={upd} />;
    case 14: return <ReviewStep data={data} />;
    default: return null;
  }
}

type UpdFn = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => void;

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2>{action}</div>
      {children}
    </div>
  );
}

function PersonalStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const p = data.personal;
  const set = (k: keyof typeof p, v: string) => upd("personal", { ...p, [k]: v });
  return (
    <Section title="Personal Information">
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Full name *</Label><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><Label>Email *</Label><Input type="email" value={p.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><Label>Phone *</Label><Input value={p.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><Label>Address</Label><Input value={p.address} onChange={(e) => set("address", e.target.value)} /></div>
        <div><Label>City</Label><Input value={p.city} onChange={(e) => set("city", e.target.value)} /></div>
        <div><Label>State</Label><Input value={p.state} onChange={(e) => set("state", e.target.value)} /></div>
        <div><Label>Country</Label><Input value={p.country} onChange={(e) => set("country", e.target.value)} /></div>
        <div><Label>LinkedIn URL</Label><Input value={p.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" /></div>
        <div><Label>GitHub URL</Label><Input value={p.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/you" /></div>
        <div><Label>Portfolio URL</Label><Input value={p.portfolio} onChange={(e) => set("portfolio", e.target.value)} /></div>
      </div>
    </Section>
  );
}

function ObjectiveStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  return (
    <Section title="Career Objective" action={
      <div className="flex gap-2">
        <AIButton task="objective" context={`Name: ${data.personal.name}. Skills: ${data.skills.map(s => s.name).join(", ")}. Education: ${data.education[0]?.degree ?? ""}`} role={data.experience[0]?.role} label="Generate" onResult={(t) => upd("objective", t)} />
        <AIButton task="improve-objective" context={data.objective} label="Improve" onResult={(t) => upd("objective", t)} />
      </div>
    }>
      <Textarea rows={6} value={data.objective} onChange={(e) => upd("objective", e.target.value)} placeholder="Write 2–3 sentences about your career goals and what you bring to the table." />
      <p className="mt-2 text-xs text-muted-foreground">{data.objective.length} characters · aim for 50–400.</p>
    </Section>
  );
}

function EducationStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("education", [...data.education, { id: uid(), degree: "", course: "", college: "", university: "", startYear: "", endYear: "", score: "", description: "" }]);
  const update = (i: number, patch: Partial<Education>) => upd("education", data.education.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("education", data.education.filter((_, x) => x !== i));
  return (
    <Section title="Education" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.education.length === 0 && <p className="text-sm text-muted-foreground">No entries yet — click Add.</p>}
        {data.education.map((e, i) => (
          <Card key={e.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="College / School" value={e.college} onChange={(ev) => update(i, { college: ev.target.value })} />
              <Input placeholder="University" value={e.university} onChange={(ev) => update(i, { university: ev.target.value })} />
              <Input placeholder="Degree (B.Tech, M.Sc…)" value={e.degree} onChange={(ev) => update(i, { degree: ev.target.value })} />
              <Input placeholder="Course / Branch" value={e.course} onChange={(ev) => update(i, { course: ev.target.value })} />
              <Input placeholder="Start year" value={e.startYear} onChange={(ev) => update(i, { startYear: ev.target.value })} />
              <Input placeholder="End year" value={e.endYear} onChange={(ev) => update(i, { endYear: ev.target.value })} />
              <Input className="col-span-2" placeholder="CGPA / %" value={e.score} onChange={(ev) => update(i, { score: ev.target.value })} />
            </div>
            <Textarea rows={2} placeholder="Coursework, honours…" value={e.description} onChange={(ev) => update(i, { description: ev.target.value })} />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ExperienceStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("experience", [...data.experience, { id: uid(), company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
  const update = (i: number, patch: Partial<Experience>) => upd("experience", data.experience.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("experience", data.experience.filter((_, x) => x !== i));
  return (
    <Section title="Work Experience" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.experience.length === 0 && <p className="text-sm text-muted-foreground">No experience yet — skip if fresher.</p>}
        {data.experience.map((e, i) => (
          <Card key={e.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Job title" value={e.role} onChange={(ev) => update(i, { role: ev.target.value })} />
              <Input placeholder="Company" value={e.company} onChange={(ev) => update(i, { company: ev.target.value })} />
              <Input placeholder="Location" value={e.location} onChange={(ev) => update(i, { location: ev.target.value })} />
              <Input placeholder="Start (Jan 2024)" value={e.startDate} onChange={(ev) => update(i, { startDate: ev.target.value })} />
              <Input placeholder="End" value={e.endDate} disabled={e.current} onChange={(ev) => update(i, { endDate: ev.target.value })} />
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={e.current} onCheckedChange={(v) => update(i, { current: !!v })} /> Currently working</label>
            </div>
            <Textarea rows={3} placeholder={"• Built X using Y\n• Improved Z by N%"} value={e.description} onChange={(ev) => update(i, { description: ev.target.value })} />
            <div className="flex justify-between">
              <AIButton task="improve-project" context={e.description} label="Improve bullets" onResult={(t) => update(i, { description: t })} />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function InternshipStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("internships", [...data.internships, { id: uid(), company: "", role: "", duration: "", description: "" }]);
  const update = (i: number, patch: Partial<Internship>) => upd("internships", data.internships.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("internships", data.internships.filter((_, x) => x !== i));
  return (
    <Section title="Internships" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.internships.map((e, i) => (
          <Card key={e.id} className="space-y-2 p-3">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Role" value={e.role} onChange={(ev) => update(i, { role: ev.target.value })} />
              <Input placeholder="Company" value={e.company} onChange={(ev) => update(i, { company: ev.target.value })} />
              <Input placeholder="Duration (Jun–Aug 2024)" value={e.duration} onChange={(ev) => update(i, { duration: ev.target.value })} />
            </div>
            <Textarea rows={2} value={e.description} onChange={(ev) => update(i, { description: ev.target.value })} />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /></Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ProjectsStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("projects", [...data.projects, { id: uid(), title: "", link: "", github: "", startDate: "", endDate: "", tech: "", description: "" }]);
  const update = (i: number, patch: Partial<Project>) => upd("projects", data.projects.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("projects", data.projects.filter((_, x) => x !== i));
  return (
    <Section title="Projects" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.projects.map((p, i) => (
          <Card key={p.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Project title" value={p.title} onChange={(ev) => update(i, { title: ev.target.value })} />
              <Input placeholder="Tech used" value={p.tech} onChange={(ev) => update(i, { tech: ev.target.value })} />
              <Input placeholder="Live link" value={p.link} onChange={(ev) => update(i, { link: ev.target.value })} />
              <Input placeholder="GitHub link" value={p.github} onChange={(ev) => update(i, { github: ev.target.value })} />
              <Input placeholder="Start" value={p.startDate} onChange={(ev) => update(i, { startDate: ev.target.value })} />
              <Input placeholder="End" value={p.endDate} onChange={(ev) => update(i, { endDate: ev.target.value })} />
            </div>
            <Textarea rows={3} placeholder={"• Built …\n• Improved …"} value={p.description} onChange={(ev) => update(i, { description: ev.target.value })} />
            <div className="flex justify-between">
              <AIButton task="improve-project" context={`Project: ${p.title}\nTech: ${p.tech}\n${p.description}`} label="Improve description" onResult={(t) => update(i, { description: t })} />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function SkillsStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const [name, setName] = useState(""); const [cat, setCat] = useState<Skill["category"]>("Technical"); const [lvl, setLvl] = useState<Skill["level"]>("Intermediate");
  const add = () => { if (!name.trim()) return; upd("skills", [...data.skills, { id: uid(), name: name.trim(), category: cat, level: lvl }]); setName(""); };
  const remove = (i: number) => upd("skills", data.skills.filter((_, x) => x !== i));
  return (
    <Section title="Skills" action={
      <AIButton task="suggest-skills" context={data.skills.map(s => s.name).join(", ")} role={data.experience[0]?.role || data.education[0]?.course}
        label="Suggest skills" onResult={(t) => {
          const newSkills = t.split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 12);
          const existing = new Set(data.skills.map(s => s.name.toLowerCase()));
          const added = newSkills.filter(n => !existing.has(n.toLowerCase())).map(n => ({ id: uid(), name: n, category: "Technical" as const, level: "Intermediate" as const }));
          upd("skills", [...data.skills, ...added]);
        }} />
    }>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Skill name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} className="w-48" />
        <Select value={cat} onValueChange={(v) => setCat(v as Skill["category"])}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Soft">Soft</SelectItem></SelectContent></Select>
        <Select value={lvl} onValueChange={(v) => setLvl(v as Skill["level"])}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select>
        <Button onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((s, i) => (
          <Badge key={s.id} variant="secondary" className="cursor-pointer gap-1.5 py-1.5 pl-3 pr-2" onClick={() => remove(i)}>
            {s.name} <span className="text-[10px] opacity-60">· {s.level}</span> <Trash2 className="h-3 w-3" />
          </Badge>
        ))}
      </div>
    </Section>
  );
}

function CertStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("certifications", [...data.certifications, { id: uid(), name: "", org: "", date: "", url: "" }]);
  const update = (i: number, patch: Partial<Certification>) => upd("certifications", data.certifications.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("certifications", data.certifications.filter((_, x) => x !== i));
  return (
    <Section title="Certifications" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.certifications.map((c, i) => (
          <Card key={c.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Certification name" value={c.name} onChange={(ev) => update(i, { name: ev.target.value })} />
              <Input placeholder="Issuing organization" value={c.org} onChange={(ev) => update(i, { org: ev.target.value })} />
              <Input placeholder="Issue date" value={c.date} onChange={(ev) => update(i, { date: ev.target.value })} />
              <Input placeholder="Certificate URL" value={c.url} onChange={(ev) => update(i, { url: ev.target.value })} />
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /></Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function TrainingStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("trainings", [...data.trainings, { id: uid(), name: "", platform: "", duration: "", certificateUrl: "" }]);
  const update = (i: number, patch: Partial<Training>) => upd("trainings", data.trainings.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("trainings", data.trainings.filter((_, x) => x !== i));
  return (
    <Section title="Trainings & Courses" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.trainings.map((t, i) => (
          <Card key={t.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Course name" value={t.name} onChange={(ev) => update(i, { name: ev.target.value })} />
              <Input placeholder="Platform (Coursera, NPTEL…)" value={t.platform} onChange={(ev) => update(i, { platform: ev.target.value })} />
              <Input placeholder="Duration" value={t.duration} onChange={(ev) => update(i, { duration: ev.target.value })} />
              <Input placeholder="Certificate URL" value={t.certificateUrl} onChange={(ev) => update(i, { certificateUrl: ev.target.value })} />
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="mr-1 h-3.5 w-3.5" /></Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ListStep({ title, placeholder, items, onChange }: { title: string; placeholder: string; items: string[]; onChange: (v: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => { if (!v.trim()) return; onChange([...items, v.trim()]); setV(""); };
  return (
    <Section title={title}>
      <div className="mb-3 flex gap-2">
        <Input placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <Card key={i} className="flex items-center gap-2 p-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Input value={it} onChange={(e) => onChange(items.map((x, idx) => idx === i ? e.target.value : x))} className="border-0 focus-visible:ring-1" />
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onChange(items.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ReferencesStep({ data, upd }: { data: ResumeData; upd: UpdFn }) {
  const add = () => upd("references", [...data.references, { id: uid(), name: "", designation: "", company: "", email: "", phone: "" }]);
  const update = (i: number, patch: Partial<Reference>) => upd("references", data.references.map((e, x) => x === i ? { ...e, ...patch } : e));
  const remove = (i: number) => upd("references", data.references.filter((_, x) => x !== i));
  return (
    <Section title="References" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>}>
      <div className="space-y-3">
        {data.references.map((r, i) => (
          <Card key={r.id} className="space-y-2 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Name" value={r.name} onChange={(ev) => update(i, { name: ev.target.value })} />
              <Input placeholder="Designation" value={r.designation} onChange={(ev) => update(i, { designation: ev.target.value })} />
              <Input placeholder="Company" value={r.company} onChange={(ev) => update(i, { company: ev.target.value })} />
              <Input placeholder="Email" value={r.email} onChange={(ev) => update(i, { email: ev.target.value })} />
              <Input placeholder="Phone" value={r.phone} onChange={(ev) => update(i, { phone: ev.target.value })} />
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ReviewStep({ data }: { data: ResumeData }) {
  const ats = analyzeATS(data);
  return (
    <Section title="ATS Review & Score">
      <Card className="mb-4 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-indigo-950/30 dark:to-violet-950/30">
        <div className="flex items-end gap-3">
          <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-300">{ats.score}</div>
          <div className="pb-1.5 text-sm text-muted-foreground">ATS Score / 100</div>
        </div>
        <Progress value={ats.score} className="mt-3 h-2.5" />
      </Card>

      {ats.strengths.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-emerald-700 dark:text-emerald-400">✓ Strengths</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm">{ats.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {ats.missing.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-red-600">✕ Missing</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm">{ats.missing.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {ats.suggestions.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">💡 Suggestions</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm">{ats.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}

      <Card className="bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <span>Get AI-powered feedback tailored to your resume:</span>
        </div>
        <div className="mt-3">
          <AIButton task="ats-feedback" context={JSON.stringify({ personal: data.personal, objective: data.objective, projects: data.projects.map(p => p.title), skills: data.skills.map(s => s.name) })}
            label="Generate AI ATS feedback" onResult={(t) => alert(t)} size="default" />
        </div>
      </Card>
    </Section>
  );
}
