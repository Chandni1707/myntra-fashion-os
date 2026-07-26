import api from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  RefreshCw,
  Briefcase,
  Heart,
  PartyPopper,
  GraduationCap,
  Plane,
  Bell,
  BadgeIndianRupee,
  Wand2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
  TrendingDown,
  CalendarClock,
  ShoppingBag,
  X,
  Bookmark,
  Star,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";

export const Route = createFileRoute("/event-planner")({
  head: () => ({
    meta: [
      { title: "AI Fashion Planner — FashionOS" },
      {
        name: "description",
        content:
          "Connect your Google Calendar and let FashionOS automatically prepare outfit recommendations for every important event.",
      },
      { property: "og:title", content: "AI Fashion Planner — FashionOS" },
      {
        property: "og:description",
        content:
          "Your AI personal stylist plans outfits for every event on your calendar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventPlannerPage,
});

type EventStatus = "Outfit Ready" | "Recommendation Pending" | "In Review";

interface AIEvent {
  id: string;
  name: string;
  icon: typeof Briefcase;
  date: Date;
  timeLabel: string;
  dressCode: string;
  budget: number;
  status: EventStatus;
  accent: string;
  style?: string;
  gender?: string;
  notes?: string;
  recommendations?: Recommendation[];
  total_price?: number;
  remaining_budget?: number;
  
}

const today = new Date();
const d = (offset: number, h = 10, m = 0) => {
  const x = new Date(today);
  x.setDate(today.getDate() + offset);
  x.setHours(h, m, 0, 0);
  return x;
};

const seedEvents: AIEvent[] = [
  {
    id: "e1",
    name: "Software Engineering Interview",
    icon: Briefcase,
    date: d(1, 10, 0),
    timeLabel: "Tomorrow • 10:00 AM",
    dressCode: "Business Formal",
    budget: 6000,
    status: "Outfit Ready",
    accent: "from-blue-100 to-indigo-100 text-indigo-600",
  },
  {
    id: "e2",
    name: "Priya's Wedding",
    icon: Heart,
    date: d(5, 18, 30),
    timeLabel: "Saturday • 6:30 PM",
    dressCode: "Traditional",
    budget: 12000,
    status: "Recommendation Pending",
    accent: "from-rose-100 to-pink-100 text-primary",
  },
  {
    id: "e3",
    name: "Rohan's Birthday Party",
    icon: PartyPopper,
    date: d(9, 20, 0),
    timeLabel: "Next Sunday • 8:00 PM",
    dressCode: "Smart Casual",
    budget: 4500,
    status: "Outfit Ready",
    accent: "from-amber-100 to-orange-100 text-amber-600",
  },
  {
    id: "e4",
    name: "College Reunion",
    icon: GraduationCap,
    date: d(14, 19, 0),
    timeLabel: "In 2 weeks • 7:00 PM",
    dressCode: "Casual Chic",
    budget: 5500,
    status: "In Review",
    accent: "from-emerald-100 to-teal-100 text-emerald-600",
  },
  {
    id: "e5",
    name: "Goa Weekend Trip",
    icon: Plane,
    date: d(22, 9, 0),
    timeLabel: "In 3 weeks • Morning",
    dressCode: "Resort / Beachwear",
    budget: 7000,
    status: "Outfit Ready",
    accent: "from-cyan-100 to-sky-100 text-sky-600",
  },
];

const notifications = [
  {
    icon: Sparkles,
    tint: "bg-primary-soft text-primary",
    title: "Outfit Ready",
    body: "Your interview outfit is ready to review.",
    time: "2m ago",
  },
  {
    icon: TrendingDown,
    tint: "bg-emerald-50 text-emerald-600",
    title: "Price Drop",
    body: "A recommended blazer is now 20% off.",
    time: "1h ago",
  },
  {
    icon: Package,
    tint: "bg-amber-50 text-amber-600",
    title: "Delivery Update",
    body: "Your ivory loafers arrive tomorrow.",
    time: "5h ago",
  },
  {
    icon: CalendarClock,
    tint: "bg-blue-50 text-blue-600",
    title: "Event Reminder",
    body: "Priya's wedding starts in 5 days.",
    time: "Today",
  },
];

const reminderTimeline = [
  { label: "30 Days Before", text: "AI prepares outfit recommendations", icon: Wand2 },
  { label: "20 Days Before", text: "Review recommendations", icon: CheckCircle2 },
  { label: "10 Days Before", text: "Purchase clothing", icon: ShoppingBag },
  { label: "5 Days Before", text: "Try the complete outfit", icon: Star },
  { label: "Event Day", text: "Enjoy your event ✨", icon: PartyPopper },
];

type DressCode = "Casual" | "Smart Casual" | "Business Formal" | "Traditional" | "Party Wear" | "Resort / Beachwear";

interface Recommendation {
  product_id: string;
  category: string;
  brand: string;
  title: string;
  price: number;
  delivery_days: number;
  image: string;
  description: string;
  score: number;
  alternatives?: Recommendation[];
}
interface EventPlannerResponse {
  event: string;
  location: string;
  budget: number;
  total_price: number;
  remaining_budget: number;
  recommendations: Recommendation[];
}

function EventPlannerPage() {
  const [connected, setConnected] = useState(true);
  const [events, setEvents] = useState<AIEvent[]>(seedEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openEvent, setOpenEvent] = useState<AIEvent | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [dressCode, setDressCode] = useState<DressCode>("Smart Casual");
  const [budget, setBudget] = useState<number[]>([6000]);
  const [style, setStyle] = useState("Minimalist");
  const [gender, setGender] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<EventPlannerResponse | null>(null);
  const replaceRecommendation = (
  eventId: string,
  index: number
) => {
  setEvents((prev) =>
    prev.map((event) => {
      if (event.id !== eventId) return event;

      const recommendations = [...(event.recommendations ?? [])];

      const current = recommendations[index];

      if (
        !current.alternatives ||
        current.alternatives.length === 0
      ) {
        alert("No more alternatives.");
        return event;
      }

      const next = current.alternatives[0];

      recommendations[index] = {
        ...next,
        alternatives: current.alternatives.slice(1),
      };

      const updatedEvent = {
        ...event,
        recommendations,
      };

      if (openEvent?.id === event.id) {
        setOpenEvent(updatedEvent);
      }

      return updatedEvent;
    })
  );
};
  


  const filtered = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(
      (e) =>
        e.date.getFullYear() === selectedDate.getFullYear() &&
        e.date.getMonth() === selectedDate.getMonth() &&
        e.date.getDate() === selectedDate.getDate(),
    );
  }, [events, selectedDate]);

  const outfitsReady = events.filter((e) => e.status === "Outfit Ready").length;
  const pending = events.filter((e) => e.status === "Recommendation Pending").length;
  const inReview = events.filter((e) => e.status === "In Review").length;
  const shoppingBudget = 8500;

  const generateOutfit = async (event: AIEvent) => {
    try {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: "In Review" } : e)),
      );

      const response = await api.post("/event-planner", {
        event_type: event.name,
        event_date: event.date.toISOString().split("T")[0],
        location: "Hyderabad",
        budget: event.budget,
        gender: event.gender || "Women",
        style: event.style || "",
        notes: event.notes || "",
      });

      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== event.id) return e;

          return {
            ...e,
            status: "Outfit Ready",
            recommendations: response.data.recommendations,
            total_price: response.data.total_price,
            remaining_budget: response.data.remaining_budget,
          };
        }),
      );
    } catch (err) {
      console.error(err);

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: "Recommendation Pending" } : e)),
      );

      alert("Failed to generate outfit.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2.5rem] hero-mesh border border-border/50 p-8 sm:p-12 animate-fade-up">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl animate-blob" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur px-3 py-1 text-xs font-semibold text-primary border border-primary/10">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered stylist
            </span>
            <h1
              className="mt-4 text-4xl sm:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AI <em className="text-gradient not-italic">Fashion</em> Planner
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Connect your Google Calendar and let FashionOS automatically prepare
              outfit recommendations for every important event.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setConnected(true)}
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                {connected ? (
                  <>
                    <RefreshCw className="h-4 w-4" /> Sync Calendar
                  </>
                ) : (
                  <>
                    <CalendarCheck2 className="h-4 w-4" /> Connect Google Calendar
                  </>
                )}
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="btn-ghost-glass rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" /> Plan Manually
              </button>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="mt-10 grid gap-6 lg:grid-cols-10">
          {/* LEFT 70% */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI welcome */}
            <div className="card-glass p-6 sm:p-7 animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-lg shadow-primary/25">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-2xl font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Good to see you, Aanya
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    I've analyzed your calendar and prepared{" "}
                    <span className="font-semibold text-foreground">{outfitsReady} outfits</span>{" "}
                    for your upcoming events.{" "}
                    <span className="font-semibold text-primary">{pending} more</span> waiting on
                    your approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Calendar status */}
            <ConnectionCard
              connected={connected}
              upcoming={events.length}
              onToggle={() => setConnected((c) => !c)}
            />

            {/* Upcoming AI events */}
            <div className="animate-fade-up">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3
                    className="text-2xl font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Upcoming AI events
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDate
                      ? `Filtered by ${selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                      : "Every event, styled by AI"}
                  </p>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Clear filter <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.length === 0 && (
                  <div className="sm:col-span-2 card-elevated p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No events on this day. Pick another date or clear the filter.
                    </p>
                  </div>
                )}
                {filtered.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    onOpen={() => {
                      if (e.status === "Outfit Ready") {
                        setOpenEvent(e);
                      } else if (e.status === "Recommendation Pending") {
                        generateOutfit(e);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Outfit recommendation preview */}
            <OutfitPreview />

            {/* Smart reminder timeline */}
            <ReminderTimeline />
          </div>

          {/* RIGHT 30% */}
          <div className="lg:col-span-3 space-y-6">
            <MiniCalendar
              events={events}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />

            {/* AI insights */}
            <div className="card-glass p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3
                  className="text-lg font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  AI Summary
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <InsightRow
                  icon={CalendarClock}
                  label="Upcoming events"
                  value={`${events.length}`}
                />
                <InsightRow
                  icon={CheckCircle2}
                  label="Outfits ready"
                  value={`${outfitsReady}`}
                  tint="text-emerald-600 bg-emerald-50"
                />
                <InsightRow
                  icon={AlertCircle}
                  label="Needs review"
                  value={`${inReview + pending}`}
                  tint="text-amber-600 bg-amber-50"
                />
                <InsightRow
                  icon={BadgeIndianRupee}
                  label="Est. shopping budget"
                  value={`₹${shoppingBudget.toLocaleString("en-IN")}`}
                  tint="text-primary bg-primary-soft"
                />
              </ul>
            </div>

            {/* Notification center */}
            <div className="card-elevated p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h3
                    className="text-lg font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Notifications
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {notifications.length} new
                </span>
              </div>
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.title}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 p-3 transition-all hover:border-primary/20 hover:bg-primary-soft/30"
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-xl shrink-0 ${n.tint}`}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Outfit modal */}
      <Dialog open={!!openEvent} onOpenChange={(o) => !o && setOpenEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl p-0">
          {openEvent && (
            
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {openEvent.name}
                </DialogTitle>
                <DialogDescription>
                  {openEvent.timeLabel} · {openEvent.dressCode}
                </DialogDescription>
              </DialogHeader>

              <div className="border-t mt-5" />

              <div className="mt-6 space-y-4">
                {openEvent.recommendations?.map((item, index) => (
                  <div
                    key={item.product_id}
                    className="flex gap-5 rounded-2xl border border-border p-4 transition hover:bg-muted/30"
                  >
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      <img
                        src={item.image.replace("http://", "https://")}
                        alt={item.title}
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium text-secondary-foreground">
                          🚚 {item.delivery_days} days
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            item.score >= 0.6
                              ? "bg-emerald-100 text-emerald-700"
                              : item.score >= 0.4
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          ⭐ {Math.round(item.score * 100)}%
                        </span>
                      </div>
                      <div className="mt-5 flex gap-3">
  <Button
    variant="outline"
    size="sm"
    onClick={() => replaceRecommendation(openEvent.id, index)}
  >
    <RefreshCw className="mr-2 h-4 w-4" />
    Replace
  </Button>
</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-muted p-5">
                <h3 className="mb-4 font-semibold">Budget Summary</h3>
                <div className="flex justify-between">
                  <span>Total Outfit Price</span>
                  <span className="font-bold">₹{openEvent.total_price}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span>Remaining Budget</span>
                  <span className="font-bold text-green-600">₹{openEvent.remaining_budget}</span>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 font-semibold">Why AI selected this</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    ✨ Semantic Search
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                    🎉 {openEvent.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                    💰 Budget Optimized
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                    🎨 {openEvent.dressCode}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Save Outfit</Button>
                <Button>View Details</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event + Generate Outfit modal */}
      <CreateEventModal
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) {
            setEventName("");
            setEventDate("");
            setDressCode("Smart Casual");
            setBudget([6000]);
            setStyle("Minimalist");
            setGender("");
            setPrompt("");
            setGenerated(null);
            setGenerating(false);
          }
        }}
        eventName={eventName}
        setEventName={setEventName}
        eventDate={eventDate}
        setEventDate={setEventDate}
        dressCode={dressCode}
        setDressCode={setDressCode}
        budget={budget}
        setBudget={setBudget}
        style={style}
        setStyle={setStyle}
        gender={gender}
        setGender={setGender}
        prompt={prompt}
        setPrompt={setPrompt}
        generating={generating}
        setGenerating={setGenerating}
        generated={generated}
        setGenerated={setGenerated}
        onSave={() => {
          const newEvent: AIEvent = {
            id: `e${events.length + 1}`,
            name: eventName || `${dressCode} Event`,
            icon: dressCode === "Business Formal" ? Briefcase : Heart,
            date: eventDate ? new Date(eventDate) : d(7, 18, 0),
            timeLabel: eventDate
              ? new Date(eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })
              : "Next week • 6:00 PM",
            dressCode,
            budget: budget[0],
            status: "Recommendation Pending",
            accent: "from-rose-100 to-pink-100 text-primary",
          };
          setEvents((prev) => [newEvent, ...prev]);
          setCreateOpen(false);
          setEventName("");
          setEventDate("");
          setDressCode("Smart Casual");
          setBudget([6000]);
          setStyle("Minimalist");
          setGender("");
          setPrompt("");
          setGenerated(null);
          setGenerating(false);
        }}
      />
    </Layout>
  );
}

