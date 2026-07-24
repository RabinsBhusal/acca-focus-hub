
-- Achievements catalog
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  threshold integer NOT NULL,
  unit text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO anon, authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.achievements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.achievements FOR DELETE USING (true);

-- Unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_code text NOT NULL UNIQUE,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.user_achievements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.user_achievements FOR DELETE USING (true);

-- Goals
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  metric text NOT NULL,
  target integer NOT NULL,
  period text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.goals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.goals FOR DELETE USING (true);
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pomodoro completions (used for stats + badges)
CREATE TABLE public.pomodoro_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duration_minutes integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pomodoro_completions TO anon, authenticated;
GRANT ALL ON public.pomodoro_completions TO service_role;
ALTER TABLE public.pomodoro_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.pomodoro_completions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.pomodoro_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.pomodoro_completions FOR DELETE USING (true);

-- Seed the achievements catalog
INSERT INTO public.achievements (code, title, description, icon, category, threshold, unit) VALUES
  ('streak_3',      '3-Day Streak',      'Study 3 days in a row',              'Flame',      'streak',      3,   'days'),
  ('streak_7',      'Week Warrior',      'Study 7 days in a row',              'Flame',      'streak',      7,   'days'),
  ('streak_30',     'Month Marathon',    'Study 30 days in a row',             'Flame',      'streak',      30,  'days'),
  ('streak_100',    'Centurion',         'Study 100 days in a row',            'Flame',      'streak',      100, 'days'),
  ('sessions_10',   'Getting Started',   'Complete 10 study sessions',         'BookOpen',   'volume',      10,  'sessions'),
  ('sessions_50',   'Half Century',      'Complete 50 study sessions',         'BookOpen',   'volume',      50,  'sessions'),
  ('sessions_100',  'Century Scholar',   'Complete 100 study sessions',        'BookOpen',   'volume',      100, 'sessions'),
  ('sessions_500',  'Iron Student',      'Complete 500 study sessions',        'BookOpen',   'volume',      500, 'sessions'),
  ('hours_10',      '10-Hour Club',      'Log 10 total hours of study',        'Clock',      'volume',      600, 'minutes'),
  ('hours_50',      '50-Hour Club',      'Log 50 total hours of study',        'Clock',      'volume',      3000, 'minutes'),
  ('hours_200',     '200-Hour Club',     'Log 200 total hours of study',       'Clock',      'volume',      12000, 'minutes'),
  ('first_exam',    'Exam Planned',      'Add your first exam',                'GraduationCap', 'exam',    1,   'sessions'),
  ('pomo_5',        'Pomodoro Rookie',   'Complete 5 pomodoros',               'Timer',      'timer',       5,   'pomodoros'),
  ('pomo_25',       'Pomodoro Pro',      'Complete 25 pomodoros',              'Timer',      'timer',       25,  'pomodoros'),
  ('pomo_100',      'Pomodoro Master',   'Complete 100 pomodoros',             'Timer',      'timer',       100, 'pomodoros');
