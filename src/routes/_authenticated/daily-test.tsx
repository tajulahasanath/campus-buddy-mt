import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, RotateCcw, Trophy, CheckCircle2, AlertCircle, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/daily-test")({
  head: () => ({ meta: [{ title: "Daily Interview Test — Student Hub" }] }),
  component: DailyTestPage,
});

type MCQ = { q: string; opts: string[]; answer: number; explain: string };
type HR = { q: string; themes: string[]; tip: string };

const MCQ_POOL: MCQ[] = [
  { q: "Which data structure uses LIFO order?", opts: ["Queue", "Stack", "Heap", "Tree"], answer: 1,
    explain: "Stacks add/remove at the top → Last In First Out." },
  { q: "Time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1,
    explain: "Halves the search space each step." },
  { q: "Which is NOT a JavaScript primitive?", opts: ["string", "number", "object", "boolean"], answer: 2,
    explain: "Object is a reference type, not a primitive." },
  { q: "Which SQL clause filters groups?", opts: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answer: 1,
    explain: "HAVING filters after aggregation; WHERE filters rows before." },
];
const APT_POOL: MCQ[] = [
  { q: "If 5 workers build a wall in 12 days, how many days for 6 workers?", opts: ["10", "11", "9", "8"], answer: 0,
    explain: "Work = 60 worker-days. 60 / 6 = 10." },
  { q: "20% of 250 = ?", opts: ["40", "50", "55", "60"], answer: 1, explain: "0.20 × 250 = 50." },
  { q: "Average of first 5 natural numbers?", opts: ["2", "2.5", "3", "3.5"], answer: 2,
    explain: "(1+2+3+4+5)/5 = 3." },
];
const CODE_POOL: MCQ[] = [
  { q: "Output?\n```js\nconsole.log(typeof null);\n```", opts: ["null", "object", "undefined", "string"], answer: 1,
    explain: "Historical JS bug — typeof null === 'object'." },
  { q: "Output?\n```js\nconsole.log([1,2,3]+[4,5,6]);\n```", opts: ["[1,2,3,4,5,6]", "1,2,34,5,6", "Error", "NaN"], answer: 1,
    explain: "Arrays are coerced to strings via join(',')." },
  { q: "Output?\n```js\nconsole.log(2 == '2');\n```", opts: ["true", "false", "Error", "NaN"], answer: 0,
    explain: "Loose equality coerces types." },
];
const HR_POOL: HR[] = [
  { q: "Tell me about a time you handled a difficult teammate.",
    themes: ["listen", "understand", "communicate", "respect", "perspective", "conflict", "resolve", "team", "calm", "feedback", "empathy", "collaborate", "discuss"],
    tip: "Use the STAR format: Situation, Task, Action, Result. Stay positive about the other person." },
  { q: "Why should we hire you?",
    themes: ["skill", "skills", "learn", "learning", "dedicat", "passion", "team", "contribut", "value", "experience", "project", "fit", "grow", "strength", "deliver"],
    tip: "Map two of your strengths to the job, then add a quick proof point (project or result)." },
  { q: "Where do you see yourself in 5 years?",
    themes: ["grow", "growth", "skill", "lead", "leadership", "learn", "expert", "responsibility", "team", "career", "contribut", "develop", "mentor", "senior"],
    tip: "Show ambition + alignment with the company's path. Avoid naming exact titles." },
  { q: "Describe a project you're proud of.",
    themes: ["built", "built ", "team", "challenge", "solve", "impact", "result", "learn", "deploy", "technology", "tech", "ship", "user", "design", "improv"],
    tip: "STAR again. End with a measurable result (users, %, time saved)." },
  { q: "What is your greatest weakness?",
    themes: ["aware", "improv", "feedback", "learn", "course", "practice", "mentor", "balance", "delegate", "time", "perfection", "public speaking", "step", "working on"],
    tip: "Pick a real weakness, then show the concrete step you take to manage it." },
];

const dayIndex = () => Math.floor(Date.now() / 86_400_000);
const pickToday = <T,>(arr: T[]) => arr[dayIndex() % arr.length];

type Verdict = "Correct" | "Partially correct" | "Needs improvement";
type HRResult = { score: number; verdict: Verdict; matched: string[]; notes: string[] };

