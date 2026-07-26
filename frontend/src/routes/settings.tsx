import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import {
  Palette,
  Bell,
  Lock,
  Globe,
  User,
  AlertTriangle,
  Check,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FashionOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [notif, setNotif] = useState({ email: true, product: true, weekly: false });
  const [privacy, setPrivacy] = useState({ publicProfile: false, personalize: true });
  const [language, setLanguage] = useState("English");
  const [accountName, setAccountName] = useState("Aarav Sharma");

  const logout = () => {
    localStorage.removeItem("fashionos_token");
    navigate({ to: "/login" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Preferences
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fine-tune your FashionOS experience.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Section icon={Palette} title="Theme" description="Choose how FashionOS looks to you.">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light" as const, label: "Light", icon: Sun },
                { id: "dark" as const, label: "Dark", icon: Moon },
                { id: "system" as const, label: "System", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative rounded-2xl border p-4 text-left transition-all ${
                    theme === t.id
                      ? "border-primary bg-primary-soft/60 shadow-md"
                      : "border-border hover:border-primary/40 bg-background"
                  }`}
                >
                  <t.icon className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">{t.label}</p>
                  {theme === t.id && (
                    <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </Section>

          <Section icon={Bell} title="Notifications" description="Decide what pings you.">
            <div className="space-y-1">
              <Toggle
                label="Email notifications"
                sub="Get product updates and AI insights via email."
                on={notif.email}
                onChange={(v) => setNotif({ ...notif, email: v })}
              />
              <Toggle
                label="New recommendations"
                sub="Notify me when my AI stylist creates a new look."
                on={notif.product}
                onChange={(v) => setNotif({ ...notif, product: v })}
              />
              <Toggle
                label="Weekly style digest"
                sub="A curated weekly recap of trending pieces."
                on={notif.weekly}
                onChange={(v) => setNotif({ ...notif, weekly: v })}
              />
            </div>
          </Section>

          <Section icon={Lock} title="Privacy" description="Control what's shared.">
            <div className="space-y-1">
              <Toggle
                label="Public profile"
                sub="Let others discover your style board."
                on={privacy.publicProfile}
                onChange={(v) => setPrivacy({ ...privacy, publicProfile: v })}
              />
              <Toggle
                label="Personalized recommendations"
                sub="Use my captures to fine-tune future picks."
                on={privacy.personalize}
                onChange={(v) => setPrivacy({ ...privacy, personalize: v })}
              />
            </div>
          </Section>

          <Section icon={Globe} title="Language" description="Choose your preferred language.">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-72 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/60 transition-all"
            >
              {["English", "Français", "Español", "हिन्दी", "Deutsch", "日本語"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Section>

          <Section icon={User} title="Account preferences" description="Basic account info.">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Display name
            </label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="mt-2 w-full sm:w-96 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/60 transition-all"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold">Save changes</button>
              <button
                onClick={logout}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary inline-flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </Section>

          <div className="card-elevated p-6 border border-destructive/20 bg-destructive/5 animate-fade-up">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deleting your account is permanent. All captures and recommendations will be removed.
                </p>
                <button className="mt-4 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 inline-flex items-center gap-2 transition-opacity">
                  <Trash2 className="h-4 w-4" /> Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-6 animate-fade-up">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-none">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${
            on ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
