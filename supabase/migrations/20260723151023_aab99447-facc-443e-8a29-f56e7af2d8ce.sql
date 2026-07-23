
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  exam_date date NOT NULL,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO anon, authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.exams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.exams FOR DELETE USING (true);
CREATE TRIGGER exams_set_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'task',
  start_at timestamptz NOT NULL,
  duration_minutes integer,
  all_day boolean NOT NULL DEFAULT false,
  priority integer,
  notes text,
  completed boolean NOT NULL DEFAULT false,
  session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO anon, authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.calendar_events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.calendar_events FOR DELETE USING (true);
CREATE TRIGGER calendar_events_set_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX calendar_events_start_at_idx ON public.calendar_events (start_at);
