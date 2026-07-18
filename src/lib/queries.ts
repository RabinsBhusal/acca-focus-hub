import { queryOptions } from "@tanstack/react-query";
import { listSessions } from "./sessions.functions";

export const sessionsQueryOptions = queryOptions({
  queryKey: ["sessions"],
  queryFn: () => listSessions(),
});
