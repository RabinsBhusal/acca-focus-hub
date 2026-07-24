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

export const METRICS = ["minutes", "sessions", "pomodoros"] as const;
export const PERIODS = ["week", "month", "custom"] as const;

export const listGoals = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase.from("goals").select("*").order("ends_on");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  metric: z.enum(METRICS),
  target: z.number().int().min(1).max(100000),
  period: z.enum(PERIODS),
  starts_on: z.string(),
  ends_on: z.string(),
});

export const upsertGoal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const payload = {
      title: data.title,
      metric: data.metric,
      target: data.target,
      period: data.period,
      starts_on: data.starts_on,
      ends_on: data.ends_on,
    };
    if (data.id) {
      const { data: row, error } = await supabase
        .from("goals")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabase.from("goals").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { error } = await supabase.from("goals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