/* ---------- Subcomponents ---------- */

function ConnectionCard({
  connected,
  upcoming,
  onToggle,
}: {
  connected: boolean;
  upcoming: number;
  onToggle: () => void;
}) {
  return (
    <div className="card-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-md border border-border">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path fill="#4285F4" d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V9h14v10Z" />
            <path fill="#EA4335" d="M7 11h4v4H7z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Google Calendar</p>
          {connected ? (
            <>
              <p className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected ·{" "}
                {upcoming} upcoming events
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Last synced 2 minutes ago
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Not connected</p>
          )}
        </div>
        <button
          onClick={onToggle}
          className="btn-primary rounded-full px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
        >
          {connected ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </>
          ) : (
            <>
              <CalendarCheck2 className="h-3.5 w-3.5" /> Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, onOpen }: { event: AIEvent; onOpen: () => void }) {
  const Icon = event.icon;
  const statusStyles: Record<EventStatus, string> = {
    "Outfit Ready": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Recommendation Pending": "bg-primary-soft text-primary border-primary/10",
    "In Review": "bg-amber-50 text-amber-600 border-amber-100",
  };
  const cta =
    event.status === "Recommendation Pending" ? "Generate Outfit" : "View Outfit";

  return (
    <div className="card-elevated p-5 flex flex-col gap-3 animate-fade-up">
      <div className="flex items-start gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${event.accent} shrink-0`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold truncate">{event.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{event.timeLabel}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Dress code
          </p>
          <p className="font-semibold mt-0.5 truncate">{event.dressCode}</p>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Budget
          </p>
          <p className="font-semibold mt-0.5">
            ₹{event.budget.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="btn-primary rounded-full px-4 py-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
      >
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function OutfitPreview() {
  const items = [
    { label: "Top", brand: "COS", price: 2499, g: "linear-gradient(135deg, oklch(0.94 0.04 240), oklch(0.9 0.06 220))" },
    { label: "Bottom", brand: "Uniqlo", price: 2299, g: "linear-gradient(135deg, oklch(0.96 0.03 80), oklch(0.92 0.05 60))" },
    { label: "Shoes", brand: "Zara", price: 3499, g: "linear-gradient(135deg, oklch(0.95 0.02 60), oklch(0.88 0.04 40))" },
    { label: "Bag", brand: "Mango", price: 1799, g: "linear-gradient(135deg, oklch(0.92 0.06 60), oklch(0.86 0.08 40))" },
  ];
  return (
    <div className="card-glass p-6 animate-fade-up">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Featured recommendation
          </p>
          <h3
            className="text-xl font-medium mt-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Interview outfit · ready to review
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
          <Sparkles className="h-3 w-3" /> 96% match
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl overflow-hidden bg-background/60 border border-border/60">
            <div className="aspect-[3/4]" style={{ background: i.g }} />
            <div className="p-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {i.label} · {i.brand}
              </p>
              <p className="text-xs font-bold mt-0.5">
                ₹{i.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReminderTimeline() {
  return (
    <div className="card-elevated p-6 sm:p-7 animate-fade-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
          <CalendarClock className="h-4 w-4" />
        </div>
        <h3
          className="text-xl font-medium"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Smart reminder timeline
        </h3>
      </div>
      <ol className="relative border-l-2 border-dashed border-primary/20 ml-4 space-y-5">
        {reminderTimeline.map((r) => (
          <li key={r.label} className="pl-6 relative">
            <span className="absolute -left-[13px] top-0 grid h-6 w-6 place-items-center rounded-full bg-primary-gradient text-white shadow-md shadow-primary/25">
              <r.icon className="h-3 w-3" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {r.label}
            </p>
            <p className="text-sm text-foreground mt-0.5">{r.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
  tint = "text-muted-foreground bg-muted",
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className={`grid h-8 w-8 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </li>
  );
}

function MiniCalendar({
  events,
  selected,
  onSelect,
}: {
  events: AIEvent[];
  selected: Date | null;
  onSelect: (d: Date | null) => void;
}) {
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const hasEvent = (day: number) =>
    events.some(
      (e) =>
        e.date.getFullYear() === cursor.getFullYear() &&
        e.date.getMonth() === cursor.getMonth() &&
        e.date.getDate() === day,
    );

  const isSelected = (day: number) =>
    selected?.getFullYear() === cursor.getFullYear() &&
    selected?.getMonth() === cursor.getMonth() &&
    selected?.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === cursor.getFullYear() &&
    today.getMonth() === cursor.getMonth() &&
    today.getDate() === day;

  return (
    <div className="card-glass p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          {monthLabel}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary-soft hover:text-primary transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary-soft hover:text-primary transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="h-8" />;
          const dot = hasEvent(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={idx}
              onClick={() => {
                const nd = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                onSelect(sel ? null : nd);
              }}
              className={`relative h-8 w-full rounded-lg text-xs font-medium transition-all
                ${sel ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : tod ? "bg-primary-soft text-primary" : "hover:bg-muted"}`}
            >
              {day}
              {dot && !sel && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSelect(null)}
        className="mt-3 w-full text-[11px] font-semibold text-primary hover:underline"
      >
        Show all events
      </button>
    </div>
  );
}

function CreateEventModal({
  open,
  onOpenChange,
  eventName,
  setEventName,
  eventDate,
  setEventDate,
  dressCode,
  setDressCode,
  budget,
  setBudget,
  style,
  setStyle,
  gender,
  setGender,
  prompt,
  setPrompt,
  generating,
  setGenerating,
  generated,
  setGenerated,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  eventName: string;
  setEventName: (v: string) => void;
  eventDate: string;
  setEventDate: (v: string) => void;
  dressCode: DressCode;
  setDressCode: (v: DressCode) => void;
  budget: number[];
  setBudget: (v: number[]) => void;
  style: string;
  setStyle: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  generating: boolean;
  setGenerating: (v: boolean) => void;
  generated: EventPlannerResponse | null;
  setGenerated: (v: EventPlannerResponse | null) => void;
  onSave: (outfit: EventPlannerResponse) => void;
}) {
  const total = generated
    ? generated.recommendations.reduce((sum, item) => sum + item.price, 0)
    : 0;

  const match = generated
    ? Math.round(
        (generated.recommendations.reduce((sum, item) => sum + item.score, 0) /
          generated.recommendations.length) *
          100
      )
    : 0;

  const previewItems = generated?.recommendations.slice(0, 4) ?? [];

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const response = await api.post("/event-planner", {
        event_type: eventName,
        event_date: eventDate,
        location: "Hyderabad",
        budget: budget[0],
        gender,
        style,
        notes: prompt,
      });

      setGenerated(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate outfit");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle
              className="text-2xl sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plan an event with AI
            </DialogTitle>
            <DialogDescription>
              Tell FashionOS about your event and it will generate a complete outfit recommendation.
            </DialogDescription>
          </DialogHeader>

          {!generated && !generating && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-name" className="text-sm font-semibold">
                    Event name
                  </Label>
                  <Input
                    id="event-name"
                    placeholder="e.g. Diwali Dinner"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date" className="text-sm font-semibold">
                    Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="rounded-xl h-11"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Dress code</Label>
                  <Select value={dressCode} onValueChange={(v) => setDressCode(v as DressCode)}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select dress code" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {["Casual", "Smart Casual", "Business Formal", "Traditional", "Party Wear", "Resort / Beachwear"].map(
                        (d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Preferred style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {["Minimalist", "Streetwear", "Classic", "Bohemian", "Trendy", "Ethnic"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Budget</Label>
                  <span className="text-sm font-bold text-primary">
                    ₹{budget[0].toLocaleString("en-IN")}
                  </span>
                </div>
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  min={1000}
                  max={20000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1,000</span>
                  <span>₹20,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-semibold">
                  Extra preferences (optional)
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. I want something pastel, no heels, must include a jacket..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="rounded-xl min-h-[90px] resize-none"
                />
              </div>

              <Button
                onClick={() => {
                  if (!eventName || !eventDate) {
                    alert("Please enter an event name and date.");
                    return;
                  }

                  onSave(generated ?? {
                    event: eventName,
                    location: "Hyderabad",
                    budget: budget[0],
                    total_price: budget[0],
                    remaining_budget: Math.max(budget[0] - budget[0], 0),
                    recommendations: [],
                  });
                }}
                className="w-full btn-primary rounded-full h-12"
              >
                Save Plan
              </Button>
            </div>
          )}

          {generating && (
            <div className="mt-8 flex flex-col items-center justify-center py-10">
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-primary-gradient text-white shadow-xl shadow-primary/25 animate-pulse">
                <Sparkles className="h-8 w-8" />
                <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-[ping_1.5s_ease-in-out_infinite]" />
              </div>
              <p className="mt-5 text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
                AI is styling your look...
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Analyzing dress code, budget, and your preferences
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Finding matching pieces</span>
              </div>
            </div>
          )}

          {generated && !generating && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    AI event summary
                  </p>
                  <h3
                    className="text-xl font-medium mt-0.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Recommended outfit
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> {match}% match
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {generated?.recommendations.map((item) => (
                  <div
                    key={item.product_id}
                    className="rounded-2xl border border-border overflow-hidden"
                  >
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image.replace("http://", "https://")}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                      <p className="text-xs mt-1">{item.brand}</p>
                      <p className="font-bold mt-2">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-primary-soft/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Total</p>
                  <p className="text-xl font-bold mt-1">₹{generated.total_price}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Remaining budget
                  </p>
                  <p className="text-xl font-bold mt-1">
                    ₹{generated.remaining_budget}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Why AI selected this
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  This outfit was selected for your {eventName || "event"}. The recommendations
                  match your preferred {style} style, stay within your ₹{budget[0].toLocaleString("en-IN")}{" "}
                  budget, and are optimized using AI semantic search.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                       alert("Saved successfully!");
                       onOpenChange(false);
                  }}
                  className="btn-primary rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" /> Save to Event Planner
                </button>
                <button
                  onClick={handleGenerate}
                  className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary inline-flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}