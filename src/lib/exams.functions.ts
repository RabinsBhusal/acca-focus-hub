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

export type ExamTopic = { name: string; progress: number };

export const listExams = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("exam_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const topicSchema = z.object({
  name: z.string().min(1).max(120),
  progress: z.number().int().min(0).max(100),
});

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  exam_date: z.string(),
  topics: z.array(topicSchema).default([]),
  notes: z.string().max(4000).nullable().optional(),
});

export const upsertExam = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const payload = {
      title: data.title,
      exam_date: data.exam_date,
      topics: data.topics,
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { data: row, error } = await supabase
        .from("exams")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabase
      .from("exams")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteExam = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { error } = await supabase.from("exams").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
