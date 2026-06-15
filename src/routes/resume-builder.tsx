import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Trash2, Download, Printer, Save, ArrowLeft, FileText,
} from "lucide-react";

export const Route = createFileRoute("/resume-builder")({
  component: ResumeBuilderPage,
  head: () => ({
    meta: [
      { title: "Resume Builder — Student Hub" },
      { name: "description", content: "Build an ATS-friendly resume with live preview, save, print and PDF download." },
    ],
  }),
});

type Item = { id: string; [k: string]: string };
type ResumeData = {
  personal: {
    name: string; role: string; email: string; phone: string;
    location: string; linkedin: string; github: string; portfolio: string;
  };
  objective: string;
  education: Item[];
  skills: string;
  projects: Item[];
  internships: Item[];
  certifications: Item[];
  achievements: string;
  extras: string;
};

const STORAGE_KEY = "studenthub.resume.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const empty: ResumeData = {
  personal: { name: "", role: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  objective: "",
  education: [{ id: uid(), school: "", degree: "", year: "", score: "" }],
  skills: "",
  projects: [{ id: uid(), title: "", tech: "", link: "", description: "" }],
  internships: [{ id: uid(), company: "", role: "", duration: "", description: "" }],
  certifications: [{ id: uid(), name: "", issuer: "", year: "" }],
  achievements: "",
  extras: "",
};

function load(): ResumeData {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch { return empty; }
}

