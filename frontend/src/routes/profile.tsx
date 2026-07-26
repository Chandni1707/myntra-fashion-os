import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  User,
  Mail,
  Edit3,
  KeyRound,
  Heart,
  Sparkles,
  TrendingUp,
  Palette,
  Shirt,
  Ruler,
  Wallet,
  Users,
  Star,
} from "lucide-react";
import api from "../lib/api";


export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FashionOS" }] }),
  component: ProfilePage,
});


interface Profile {
  name: string;
  email: string;

  looks_generated: number;
  favorites: number;
  style_score: number;

  favorite_colors: string[];
  favorite_styles: string[];
  favorite_brands: string[];

  fit?: string;
  budget?: string;
  gender?: string;
}



function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/profile");
        setProfile(data);
      } catch {
            setProfile({
        name: "",
        email: "",
        looks_generated: 0,
        favorites: 0,
        style_score: 0,
        favorite_colors: [],
        favorite_styles: [],
        favorite_brands: [],
    });

        
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    })();
  }, []);
  const saveProfile = async () => {
  if (!profile) return;

  try {
    await api.put("/profile", {
      favorite_colors: profile.favorite_colors,
      favorite_styles: profile.favorite_styles,
      favorite_brands: profile.favorite_brands,
      fit: profile.fit || "",
      budget: profile.budget || "",
      gender: profile.gender || "",
    });

    alert("Profile updated successfully!");
    setEditing(false);

  } catch (err) {
    console.error(err);
    alert("Failed to update profile");
  }
};

  if (loading || !profile) {
    return <Layout><LoadingSpinner label="Loading profile..." /></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="card-elevated overflow-hidden animate-fade-up">
          <div className="h-40 bg-primary-gradient relative">
            <div
              aria-hidden
              className="absolute inset-0 opacity-40"
              style={{ background: "radial-gradient(circle at 30% 40%, oklch(1 0 0 / 0.4), transparent 60%)" }}
            />
          </div>
          <div className="p-6 -mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-5">
                <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-background border-4 border-background shadow-xl text-primary">
                  <User className="h-12 w-12" />
                </div>
                <div className="min-w-0 pb-2">
                  <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {profile.name}
                  </h1>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {profile.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pb-2">
                <button
                  onClick={() => {
    if (editing) {
        saveProfile();
    } else {
        setEditing(true);
    }
}}
                  className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" /> {editing ? "Done" : "Edit profile"}
                </button>
                <button
                  onClick={() => navigate({ to: "/settings" })}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary inline-flex items-center gap-2 transition-colors"
                >
                  <KeyRound className="h-4 w-4" /> Change password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, label: "AI Looks", value: profile.looks_generated,},
            { icon: Heart, label: "Favorites",value: profile.favorites, },
            { icon: TrendingUp, label: "Style score", value: profile.style_score,},
          ].map((s, i) => (
            <div key={i} className="card-elevated p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <PrefCard icon={Palette} title="Preferred colors">
            <ChipList
              items={profile.favorite_colors}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, favorite_colors: v })}
            />
          </PrefCard>
          <PrefCard icon={Shirt} title="Preferred styles">
            <ChipList
              items={profile.favorite_styles}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, favorite_styles: v })}
            />
          </PrefCard>
          <PrefCard icon={Ruler} title="Preferred fit">
            <SingleField
              value={profile.fit || "Relaxed"}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, fit: v })}
            />
          </PrefCard>
          <PrefCard icon={Wallet} title="Budget preference">
            <SingleField
              value={profile.budget || "₹2,000 - ₹6,000"}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, budget: v })}
            />
          </PrefCard>
          <PrefCard icon={Users} title="Gender preference">
            <SingleField
              value={profile.gender || "Unisex"}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, gender: v })}
            />
          </PrefCard>
          <PrefCard icon={Star} title="Favorite brands">
            <ChipList
              items={profile.favorite_brands}
              editing={editing}
              onChange={(v) => setProfile({ ...profile, favorite_brands: v })}
            />
          </PrefCard>
        </div>
      </div>
    </Layout>
  );
}

function PrefCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChipList({
  items,
  editing,
  onChange,
}: {
  items: string[];
  editing: boolean;
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary"
          >
            {s}
            {editing && (
              <button
                aria-label="Remove"
                onClick={() => onChange(items.filter((x) => x !== s))}
                className="text-primary/70 hover:text-primary"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground">No items yet.</span>
        )}
      </div>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (v && !items.includes(v)) onChange([...items, v]);
            setInput("");
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add and press Enter"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
            Add
          </button>
        </form>
      )}
    </div>
  );
}

function SingleField({
  value,
  editing,
  onChange,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  if (editing) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/60 transition-all"
      />
    );
  }
  return <p className="text-base font-semibold">{value}</p>;
}
