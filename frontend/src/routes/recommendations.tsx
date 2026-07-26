import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import api from "../lib/api";
import { Layout } from "../components/Layout";

import {
  Sparkles,
  Bookmark,
  RefreshCw,
  LayoutDashboard,
  Info,
  Heart,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [{ title: "Your Recommendations — FashionOS" }],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----------------------------
  // Load recommendation returned
  // by processing.tsx
  // ----------------------------

  const response = JSON.parse(
    sessionStorage.getItem("recommendation") || "{}"
  );

  const recommendation = response.recommendation ?? {};

  const products = recommendation.items ?? [];

  const prompt =
    recommendation.original_prompt ??
    "Generate outfit recommendation";

  const attributes = [
    {
      label: "Budget",
      value: recommendation.budget_max
        ? `₹${recommendation.budget_max}`
        : "No Budget",
    },
    {
      label: "Products",
      value: products.length,
    },
    {
      label: "Occasion",
      value: recommendation.occasion ?? "Everyday",
    },
    {
      label: "Within Budget",
      value: recommendation.within_budget ? "Yes" : "No",
    },
  ];

  const total = recommendation.total_price ?? 0;

  const avgScore =
    products.length > 0
      ? Math.round(
          products.reduce(
            (sum: number, p: any) =>
              sum + (p.recommendation_score ?? 0),
            0
          ) / products.length
        )
      : 0;
  async function saveRecommendation() {
  if (saved || saving) return;

  try {
    setSaving(true);

    await api.post("/history", {
      event_name:
        recommendation.occasion ??
        recommendation.event_name ??
        "Saved Outfit",

      event_date: new Date().toLocaleDateString(),

      total_price: total,

      match_score: avgScore,

      recommendations: products,
    });

    setSaved(true);

    alert("Recommendation saved successfully!");

  } catch (err) {

    console.error(err);

    alert("Failed to save recommendation.");

  } finally {

    setSaving(false);

  }
}    

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}

        <div className="animate-fade-up">

          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Curated
          </span>

          <h1
            className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your{" "}
            <em className="text-primary not-italic">
              personalized
            </em>{" "}
            outfit
          </h1>

          <p className="mt-3 text-muted-foreground max-w-2xl">
            Built from your uploaded inspiration and AI fashion analysis.
          </p>

          <div className="mt-6 card-glass p-5 flex items-start gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Prompt
              </p>

              <p className="mt-1 text-base font-medium">
                "{prompt}"
              </p>

            </div>

          </div>

        </div>

        {/* Attributes */}

        <div className="mt-8 animate-fade-up">

          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recommendation Details
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">

            {attributes.map((a) => (

              <div
                key={a.label}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs"
              >

                <span className="text-muted-foreground">
                  {a.label}:
                </span>{" "}

                <span className="font-semibold">
                  {a.value}
                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Products */}

        <div className="mt-12">

          <div className="flex items-end justify-between animate-fade-up">

            <div>

              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recommended Outfit
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                AI selected these products for you.
              </p>

            </div>

          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product: any, index: number) => (

              <OutfitCard
                key={product.product_id}
                product={product}
                delay={index * 100}
              />

            ))}

          </div>

        </div>

        {/* Explanation */}

        <div className="mt-14 card-elevated p-6 sm:p-8 animate-fade-up">

          <div className="flex items-start gap-4">

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground">

              <Info className="h-5 w-5" />

            </div>

            <div className="flex-1">

              <h3 className="text-xl font-semibold">
                Why this outfit works
              </h3>

              <p className="mt-3 text-muted-foreground">
                {recommendation.explanation}
              </p>

            </div>

          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-primary-soft/60 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Total Outfit Price
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{total.toLocaleString("en-IN")}
              </p>

            </div>

            <div className="rounded-2xl bg-muted p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Match Score
              </p>

              <div className="mt-2 flex items-center gap-3">

                <p className="text-3xl font-bold">
                  {avgScore}
                </p>

                <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">

                  <div
                    className="h-full bg-primary-gradient rounded-full"
                    style={{
                      width: `${Math.min(avgScore,100)}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
  onClick={saveRecommendation}
  disabled={saved || saving}
  className="btn-primary rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60"
>
              <Bookmark className="h-4 w-4" />
              {saving
    ? "Saving..."
    : saved
    ? "Saved ✓"
    : "Save Recommendation"}
            </button>

            <button
              onClick={() => navigate({ to: "/capture" })}
              className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              <RefreshCw className="inline mr-2 h-4 w-4" />
              Try Another Capture
            </button>

            <Link
              to="/dashboard"
              className="rounded-full bg-muted px-6 py-3 text-sm font-semibold hover:bg-primary-soft hover:text-primary"
            >
              <LayoutDashboard className="inline mr-2 h-4 w-4" />
              Dashboard
            </Link>

          </div>

        </div>

      </div>
    </Layout>
  );
}function OutfitCard({
  product,
  delay,
}: {
  product: any;
  delay: number;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="card-elevated overflow-hidden group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Product Image */}

      <div className="relative aspect  h- 80 overflow-hidden bg-muted">

        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category */}

        <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow">
          {product.category}
        </div>

        {/* Like */}

        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur hover:scale-110 transition-transform"
        >
          <Heart
            className={`h-4 w-4 ${
              liked
                ? "fill-primary text-primary"
                : "text-foreground"
            }`}
          />
        </button>

        {/* Score */}

        <div className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md inline-flex items-center gap-1">

          <Star className="h-3 w-3 fill-current" />

          {Math.round(product.recommendation_score)}

        </div>

        {/* Delivery */}

        <div className="absolute bottom-3 right-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-semibold shadow">

          {product.delivery_days} Days

        </div>

      </div>

      {/* Content */}

      <div className="p-4">

        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">

          {product.brand}

        </p>

        <h3 className="mt-1 text-sm font-semibold line-clamp-2">

          {product.name}

        </h3>

        <p className="mt-2 text-lg font-bold text-primary">

          ₹{product.price.toLocaleString("en-IN")}

        </p>

        <div className="mt-2 flex flex-wrap gap-1">

          {(product.colors ?? []).map((color: string) => (

            <span
              key={color}
              className="rounded-full bg-muted px-2 py-1 text-[10px]"
            >
              {color}
            </span>

          ))}

        </div>

        <ul className="mt-4 space-y-1">

          {(product.match_reasons ?? []).map(
            (reason: string) => (

              <li
                key={reason}
                className="flex items-start gap-2 text-[11px] text-muted-foreground"
              >

                <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />

                <span>{reason}</span>

              </li>

            )
          )}

        </ul>

        {/* Extra Details */}

        <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">

          <div className="flex justify-between">

            <span>Style</span>

            <span>
              {(product.styles ?? []).join(", ") || "N/A"}
            </span>

          </div>

          <div className="flex justify-between">

            <span>Fit</span>

            <span>{product.fit ?? "Regular"}</span>

          </div>

          <div className="flex justify-between">

            <span>Occasion</span>

            <span>
              {(product.occasions ?? []).join(", ") || "Everyday"}
            </span>

          </div>

        </div>

        {/* Add to Bag */}

        <button
          className="mt-5 w-full btn-primary rounded-full py-2 text-sm font-semibold transition-all hover:scale-[1.02]"
        >
          View Product
        </button>

      </div>

    </div>
  );
}