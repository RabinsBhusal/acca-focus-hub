import { Link } from "@tanstack/react-router";
import { BookOpen, BarChart3, History, LayoutDashboard, Calendar, GraduationCap } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/exams", label: "Exams", icon: GraduationCap },
  { to: "/history", label: "History", icon: History },
  { to: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export function AppNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            ACCA Tracker
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-secondary text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
