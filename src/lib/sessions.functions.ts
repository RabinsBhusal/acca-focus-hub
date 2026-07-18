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

export const listSessions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const createSchema = z.object({
  subject: z.string().min(1).max(80),
  topic: z.string().max(200).nullable().optional(),
  duration_minutes: z.number().int().min(1),
  difficulty: z.number().int().min(1).max(5),
  notes: z.string().max(4000).nullable().optional(),
  learning_summary: z.string().max(4000).nullable().optional(),
});

export const createSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: row, error } = await supabase
      .from("study_sessions")
      .insert({
        subject: data.subject,
        topic: data.topic ?? null,
        duration_minutes: data.duration_minutes,
        difficulty: data.difficulty,
        notes: data.notes ?? null,
        learning_summary: data.learning_summary ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
