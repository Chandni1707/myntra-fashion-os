import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { Sparkles, Check, Loader2, ArrowLeft } from "lucide-react";
import api from "../lib/api";

export const Route = createFileRoute("/processing")({
  validateSearch: (search: Record<string, unknown>) => ({
    captureId: String(search.captureId ?? ""),
    prompt: String(search.prompt ?? ""),
  }),

  head: () => ({
    meta: [{ title: "Analyzing — FashionOS" }],
  }),

  component: ProcessingPage,
});

const STEPS = [
  "Upload Complete",
  "Understanding your fashion prompt",
  "Detecting clothing and accessories",
  "Extracting colors and fashion attributes",
  "Understanding style and occasion",
  "Finding visually similar products",
  "Running semantic search",
  "Building personalized outfit",
  "Finalizing recommendations",
];

function ProcessingPage() {
  const navigate = useNavigate();
  const { captureId, prompt } = Route.useSearch();
  const [step, setStep] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;


  const processCapture = async () => {

    try {

      // Upload Complete
   

      // --------------------------
      // Analyze
      // --------------------------

      await api.post(
        `/api/captures/${captureId}/analyze`
      );
      setStep(2);
      setStep(3);
      setStep(4);

      // --------------------------
      // Transform
      // --------------------------

      await api.post(
        `/api/captures/${captureId}/transform`,
        {
          prompt,
        }
      );

      setStep(5);

      // --------------------------
      // Recommend
      // --------------------------

      const result = await api.post(
  `/api/captures/${captureId}/recommend`
);

setStep(6);
// setStep(7);
// setStep(8);
// setStep(9);

console.log("========== RECOMMENDATION ==========");
console.log(result.data);

sessionStorage.setItem(
  "recommendation",
  JSON.stringify(result.data)
);
setStep(9);


navigate({
  to: "/recommendations",
});
      
      
   
      

      

    } catch (err) {

      console.error(err);

      alert("AI processing failed.");

    }

  };

  processCapture();

}, []);

  const progress = Math.min(100, Math.round((step / STEPS.length) * 100));

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] hero-mesh overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, oklch(0.66 0.22 12), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.2 30), transparent 70%)", animationDelay: "6s" }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
          <Link to="/capture" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Link>

          <div className="grid gap-10 lg:grid-cols-[auto_1fr] items-center">
            {/* Orb */}
            <div className="mx-auto lg:mx-0 relative h-56 w-56">
              <div className="absolute inset-0 rounded-full bg-primary-soft animate-ping opacity-60" />
              <div className="absolute inset-6 rounded-full bg-primary-soft" />
              <div className="absolute inset-0 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" style={{ animationDuration: "2.4s" }} />
              <div className="absolute inset-6 rounded-full border-2 border-primary/10 border-b-primary animate-spin" style={{ animationDuration: "3.6s", animationDirection: "reverse" }} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-primary-gradient text-primary-foreground shadow-xl shadow-primary/40 animate-float">
                  <Sparkles className="h-10 w-10" />
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Fashion AI
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Fashion AI is analyzing your <em className="text-primary not-italic">style</em>...
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Our AI is understanding your fashion inspiration and building personalized recommendations.
              </p>

              <div className="mt-6 max-w-xl">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary-gradient rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Estimated time · ~{Math.max(1, STEPS.length - step)}s remaining
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition-all animate-fade-up ${
                    done
                      ? "border-primary/30 bg-primary-soft/40"
                      : active
                        ? "border-primary bg-background shadow-lg scale-[1.02]"
                        : "border-border bg-background/60 opacity-60"
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full shrink-0 ${
                      done || active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </span>
                  <span className={`text-sm font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Layout>
  );
}
