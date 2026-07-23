import { queryOptions } from "@tanstack/react-query";
import { listSessions } from "./sessions.functions";
import { listEvents } from "./calendar.functions";
import { listExams } from "./exams.functions";

export const sessionsQueryOptions = queryOptions({
  queryKey: ["sessions"],
  queryFn: () => listSessions(),
});

export const eventsQueryOptions = queryOptions({
  queryKey: ["calendar-events"],
  queryFn: () => listEvents(),
});

export const examsQueryOptions = queryOptions({
  queryKey: ["exams"],
  queryFn: () => listExams(),
});