/** Lightweight semantic-ish HR answer scorer (0–10). */
function evaluateHR(answer: string, hr: HR): HRResult {
  const text = answer.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const matched = Array.from(new Set(hr.themes.filter((k) => text.includes(k))));
  const notes: string[] = [];
  let score = 0;

  // Relevance via theme keyword coverage (max 6)
  const coverage = Math.min(matched.length / Math.max(3, Math.ceil(hr.themes.length / 3)), 1);
  score += Math.round(coverage * 6);
  if (matched.length === 0) notes.push("Mention concrete themes the question is asking about.");
  else if (matched.length < 3) notes.push("Cover a couple more relevant points to strengthen your answer.");

  // Completeness via word count (max 2)
  if (words.length >= 60) score += 2;
  else if (words.length >= 30) score += 1;
  else notes.push("Aim for 60–120 words; you're giving too little detail.");

  // Professional tone — penalise slang/filler (max 1)
  const slang = ["idk", "dunno", "lol", "lmao", "yeah yeah", "u know", "stuff like that", "blah"];
  const hasSlang = slang.some((s) => text.includes(s));
  if (!hasSlang && words.length > 10) score += 1;
  else if (hasSlang) notes.push("Avoid filler/slang; keep the tone professional.");

  // Grammar proxy — starts capitalised, has a sentence terminator (max 1)
  const trimmed = answer.trim();
  const wellFormed = /^[A-Z]/.test(trimmed) && /[.!?]\s*$/.test(trimmed);
  if (wellFormed) score += 1;
  else if (words.length > 8) notes.push("Use full sentences with capitals and end punctuation.");

  score = Math.max(0, Math.min(10, score));
  const verdict: Verdict = score >= 8 ? "Correct" : score >= 5 ? "Partially correct" : "Needs improvement";
  if (verdict !== "Correct") notes.push(hr.tip);
  return { score, verdict, matched, notes };
}

type Entry = { day: number; total: number; correct: number; hrScore: number; ts: number };
const HIST_KEY = "dailytest:history:v2";
const loadHist = (): Entry[] => { try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch { return []; } };
const saveHist = (h: Entry[]) => { try { localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-30))); } catch { /* */ } };

