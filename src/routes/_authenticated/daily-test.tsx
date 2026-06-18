import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/daily-test")({
  head: () => ({ meta: [{ title: "Daily Interview Test — Student Hub" }] }),
  component: DailyTestPage,
});

type MCQ = { q: string; opts: string[]; answer: number };
const MCQ_POOL: MCQ[] = [
  { q: "Which data structure uses LIFO order?", opts: ["Queue", "Stack", "Heap", "Tree"], answer: 1 },
  { q: "Time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1 },
  { q: "Which is NOT a JavaScript primitive?", opts: ["string", "number", "object", "boolean"], answer: 2 },
];
const APT_POOL: MCQ[] = [
  { q: "If 5 workers build a wall in 12 days, how many days for 6 workers?", opts: ["10", "11", "9", "8"], answer: 0 },
  { q: "20% of 250 = ?", opts: ["40", "50", "55", "60"], answer: 1 },
];
const CODE_POOL = [
  { q: "What is the output?\n```js\nconsole.log(typeof null);\n```", opts: ["null", "object", "undefined", "string"], answer: 1 },
  { q: "What is the output?\n```js\nconsole.log([1,2,3]+[4,5,6]);\n```", opts: ["[1,2,3,4,5,6]", "1,2,34,5,6", "Error", "NaN"], answer: 1 },
];
const HR_POOL = [
  "Tell me about a time you handled a difficult teammate.",
  "Why should we hire you?",
  "Where do you see yourself in 5 years?",
  "Describe a project you're proud of.",
];

const dayIndex = () => Math.floor(Date.now() / 86_400_000);
const pickToday = <T,>(arr: T[]) => arr[dayIndex() % arr.length];

type History = { day: number; score: number; total: number; ts: number }[];
const HIST_KEY = "dailytest:history";
const loadHist = (): History => { try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch { return []; } };
const saveHist = (h: History) => { try { localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-30))); } catch {} };

function DailyTestPage() {
  const { t } = useI18n();
  const [mcq] = useState(() => pickToday(MCQ_POOL));
  const [apt] = useState(() => pickToday(APT_POOL));
  const [code] = useState(() => pickToday(CODE_POOL));
  const [hr] = useState(() => pickToday(HR_POOL));

  const [mcqA, setMcqA] = useState<string>("");
  const [aptA, setAptA] = useState<string>("");
  const [codeA, setCodeA] = useState<string>("");
  const [hrA, setHrA] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<History>([]);

  useEffect(() => { setHistory(loadHist()); }, []);

  const submit = () => {
    let s = 0;
    if (mcqA !== "" && Number(mcqA) === mcq.answer) s++;
    if (aptA !== "" && Number(aptA) === apt.answer) s++;
    if (codeA !== "" && Number(codeA) === code.answer) s++;
    if (hrA.trim().length >= 30) s++;
    setScore(s); setSubmitted(true);
    const next = [...history, { day: dayIndex(), score: s, total: 4, ts: Date.now() }];
    setHistory(next); saveHist(next);
    toast.success(`Scored ${s} / 4`);
  };

  const retake = () => {
    setMcqA(""); setAptA(""); setCodeA(""); setHrA(""); setSubmitted(false); setScore(0);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Daily Interview Test")}</h1>
          <p className="mt-1 text-muted-foreground">Four mixed questions every day. Track your scores.</p>
        </div>
        {submitted && (
          <Card className="flex items-center gap-2 px-4 py-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div><div className="text-xs text-muted-foreground">Today</div><div className="text-lg font-bold">{score} / 4</div></div>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">MCQ</Badge>
        <p className="font-medium">{mcq.q}</p>
        <RadioGroup value={mcqA} onValueChange={setMcqA} className="mt-3 space-y-2" disabled={submitted}>
          {mcq.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === mcq.answer ? "border-green-500 bg-green-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">Coding Output</Badge>
        <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{code.q}</pre>
        <RadioGroup value={codeA} onValueChange={setCodeA} className="mt-3 space-y-2" disabled={submitted}>
          {code.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === code.answer ? "border-green-500 bg-green-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">Aptitude</Badge>
        <p className="font-medium">{apt.q}</p>
        <RadioGroup value={aptA} onValueChange={setAptA} className="mt-3 space-y-2" disabled={submitted}>
          {apt.opts.map((o, i) => (
            <Label key={i} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${submitted && i === apt.answer ? "border-green-500 bg-green-500/10" : ""}`}>
              <RadioGroupItem value={String(i)} /> {o}
            </Label>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <Badge variant="secondary" className="mb-2">HR</Badge>
        <p className="font-medium">{hr}</p>
        <Textarea value={hrA} onChange={(e) => setHrA(e.target.value)} disabled={submitted}
          placeholder="Write a 3–5 sentence answer…" rows={5} className="mt-3" />
        <p className="mt-1 text-xs text-muted-foreground">Scored if answer is at least 30 characters.</p>
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

      {history.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-3 font-semibold">Score history</h3>
          <div className="space-y-1 text-sm">
            {history.slice().reverse().slice(0, 10).map((h, i) => (
              <div key={i} className="flex justify-between border-b py-1 last:border-0">
                <span className="text-muted-foreground">{new Date(h.ts).toLocaleString()}</span>
                <span className="font-medium">{h.score} / {h.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
