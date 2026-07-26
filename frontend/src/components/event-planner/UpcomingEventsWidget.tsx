import { Link } from "@tanstack/react-router";
import { CalendarHeart, ArrowUpRight, Sparkles } from "lucide-react";

export interface UpcomingEvent {
  id: string | number;
  name: string;
  daysLeft: number;
  status?: "Planned" | "Outfit Ready" | "In Progress";
}

const defaultEvents: UpcomingEvent[] = [
  { id: 1, name: "Wedding", daysLeft: 55, status: "Planned" },
  { id: 2, name: "Birthday", daysLeft: 12, status: "Outfit Ready" },
  { id: 3, name: "Interview", daysLeft: 8, status: "In Progress" },
];

const statusStyles: Record<string, string> = {
  Planned: "bg-blue-50 text-blue-600 border-blue-100",
  "Outfit Ready": "bg-primary-soft text-primary border-primary/10",
  "In Progress": "bg-amber-50 text-amber-600 border-amber-100",
};

export function UpcomingEventsWidget({
  events = defaultEvents,
}: {
  events?: UpcomingEvent[];
}) {
  return (
    <div className="card-glass p-6 rounded-[2rem]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-gradient text-white shadow-[0_10px_25px_-10px_oklch(0.66_0.22_12/0.5)]">
            <CalendarHeart className="h-5 w-5" />
          </div>
          <div>
            <h3
              className="text-lg font-medium"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Upcoming Events
            </h3>
            <p className="text-xs text-muted-foreground">
              Plan outfits ahead of time
            </p>
          </div>
        </div>
        <Link
          to="/event-planner"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
        >
          Open <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {events.map((e) => (
          <div
            key={e.id}
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 transition-all hover:border-primary/20 hover:bg-primary-soft/40"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-muted-foreground">
                {e.daysLeft} Days Left
              </p>
            </div>
            {e.status && (
              <span
                className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[e.status]}`}
              >
                {e.status}
              </span>
            )}
            <Link
              to="/event-planner"
              className="btn-ghost-glass rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              Quick view
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
