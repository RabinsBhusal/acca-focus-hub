
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text,
  duration_minutes integer NOT NULL CHECK (duration_minutes >= 0),
  date timestamptz NOT NULL DEFAULT now(),
  difficulty integer CHECK (difficulty BETWEEN 1 AND 5),
  notes text,
  learning_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX study_sessions_date_idx ON public.study_sessions (date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.study_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.study_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.study_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.study_sessions FOR DELETE USING (true);
