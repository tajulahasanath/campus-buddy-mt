
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Resume',
  ADD COLUMN IF NOT EXISTS template_id text NOT NULL DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
