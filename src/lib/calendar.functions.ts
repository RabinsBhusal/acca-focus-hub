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

export const CATEGORIES = [
  "study",
  "task",
  "assignment",
  "exam",
  "personal",
  "reminder",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("start_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  category: z.enum(CATEGORIES),
  start_at: z.string(),
  duration_minutes: z.number().int().min(0).nullable().optional(),
  all_day: z.boolean().optional(),
  priority: z.number().int().min(1).max(3).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  completed: z.boolean().optional(),
  session_id: z.string().uuid().nullable().optional(),
  exam_id: z.string().uuid().nullable().optional(),
});

export const upsertEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const payload = {
      title: data.title,
      category: data.category,
      start_at: data.start_at,
      duration_minutes: data.duration_minutes ?? null,
      all_day: data.all_day ?? false,
      priority: data.priority ?? null,
      notes: data.notes ?? null,
      completed: data.completed ?? false,
      session_id: data.session_id ?? null,
      exam_id: data.exam_id ?? null,
    };
    if (data.id) {
      const { data: row, error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabase
      .from("calendar_events")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { error } = await supabase.from("calendar_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleEventCompleted = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), completed: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { error } = await supabase
      .from("calendar_events")
      .update({ completed: data.completed })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
