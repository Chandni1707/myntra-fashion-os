import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import api from "../lib/api";

import {
  Search,
  Trash2,
  Eye,
  Calendar,
  IndianRupee,
  Sparkles,
  Trophy,
  History as HistoryIcon,
  ArrowUpDown,
  X,
} from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      {
        title: "History • FashionOS",
      },
    ],
  }),
  component: HistoryPage,
});

interface Product {
  product_id?: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
  recommendation_score?: number;
  price?: number;
  colors?: string[];
  styles?: string[];
  occasions?: string[];
  fit?: string;
  match_reasons?: string[];
}

interface HistoryItem {
  _id: string;
  event_name: string;
  event_date: string;
  total_price: number;
  match_score: number;
  recommendations: Product[];
  created_at: string;
}

function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");

  const [sort, setSort] = useState<
    "newest" | "oldest"
  >("newest");

  const [selected, setSelected] =
    useState<HistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);

      const { data } = await api.get("/history");

      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteHistory(id: string) {
    try {
      await api.delete(`/history/${id}`);

      setHistory((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (selected?._id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(() => {
    let items = [...history];

    if (query.trim()) {
      const q = query.toLowerCase();

      items = items.filter(
        (item) =>
          item.event_name
            .toLowerCase()
            .includes(q) ||
          item.event_date.includes(q)
      );
    }

    items.sort((a, b) => {
      const d1 = new Date(
        a.created_at
      ).getTime();

      const d2 = new Date(
        b.created_at
      ).getTime();

      return sort === "newest"
        ? d2 - d1
        : d1 - d2;
    });

    return items;
  }, [history, query, sort]);

  const totalLooks = history.length;

  const totalSpent = history.reduce(
    (sum, item) => sum + item.total_price,
    0
  );

  const averageScore =
    history.length === 0
      ? 0
      : Math.round(
          history.reduce(
            (sum, item) =>
              sum + item.match_score,
            0
          ) / history.length
        );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}

        <div className="animate-fade-up">

          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">

            <HistoryIcon className="h-4 w-4" />

            Outfit History

          </span>

          <h1
            className="mt-4 text-4xl font-bold tracking-tight"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Your Fashion Journey
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every outfit you've saved is
            stored here. Review your
            previous recommendations,
            compare looks, and revisit
            outfits anytime.
          </p>

        </div>

        {/* Stats */}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
                    <div className="card-elevated p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-muted-foreground">
                Saved Looks
              </p>

              <HistoryIcon className="h-5 w-5 text-primary" />

            </div>

            <h2 className="mt-4 text-4xl font-bold">
              {totalLooks}
            </h2>

          </div>

          <div className="card-elevated p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-muted-foreground">
                Total Spent
              </p>

              <IndianRupee className="h-5 w-5 text-primary" />

            </div>

            <h2 className="mt-4 text-4xl font-bold">
              ₹
              {totalSpent.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          <div className="card-elevated p-6">

            <div className="flex items-center justify-between">

              <p className="text-sm text-muted-foreground">
                Average Match
              </p>

              <Trophy className="h-5 w-5 text-primary" />

            </div>

            <h2 className="mt-4 text-4xl font-bold">
              {averageScore}%
            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="mt-10 flex flex-col gap-4 md:flex-row">

          <div className="relative flex-1">

            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search by event..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none focus:border-primary"
            />

          </div>

          <button
            onClick={() =>
              setSort(
                sort === "newest"
                  ? "oldest"
                  : "newest"
              )
            }
            className="rounded-xl border border-border px-5 py-3 font-medium hover:border-primary"
          >

            <ArrowUpDown className="mr-2 inline h-4 w-4" />

            {sort === "newest"
              ? "Newest"
              : "Oldest"}

          </button>

        </div>

        {/* Empty */}

        {!loading &&
          filtered.length === 0 && (

            <div className="mt-20 rounded-3xl border border-dashed border-border py-20 text-center">

              <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground" />

              <h3 className="mt-6 text-2xl font-semibold">
                No Saved Outfits
              </h3>

              <p className="mt-2 text-muted-foreground">
                Save your first recommendation
                to see it here.
              </p>

            </div>

          )}

        {/* Cards */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          {filtered.map((item) => (

            <div
              key={item._id}
              className="card-elevated overflow-hidden"
            >

              <div className="p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-2xl font-bold">

                      {item.event_name}

                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">

                      <Calendar className="h-4 w-4" />

                      {item.event_date}

                    </div>

                  </div>

                  <div className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">

                    {item.match_score}%

                  </div>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-muted/50 p-4">

                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total Price
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xl font-bold">

                      <IndianRupee className="h-5 w-5" />

                      {item.total_price.toLocaleString("en-IN")}

                    </div>

                  </div>

                  <div className="rounded-2xl bg-muted/50 p-4">

                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Products
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xl font-bold">

                      <Sparkles className="h-5 w-5" />

                      {item.recommendations.length}

                    </div>

                  </div>

                </div>

                <div className="mt-6 flex -space-x-4">

                  {item.recommendations
                    .slice(0, 4)
                    .map((product, index) => (

                      <img
                        key={index}
                        src={
                          product.image_url ||
                          "https://placehold.co/80x80"
                        }
                        alt={product.name}
                        className="h-16 w-16 rounded-full border-4 border-background object-cover"
                      />

                    ))}

                </div>

                <div className="mt-8 flex gap-3">

                  <button
                    onClick={() =>
                      setSelected(item)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                  >

                    <Eye className="h-4 w-4" />

                    View Outfit

                  </button>

                  <button
                    onClick={() =>
                      deleteHistory(item._id)
                    }
                    className="flex items-center justify-center rounded-xl border border-red-300 px-5 text-red-600 transition hover:bg-red-50"
                  >

                    <Trash2 className="h-5 w-5" />

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Modal */}

        {selected && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">

            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-background shadow-2xl">

              <div className="sticky top-0 flex items-center justify-between border-b bg-background px-8 py-6">

                <div>

                  <h2 className="text-3xl font-bold">

                    {selected.event_name}

                  </h2>

                  <p className="mt-1 text-muted-foreground">

                    {selected.event_date}

                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelected(null)
                  }
                  className="rounded-full p-2 hover:bg-muted"
                >

                  <X className="h-6 w-6" />

                </button>

              </div>

              <div className="grid gap-8 p-8 md:grid-cols-2">
                                {selected.recommendations.map(
                  (product, index) => (

                    <div
                      key={index}
                      className="overflow-hidden rounded-3xl border border-border bg-card transition hover:shadow-xl"
                    >

                      <img
                        src={
                          product.image_url ||
                          "https://placehold.co/600x700"
                        }
                        alt={product.name}
                        className="h-80 w-full object-cover"
                      />

                      <div className="p-6">

                        <div className="flex items-start justify-between">

                          <div>

                            <h3 className="text-xl font-bold">

                              {product.name}

                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">

                              {product.brand}

                            </p>

                          </div>

                          <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">

                            {Math.round(
                              product.recommendation_score ??
                                0
                            )}
                            %

                          </div>

                        </div>

                        <div className="mt-5 flex items-center gap-2">

                          <IndianRupee className="h-5 w-5" />

                          <span className="text-2xl font-bold">

                            {product.price?.toLocaleString(
                              "en-IN"
                            )}

                          </span>

                        </div>

                        {product.category && (

                          <div className="mt-5">

                            <span className="rounded-full bg-muted px-3 py-1 text-sm">

                              {product.category}

                            </span>

                          </div>

                        )}

                        {product.fit && (

                          <div className="mt-4">

                            <p className="text-sm font-semibold">

                              Fit

                            </p>

                            <p className="text-muted-foreground">

                              {product.fit}

                            </p>

                          </div>

                        )}

                        {product.colors &&
                          product.colors.length >
                            0 && (

                            <div className="mt-4">

                              <p className="mb-2 text-sm font-semibold">

                                Colors

                              </p>

                              <div className="flex flex-wrap gap-2">

                                {product.colors.map(
                                  (
                                    color,
                                    i
                                  ) => (

                                    <span
                                      key={i}
                                      className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary"
                                    >

                                      {color}

                                    </span>

                                  )
                                )}

                              </div>

                            </div>

                          )}

                        {product.styles &&
                          product.styles.length >
                            0 && (

                            <div className="mt-4">

                              <p className="mb-2 text-sm font-semibold">

                                Styles

                              </p>

                              <div className="flex flex-wrap gap-2">

                                {product.styles.map(
                                  (
                                    style,
                                    i
                                  ) => (

                                    <span
                                      key={i}
                                      className="rounded-full bg-muted px-3 py-1 text-sm"
                                    >

                                      {style}

                                    </span>

                                  )
                                )}

                              </div>

                            </div>

                          )}

                        {product.occasions &&
                          product.occasions.length >
                            0 && (

                            <div className="mt-4">

                              <p className="mb-2 text-sm font-semibold">

                                Occasions

                              </p>

                              <div className="flex flex-wrap gap-2">

                                {product.occasions.map(
                                  (
                                    occasion,
                                    i
                                  ) => (

                                    <span
                                      key={i}
                                      className="rounded-full bg-muted px-3 py-1 text-sm"
                                    >

                                      {occasion}

                                    </span>

                                  )
                                )}

                              </div>

                            </div>

                          )}

                        {product.match_reasons &&
                          product.match_reasons.length >
                            0 && (

                          <div className="mt-5">

                            <p className="mb-3 text-sm font-semibold">

                              Why this matches you

                            </p>

                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">

                              {product.match_reasons.map(
                                (
                                  reason,
                                  i
                                ) => (

                                  <li key={i}>

                                    {reason}

                                  </li>

                                )
                              )}

                            </ul>

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>
                          </div>

          </div>

        )}

        {loading && (

          <div className="mt-20 flex justify-center">

            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          </div>

        )}

      </div>

    </Layout>

  );

}
                  
          
          
