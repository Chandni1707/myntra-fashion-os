import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { Mail, Lock, Sparkles } from "lucide-react";
import api from "../lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — FashionOS" }, { name: "description", content: "Login to FashionOS." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem(
  "fashionos_token",
  data.access_token
);

navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="text-center animate-fade-up">
          <span className="inline-grid h-12 w-12 place-items-center rounded-2xl btn-primary">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Login to continue styling with AI.</p>
        </div>

        <form onSubmit={submit} className="mt-8 card-elevated p-6 space-y-4 animate-fade-up">
          <Field icon={Mail} type="email" placeholder="Email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
          <Field icon={Lock} type="password" placeholder="Password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary rounded-full py-3 text-sm font-semibold disabled:opacity-60">
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}

function Field({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-full border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition"
        required
      />
    </div>
  );
}