function DailyTestPage() {
  const { t } = useI18n();
  const mcq = useMemo(() => pickToday(MCQ_POOL), []);
  const apt = useMemo(() => pickToday(APT_POOL), []);
  const code = useMemo(() => pickToday(CODE_POOL), []);
  const hr = useMemo(() => pickToday(HR_POOL), []);

  const [mcqA, setMcqA] = useState("");
  const [aptA, setAptA] = useState("");
  const [codeA, setCodeA] = useState("");
  const [hrA, setHrA] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<Entry[]>([]);

  useEffect(() => { setHistory(loadHist()); }, []);

  const report = useMemo(() => {
    if (!submitted) return null;
    const items = [
      { kind: "MCQ", q: mcq.q, your: mcq.opts[Number(mcqA)] ?? "—", correct: mcq.opts[mcq.answer], pass: Number(mcqA) === mcq.answer, explain: mcq.explain },
      { kind: "Aptitude", q: apt.q, your: apt.opts[Number(aptA)] ?? "—", correct: apt.opts[apt.answer], pass: Number(aptA) === apt.answer, explain: apt.explain },
      { kind: "Code Output", q: code.q, your: code.opts[Number(codeA)] ?? "—", correct: code.opts[code.answer], pass: Number(codeA) === code.answer, explain: code.explain },
    ];
    const hrRes = evaluateHR(hrA, hr);
    const objectiveCorrect = items.filter((i) => i.pass).length;
    const total = items.length + 1;
    // HR contributes 1 "correct" if score >= 8, 0.5 if partial — round half up.
    const hrPoint = hrRes.score >= 8 ? 1 : hrRes.score >= 5 ? 0.5 : 0;
    const totalScore = objectiveCorrect + hrPoint;
    return { items, hrRes, total, totalScore, objectiveCorrect };
  }, [submitted, mcqA, aptA, codeA, hrA, mcq, apt, code, hr]);

  const submit = () => {
    if (!mcqA || !aptA || !codeA || hrA.trim().length < 10) {
      toast.error("Answer all questions first (HR answer must be at least 10 chars).");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      const r = (() => {
        const items = [
          { pass: Number(mcqA) === mcq.answer }, { pass: Number(aptA) === apt.answer }, { pass: Number(codeA) === code.answer },
        ];
        const hrRes = evaluateHR(hrA, hr);
        const correct = items.filter((i) => i.pass).length + (hrRes.score >= 8 ? 1 : 0);
        const entry: Entry = { day: dayIndex(), total: 4, correct, hrScore: hrRes.score, ts: Date.now() };
        const next = [...history, entry];
        setHistory(next); saveHist(next);
        return correct;
      })();
      toast.success(`Test complete — ${r} / 4 strong answers`);
    }, 0);
  };

  const retake = () => {
    setMcqA(""); setAptA(""); setCodeA(""); setHrA(""); setSubmitted(false);
  };

  const answered = [mcqA, aptA, codeA].filter(Boolean).length + (hrA.trim().length >= 10 ? 1 : 0);
  const progressPct = Math.round((answered / 4) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Daily Interview Test")}</h1>
          <p className="mt-1 text-muted-foreground">Four mixed questions every day — HR, technical, aptitude, code output.</p>
        </div>
        {submitted && report && (
          <Card className="flex items-center gap-3 px-4 py-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-xs text-muted-foreground">Today</div>
              <div className="text-lg font-bold">{report.totalScore} / {report.total}</div>
            </div>
          </Card>
        )}
      </div>

      {!submitted && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{answered}/4</span></div>
          <Progress value={progressPct} className="h-2" />
        </div>
      )}

      {/* Question cards (always shown) */}
      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">Technical · MCQ</Badge>
        <p className="font-medium">{mcq.q}</p>
        <RadioGroup value={mcqA} onValueChange={setMcqA} className="mt-3 space-y-2" disabled={submitted}>
          {mcq.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === mcq.answer ? "border-green-500 bg-green-500/10" : ""} ${submitted && String(i) === mcqA && i !== mcq.answer ? "border-red-500 bg-red-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
        {submitted && <p className="mt-3 text-xs text-muted-foreground"><strong>Why: </strong>{mcq.explain}</p>}
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">Coding Output</Badge>
        <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{code.q}</pre>
        <RadioGroup value={codeA} onValueChange={setCodeA} className="mt-3 space-y-2" disabled={submitted}>
          {code.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === code.answer ? "border-green-500 bg-green-500/10" : ""} ${submitted && String(i) === codeA && i !== code.answer ? "border-red-500 bg-red-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
        {submitted && <p className="mt-3 text-xs text-muted-foreground"><strong>Why: </strong>{code.explain}</p>}
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">Aptitude</Badge>
        <p className="font-medium">{apt.q}</p>
        <RadioGroup value={aptA} onValueChange={setAptA} className="mt-3 space-y-2" disabled={submitted}>
          {apt.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === apt.answer ? "border-green-500 bg-green-500/10" : ""} ${submitted && String(i) === aptA && i !== apt.answer ? "border-red-500 bg-red-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
        {submitted && <p className="mt-3 text-xs text-muted-foreground"><strong>Why: </strong>{apt.explain}</p>}
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">HR</Badge>
        <p className="font-medium">{hr.q}</p>
        <Textarea value={hrA} onChange={(e) => setHrA(e.target.value)} disabled={submitted}
          placeholder="Answer naturally — focus on relevant themes, real examples, and a clear outcome." rows={6} className="mt-3" />
        {!submitted && <p className="mt-1 text-xs text-muted-foreground">Evaluated on relevance, completeness, tone and grammar — not exact wording.</p>}
      </Card>

      <div className="flex gap-3">
        {!submitted ? (
          <Button onClick={submit} className="bg-gradient-to-r from-indigo-600 to-violet-600">
            <ClipboardCheck className="mr-2 h-4 w-4" />{t("Submit")}
          </Button>
        ) : (
          <Button onClick={retake} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />{t("Retake Test")}
          </Button>
        )}
      </div>

      {/* Final report */}
      {submitted && report && (
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-bold">Final Report</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-3"><div className="text-xs text-muted-foreground">Total score</div><div className="text-2xl font-bold">{report.totalScore} / {report.total}</div></Card>
            <Card className="p-3"><div className="text-xs text-muted-foreground">MCQ correct</div><div className="text-2xl font-bold text-emerald-600">{report.objectiveCorrect} / 3</div></Card>
            <Card className="p-3"><div className="text-xs text-muted-foreground">HR score</div><div className="text-2xl font-bold text-indigo-600">{report.hrRes.score} / 10</div></Card>
          </div>

          <div className="space-y-3">
            {report.items.map((it, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline">{it.kind}</Badge>
                  {it.pass ? <Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" />Correct</Badge>
                    : <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Wrong</Badge>}
                </div>
                <p className="text-sm font-medium">{it.q}</p>
                <p className="mt-1 text-xs">Your answer: <span className="font-mono">{it.your}</span></p>
                {!it.pass && <p className="text-xs text-muted-foreground">Correct: <span className="font-mono">{it.correct}</span> — {it.explain}</p>}
              </div>
            ))}
            <div className="rounded-md border p-3">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline">HR</Badge>
                {report.hrRes.verdict === "Correct" && <Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" />Correct</Badge>}
                {report.hrRes.verdict === "Partially correct" && <Badge className="bg-amber-500"><AlertCircle className="mr-1 h-3 w-3" />Partially correct</Badge>}
                {report.hrRes.verdict === "Needs improvement" && <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Needs improvement</Badge>}
                <span className="text-xs text-muted-foreground">Score {report.hrRes.score}/10</span>
              </div>
              <p className="text-sm font-medium">{hr.q}</p>
              {report.hrRes.matched.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Themes covered: {report.hrRes.matched.join(", ")}</p>
              )}
              {report.hrRes.notes.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                  {report.hrRes.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Come back tomorrow for a fresh set of questions. 🚀</p>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-3 font-semibold">Score history</h3>
          <div className="space-y-1 text-sm">
            {history.slice().reverse().slice(0, 10).map((h, i) => (
              <div key={i} className="flex justify-between border-b py-1 last:border-0">
                <span className="text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
                <span className="font-medium">{h.correct} / {h.total} · HR {h.hrScore}/10</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
