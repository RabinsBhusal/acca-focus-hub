import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export const listAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase.from("achievements").select("*").order("threshold");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listUserAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .order("unlocked_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const unlockAchievements = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ codes: z.array(z.string().min(1).max(80)).min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const rows = data.codes.map((code) => ({ achievement_code: code }));
    const { data: inserted, error } = await supabase
      .from("user_achievements")
      .upsert(rows, { onConflict: "achievement_code", ignoreDuplicates: true })
      .select();
    if (error) throw new Error(error.message);
    return inserted ?? [];
  });

export const listPomodoros = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("pomodoro_completions")
    .select("*")
    .order("completed_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const logPomodoro = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ duration_minutes: z.number().int().min(1).max(240) }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: row, error } = await supabase
      .from("pomodoro_completions")
      .insert({ duration_minutes: data.duration_minutes })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
