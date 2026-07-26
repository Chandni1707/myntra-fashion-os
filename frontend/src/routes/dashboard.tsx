import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import {
  ImageUp,
  Clapperboard,
  ScanLine,
  Scan,
  Sparkles,
  ArrowUpRight,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import heroModel from "../assets/hero-model.jpg";
import heroFlatlay from "../assets/hero-flatlay.jpg";
import heroBag from "../assets/hero-bag.jpg";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const token = localStorage.getItem("fashionos_token");

    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Dashboard — FashionOS" },
      {
        name: "description",
        content:
          "Your AI fashion command center. Upload, analyze, and discover your next favorite look.",
      },
    ],
  }),

  component: Dashboard,
});

const captureMethods = [
  {
    id: "upload-image",
    title: "Upload Image",
    description: "Drop a photo of any outfit and let AI decode the style.",
    icon: ImageUp,
    href: "/capture",
  },
  {
    id: "upload-video",
    title: "Upload Video",
    description: "Upload a clip to get motion-aware outfit recommendations.",
    icon: Clapperboard,
    href: "/capture",
  },
  {
    id: "image-url",
    title: "Analyze Image URL",
    description: "Paste an image link and get instant style analysis.",
    icon: ScanLine,
    href: "/capture",
  },
  {
    id: "video-url",
    title: "Analyze Video URL",
    description: "Analyze fashion videos from any platform URL.",
    icon: Scan,
    href: "/capture",
  },
];

const recentCaptures = [
  {
    id: 1,
    title: "Summer Linen Look",
    type: "Image Upload",
    date: "Today, 10:23 AM",
    status: "Recommended",
    thumbnail: heroModel,
  },
  {
    id: 2,
    title: "Streetwear Haul",
    type: "Video Upload",
    date: "Yesterday, 6:45 PM",
    status: "Analyzed",
    thumbnail: heroFlatlay,
  },
  {
    id: 3,
    title: "Red Carpet Inspo",
    type: "Image URL",
    date: "Jul 19, 2026",
    status: "Uploaded",
    thumbnail: heroBag,
  },
  {
    id: 4,
    title: "Casual Friday Fit",
    type: "Image Upload",
    date: "Jul 18, 2026",
    status: "Recommended",
    thumbnail: null,
  },
];

const statusStyles: Record<string, string> = {
  Uploaded:
    "bg-blue-50/80 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400",
  Analyzed:
    "bg-amber-50/80 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400",
  Recommended:
    "bg-primary-soft text-primary border-primary/10",
};

export default function Dashboard() {
  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden hero-mesh">
        {/* Ambient background blobs */}
        <div
          aria-hidden
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl animate-blob"
          style={{
            background:
              "radial-gradient(circle, oklch(0.9 0.09 15), transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-40 top-40 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl animate-blob"
          style={{
            background:
              "radial-gradient(circle, oklch(0.92 0.08 40), transparent 65%)",
            animationDelay: "8s",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* Welcome Header */}
          <div className="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <div className="card-glass mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                AI Stylist Online
              </div>
              <h1
                className="text-4xl tracking-[-0.03em] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome back,{" "}
                <span className="text-gradient">Style Icon</span>
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Your fashion command center. Choose a capture method to start
                styling.
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Today
              </p>
              <p
                className="text-lg font-medium"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tuesday, July 21
              </p>
            </div>
          </div>

          {/* Capture Methods Grid */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {captureMethods.map((method, i) => (
              <Link
                key={method.id}
                to={method.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] card-glass p-6 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Pink gradient accent bar */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-primary-gradient opacity-80 transition-opacity group-hover:opacity-100" />

                {/* Icon */}
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary-gradient text-white shadow-[0_12px_30px_-12px_oklch(0.66_0.22_12/0.5)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_16px_40px_-12px_oklch(0.66_0.22_12/0.6)]">
                  <method.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {method.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {method.description}
                </p>

                {/* Link indicator */}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                  Start now
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Captures Section */}
          <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2
                  className="text-2xl font-medium sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recent Fashion Captures
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your last analyzed looks and recommendations.
                </p>
              </div>
              <button className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:flex">
                <MoreHorizontal className="h-4 w-4" /> View all
              </button>
            </div>

            <div className="space-y-3">
              {recentCaptures.map((capture) => (
                <div
                  key={capture.id}
                  className="hover-lift group flex items-center gap-4 rounded-2xl card-glass p-3 transition-all sm:p-4"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                    {capture.thumbnail ? (
                      <img
                        src={capture.thumbnail}
                        alt={capture.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary-soft to-muted" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-foreground">
                      {capture.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                        {capture.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {capture.date}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[capture.status]}`}
                    >
                      {capture.status === "Recommended" && (
                        <Sparkles className="mr-1.5 h-3 w-3" />
                      )}
                      {capture.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-ghost-glass mt-6 w-full rounded-full py-3 text-sm font-semibold sm:hidden">
              View all captures
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
