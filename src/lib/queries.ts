import { queryOptions } from "@tanstack/react-query";
import { listSessions } from "./sessions.functions";
import { listEvents } from "./calendar.functions";
import { listExams } from "./exams.functions";
import {
  listAchievements,
  listUserAchievements,
  listPomodoros,
} from "./achievements.functions";
import { listGoals } from "./goals.functions";

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

export const achievementsQueryOptions = queryOptions({
  queryKey: ["achievements"],
  queryFn: () => listAchievements(),
});

export const userAchievementsQueryOptions = queryOptions({
  queryKey: ["user-achievements"],
  queryFn: () => listUserAchievements(),
});

export const pomodorosQueryOptions = queryOptions({
  queryKey: ["pomodoros"],
  queryFn: () => listPomodoros(),
});

export const goalsQueryOptions = queryOptions({
  queryKey: ["goals"],
  queryFn: () => listGoals(),
});
