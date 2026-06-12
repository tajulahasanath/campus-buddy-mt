import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiResume } from "@/lib/ai-resume.functions";
import { toast } from "sonner";

type Task = "objective" | "improve-objective" | "improve-project" | "improve-skills" | "suggest-skills" | "summary" | "ats-feedback" | "grammar";

export function AIButton({
  task, context, role, onResult, label = "AI Improve", size = "sm",
}: {
  task: Task; context: string; role?: string;
  onResult: (text: string) => void;
  label?: string;
  size?: "sm" | "default";
}) {
  const fn = useServerFn(aiResume);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    if (!context.trim() && task !== "suggest-skills") {
      toast.error("Add some text first so AI has something to improve");
      return;
    }
    setLoading(true);
    try {
      const { result } = await fn({ data: { task, context: context.slice(0, 3500), role } });
      onResult(result);
      toast.success("AI suggestion ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally { setLoading(false); }
  };
  return (
    <Button type="button" size={size} variant="outline" onClick={run} disabled={loading}
      className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800">
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
