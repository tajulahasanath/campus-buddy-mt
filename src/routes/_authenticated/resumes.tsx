import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileEdit, Plus, Copy, Trash2, Sparkles, Clock, Search } from "lucide-react";
import { EMPTY_RESUME, type ResumeData } from "@/lib/resume/types";
import { computeCompletion } from "@/lib/resume/ats";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => ({ meta: [{ title: "My Resumes — Student Hub" }] }),
  component: ResumeDashboard,
});

type Row = { id: string; title: string; template_id: string; data: ResumeData; updated_at: string; created_at: string };

function ResumeDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated_desc" | "updated_asc" | "created_desc" | "title_asc" | "title_desc">("updated_desc");


  const { data: rows, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const createNew = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("resumes").insert({
        user_id: user.user.id, title: "Untitled Resume", template_id: "modern", data: EMPTY_RESUME as any,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => { qc.invalidateQueries({ queryKey: ["resumes"] }); navigate({ to: "/resumes/$id", params: { id: row.id } }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const duplicate = useMutation({
    mutationFn: async (row: Row) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not signed in");
      const { error } = await supabase.from("resumes").insert({
        user_id: user.user.id, title: `${row.title} (copy)`, template_id: row.template_id, data: row.data as any,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Duplicated"); qc.invalidateQueries({ queryKey: ["resumes"] }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("resumes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["resumes"] }); },
  });

  const filtered = useMemo<Row[]>(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    const list = q ? rows.filter((r) => r.title.toLowerCase().includes(q)) : rows.slice();
    list.sort((a, b) => {
      switch (sort) {
        case "updated_asc": return +new Date(a.updated_at) - +new Date(b.updated_at);
        case "created_desc": return +new Date(b.created_at) - +new Date(a.created_at);
        case "title_asc": return a.title.localeCompare(b.title);
        case "title_desc": return b.title.localeCompare(a.title);
        case "updated_desc":
        default: return +new Date(b.updated_at) - +new Date(a.updated_at);
      }
    });
    return list;
  }, [rows, search, sort]);

  return (

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="mt-1 text-muted-foreground">Build, manage and export ATS-friendly resumes powered by AI.</p>
        </div>
        <Button size="lg" onClick={() => createNew.mutate()} disabled={createNew.isPending}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 shadow-elegant">
          <Plus className="mr-2 h-4 w-4" /> New Resume
        </Button>
      </div>

      {rows && rows.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…" className="pl-9" />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Recently updated</SelectItem>
              <SelectItem value="updated_asc">Least recently updated</SelectItem>
              <SelectItem value="created_desc">Newest first</SelectItem>
              <SelectItem value="title_asc">Title A → Z</SelectItem>
              <SelectItem value="title_desc">Title Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Card key={i} className="h-44 animate-pulse" />)}</div>
      ) : !rows || rows.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Create your first resume</h3>
          <p className="max-w-md text-muted-foreground">Multi-step builder, 4 templates, AI suggestions, ATS score, PDF & DOCX export — all in one place.</p>
          <Button onClick={() => createNew.mutate()} disabled={createNew.isPending} className="mt-2 bg-gradient-to-r from-indigo-600 to-violet-600">
            <Plus className="mr-2 h-4 w-4" /> Get Started
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-12 text-center text-muted-foreground">
          <Search className="h-6 w-6" />
          <p>No resumes match "{search}"</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => {
            const pct = computeCompletion(row.data);
            return (
              <Card key={row.id} className="group flex flex-col p-5 transition-shadow hover:shadow-elegant">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{row.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{row.template_id}</Badge>
                </div>
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Completion</span><span className="font-medium">{pct}%</span></div>
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="mt-auto flex gap-2">
                  <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600">
                    <Link to="/resumes/$id" params={{ id: row.id }}><FileEdit className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate.mutate(row)}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${row.title}"?`)) remove.mutate(row.id); }} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
