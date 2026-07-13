import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatSend } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const send = useServerFn(chatSend);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your StudentHub assistant. Ask me about notes, resumes, placements, or CGPA." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await send({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply || "(no reply)" }]);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-no-print className="no-print fixed bottom-5 right-5 z-[100]">
      {open ? (
        <div className="flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-elegant">
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">StudentHub Assistant</p>
              <p className="text-[11px] opacity-80">AI · always here to help</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                    : "bg-background text-foreground border"
                }`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-elegant hover:opacity-90"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