function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setData(load()); setLoaded(true); }, []);

  // Autosave
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 500);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const setPersonal = (k: keyof ResumeData["personal"], v: string) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  const updateItem = (key: "education" | "projects" | "internships" | "certifications", id: string, k: string, v: string) =>
    setData((d) => ({ ...d, [key]: d[key].map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));

  const addItem = (key: "education" | "projects" | "internships" | "certifications", template: Item) =>
    setData((d) => ({ ...d, [key]: [...d[key], { ...template, id: uid() }] }));

  const removeItem = (key: "education" | "projects" | "internships" | "certifications", id: string) =>
    setData((d) => ({ ...d, [key]: d[key].filter((it) => it.id !== id) }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast.success("Resume saved");
  };

  const handlePrint = () => window.print();
  const handlePDF = () => {
    toast.info("Use the print dialog → Save as PDF");
    setTimeout(() => window.print(), 300);
  };

  const handleReset = () => {
    if (confirm("Clear all fields and start over?")) {
      setData({ ...empty, education: [{ id: uid(), school: "", degree: "", year: "", score: "" }] });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const completion = useMemo(() => {
    const checks = [
      data.personal.name, data.personal.email, data.personal.phone,
      data.objective, data.skills,
      data.education.some((e) => e.school), data.projects.some((p) => p.title),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      {/* Header */}
      <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">Resume Builder</div>
                <div className="text-xs text-slate-500">{completion}% complete · Autosaved</div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}><Save className="mr-1.5 h-4 w-4" />Save</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Print</span></Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handlePDF}>
              <Download className="mr-1.5 h-4 w-4" />PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card className="no-print p-4 lg:p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="experience">Work</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="more">More</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full Name" value={data.personal.name} onChange={(v) => setPersonal("name", v)} />
                  <Field label="Job Title / Role" value={data.personal.role} onChange={(v) => setPersonal("role", v)} placeholder="e.g. Frontend Developer" />
                  <Field label="Email" value={data.personal.email} onChange={(v) => setPersonal("email", v)} type="email" />
                  <Field label="Phone" value={data.personal.phone} onChange={(v) => setPersonal("phone", v)} />
                  <Field label="Location" value={data.personal.location} onChange={(v) => setPersonal("location", v)} />
                  <Field label="LinkedIn" value={data.personal.linkedin} onChange={(v) => setPersonal("linkedin", v)} />
                  <Field label="GitHub" value={data.personal.github} onChange={(v) => setPersonal("github", v)} />
                  <Field label="Portfolio" value={data.personal.portfolio} onChange={(v) => setPersonal("portfolio", v)} />
                </div>
                <div>
                  <Label>Career Objective</Label>
                  <Textarea rows={4} value={data.objective} onChange={(e) => setData((d) => ({ ...d, objective: e.target.value }))} placeholder="A short summary of your goals and strengths..." />
                </div>
                <div>
                  <Label>Skills (comma-separated)</Label>
                  <Textarea rows={3} value={data.skills} onChange={(e) => setData((d) => ({ ...d, skills: e.target.value }))} placeholder="React, TypeScript, Node.js, SQL, Python" />
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-3 pt-4">
                {data.education.map((it) => (
                  <ItemCard key={it.id} onRemove={() => removeItem("education", it.id)}>
                    <Field label="School / University" value={it.school || ""} onChange={(v) => updateItem("education", it.id, "school", v)} />
                    <Field label="Degree / Course" value={it.degree || ""} onChange={(v) => updateItem("education", it.id, "degree", v)} />
                    <Field label="Year" value={it.year || ""} onChange={(v) => updateItem("education", it.id, "year", v)} />
                    <Field label="CGPA / %" value={it.score || ""} onChange={(v) => updateItem("education", it.id, "score", v)} />
                  </ItemCard>
                ))}
                <AddBtn label="Add Education" onClick={() => addItem("education", { id: "", school: "", degree: "", year: "", score: "" })} />
              </TabsContent>

              <TabsContent value="experience" className="space-y-3 pt-4">
                <div className="text-sm font-semibold text-slate-700">Internships</div>
                {data.internships.map((it) => (
                  <ItemCard key={it.id} onRemove={() => removeItem("internships", it.id)}>
                    <Field label="Company" value={it.company || ""} onChange={(v) => updateItem("internships", it.id, "company", v)} />
                    <Field label="Role" value={it.role || ""} onChange={(v) => updateItem("internships", it.id, "role", v)} />
                    <Field label="Duration" value={it.duration || ""} onChange={(v) => updateItem("internships", it.id, "duration", v)} placeholder="May 2025 - Jul 2025" />
                    <div className="sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea rows={3} value={it.description || ""} onChange={(e) => updateItem("internships", it.id, "description", e.target.value)} />
                    </div>
                  </ItemCard>
                ))}
                <AddBtn label="Add Internship" onClick={() => addItem("internships", { id: "", company: "", role: "", duration: "", description: "" })} />
              </TabsContent>

              <TabsContent value="projects" className="space-y-3 pt-4">
                {data.projects.map((it) => (
                  <ItemCard key={it.id} onRemove={() => removeItem("projects", it.id)}>
                    <Field label="Project Title" value={it.title || ""} onChange={(v) => updateItem("projects", it.id, "title", v)} />
                    <Field label="Tech Stack" value={it.tech || ""} onChange={(v) => updateItem("projects", it.id, "tech", v)} />
                    <Field label="Link" value={it.link || ""} onChange={(v) => updateItem("projects", it.id, "link", v)} />
                    <div className="sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea rows={3} value={it.description || ""} onChange={(e) => updateItem("projects", it.id, "description", e.target.value)} />
                    </div>
                  </ItemCard>
                ))}
                <AddBtn label="Add Project" onClick={() => addItem("projects", { id: "", title: "", tech: "", link: "", description: "" })} />
              </TabsContent>

              <TabsContent value="more" className="space-y-4 pt-4">
                <div className="text-sm font-semibold text-slate-700">Certifications</div>
                {data.certifications.map((it) => (
                  <ItemCard key={it.id} onRemove={() => removeItem("certifications", it.id)}>
                    <Field label="Certificate" value={it.name || ""} onChange={(v) => updateItem("certifications", it.id, "name", v)} />
                    <Field label="Issuer" value={it.issuer || ""} onChange={(v) => updateItem("certifications", it.id, "issuer", v)} />
                    <Field label="Year" value={it.year || ""} onChange={(v) => updateItem("certifications", it.id, "year", v)} />
                  </ItemCard>
                ))}
                <AddBtn label="Add Certification" onClick={() => addItem("certifications", { id: "", name: "", issuer: "", year: "" })} />

                <div className="pt-2">
                  <Label>Achievements</Label>
                  <Textarea rows={3} value={data.achievements} onChange={(e) => setData((d) => ({ ...d, achievements: e.target.value }))} placeholder="One per line" />
                </div>
                <div>
                  <Label>Extra-curricular Activities</Label>
                  <Textarea rows={3} value={data.extras} onChange={(e) => setData((d) => ({ ...d, extras: e.target.value }))} placeholder="One per line" />
                </div>
                <Button variant="outline" className="w-full" onClick={handleReset}>
                  <Trash2 className="mr-2 h-4 w-4" /> Reset Resume
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Preview */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <ResumePreview data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-lg border border-slate-200 bg-slate-50/50 p-3 pr-10">
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      <button onClick={onRemove} className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-white hover:text-red-600" aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" className="w-full border-dashed" onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const achievements = data.achievements.split("\n").map((s) => s.trim()).filter(Boolean);
  const extras = data.extras.split("\n").map((s) => s.trim()).filter(Boolean);
  const p = data.personal;
  return (
    <div className="print-area mx-auto max-w-[800px] bg-white p-8 text-slate-900 shadow-lg ring-1 ring-slate-200 print:shadow-none print:ring-0" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13, lineHeight: 1.5 }}>
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{p.name || "Your Name"}</h1>
        {p.role && <div className="mt-1 text-sm font-medium text-slate-600">{p.role}</div>}
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-700">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>· {p.phone}</span>}
          {p.location && <span>· {p.location}</span>}
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 text-xs text-blue-700">
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>· {p.github}</span>}
          {p.portfolio && <span>· {p.portfolio}</span>}
        </div>
      </div>

      {data.objective && (
        <Section title="Objective">
          <p>{data.objective}</p>
        </Section>
      )}

      {data.education.some((e) => e.school || e.degree) && (
        <Section title="Education">
          {data.education.filter((e) => e.school || e.degree).map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between font-semibold"><span>{e.school}</span><span>{e.year}</span></div>
              <div className="text-sm text-slate-700">{e.degree}{e.score ? ` · ${e.score}` : ""}</div>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span key={i} className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {data.projects.some((p) => p.title) && (
        <Section title="Projects">
          {data.projects.filter((p) => p.title).map((p) => (
            <div key={p.id} className="mb-2">
              <div className="font-semibold">{p.title}{p.tech ? <span className="font-normal text-slate-600"> — {p.tech}</span> : null}</div>
              {p.link && <div className="text-xs text-blue-700">{p.link}</div>}
              {p.description && <p className="text-sm">{p.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.internships.some((i) => i.company) && (
        <Section title="Internships">
          {data.internships.filter((i) => i.company).map((i) => (
            <div key={i.id} className="mb-2">
              <div className="flex justify-between font-semibold"><span>{i.role} — {i.company}</span><span>{i.duration}</span></div>
              {i.description && <p className="text-sm">{i.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.certifications.some((c) => c.name) && (
        <Section title="Certifications">
          <ul className="list-disc pl-5">
            {data.certifications.filter((c) => c.name).map((c) => (
              <li key={c.id}>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</li>
            ))}
          </ul>
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc pl-5">{achievements.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </Section>
      )}

      {extras.length > 0 && (
        <Section title="Extra-curricular Activities">
          <ul className="list-disc pl-5">{extras.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h2 className="mb-1.5 border-b border-slate-300 pb-0.5 text-sm font-bold uppercase tracking-wider text-slate-800">{title}</h2>
      {children}
    </div>
  );
}
