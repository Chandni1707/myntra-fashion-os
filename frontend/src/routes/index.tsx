import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { ArrowRight, Camera, Sparkles, Wand2, TrendingUp, Star, Play } from "lucide-react";
import heroModel from "../assets/hero-model.jpg";
import heroFlatlay from "../assets/hero-flatlay.jpg";
import heroBag from "../assets/hero-bag.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FashionOS — Your AI-Powered Personal Stylist" },
      { name: "description", content: "Snap a photo, describe your vibe, get AI-curated outfits in seconds. Fashion, reimagined." },
      { property: "og:title", content: "FashionOS — Your AI-Powered Personal Stylist" },
      { property: "og:description", content: "AI-curated outfits from thousands of pieces. Made for how you dress." },
    ],
  }),
  component: Home,
});

const brands = ["ZARA", "H&M", "COS", "UNIQLO", "MANGO", "ARIA", "LEVI'S", "ARKET"];

function Home() {
  const token = localStorage.getItem("fashionos_token");

if (!token) {
    return <Navigate to="/login" />;
}

return <Navigate to="/dashboard" />;
  
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden hero-mesh pt-24 pb-32 sm:pt-28 lg:pt-32">
        {/* Ambient blobs */}
        <div aria-hidden className="absolute top-20 -left-32 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, oklch(0.9 0.09 15), transparent 65%)" }} />
        <div aria-hidden className="absolute -bottom-20 right-0 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, oklch(0.92 0.08 40), transparent 65%)", animationDelay: "8s" }} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 grid gap-16 lg:grid-cols-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full card-glass px-4 py-2 text-xs font-medium">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-gradient">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              Introducing FashionOS 2.0
              <span className="text-muted-foreground">— now with mood matching</span>
            </span>

            <h1 className="mt-7 text-[3.25rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[0.95] tracking-[-0.04em]" style={{ fontFamily: "var(--font-display)" }}>
              Dress like <br />
              <em className="not-italic text-gradient">the future</em> <br />
              already knows you.
            </h1>

            <p className="mt-7 max-w-xl text-lg text-muted-foreground leading-relaxed">
              A private AI stylist that reads your vibe, remembers your closet, and curates outfits worth the double-take.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/capture" className="btn-primary rounded-full px-7 py-4 text-sm font-semibold inline-flex items-center gap-2">
                Style me now <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="btn-ghost-glass rounded-full px-6 py-4 text-sm font-semibold inline-flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Watch demo
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[heroModel, heroFlatlay, heroBag].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-11 w-11 rounded-full object-cover border-2 border-background shadow-sm" loading="lazy" width={44} height={44} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5"><span className="font-semibold text-foreground">28,000+</span> style icons trust FashionOS</p>
              </div>
            </div>
          </div>

          {/* Hero collage */}
          <div className="lg:col-span-6 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative h-[560px] sm:h-[640px]">
              {/* Main portrait */}
              <div className="absolute top-0 left-4 sm:left-8 w-[62%] h-[86%] rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(220,80,120,0.35)] rotate-[-2deg] hover-lift">
                <img src={heroModel} alt="Editorial fashion look" className="h-full w-full object-cover" width={1024} height={1280} />
              </div>
              {/* Side flatlay */}
              <div className="absolute top-8 right-0 w-[42%] h-[42%] rounded-[1.5rem] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)] rotate-[3deg] animate-float">
                <img src={heroFlatlay} alt="Fashion flatlay" className="h-full w-full object-cover" loading="lazy" width={800} height={1000} />
              </div>
              {/* Bag */}
              <div className="absolute bottom-4 right-2 w-[44%] h-[38%] rounded-[1.5rem] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)] rotate-[-3deg] animate-float" style={{ animationDelay: "2s" }}>
                <img src={heroBag} alt="Designer bag" className="h-full w-full object-cover" loading="lazy" width={800} height={1000} />
              </div>

              {/* AI Match glass card */}
              <div className="absolute bottom-24 left-0 sm:-left-4 card-glass p-4 max-w-[240px] animate-fade-up" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-gradient">
                    <Wand2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Stylist</p>
                    <p className="text-sm font-semibold">Match found — 98%</p>
                  </div>
                </div>
                <div className="mt-3 h-1 rounded-full bg-primary-soft overflow-hidden">
                  <div className="h-full w-[98%] bg-primary-gradient rounded-full" />
                </div>
              </div>

              {/* Trending pill */}
              <div className="absolute top-2 right-6 card-glass px-4 py-2 text-xs font-medium flex items-center gap-2 animate-fade-up" style={{ animationDelay: "0.7s" }}>
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Trending in Mumbai
              </div>
            </div>
          </div>
        </div>

        {/* Brand marquee */}
        <div className="relative mt-24 border-y border-border/50 py-6 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands, ...brands].map((b, i) => (
              <span key={i} className="mx-10 text-lg tracking-[0.3em] text-muted-foreground/60 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</span>
          <h2 className="mt-4 text-5xl lg:text-6xl leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
            Three taps.<br /><em className="text-gradient not-italic">Infinite outfits.</em>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Camera, num: "01", title: "Capture", desc: "Snap your current fit or upload a photo. We read every detail — cut, palette, silhouette." },
            { icon: Sparkles, num: "02", title: "Analyze", desc: "Our stylist AI cross-references your vibe against thousands of curated pieces in seconds." },
            { icon: TrendingUp, num: "03", title: "Recommend", desc: "Get personalized, wearable outfit combinations, updated in real time as your taste evolves." },
          ].map((f, i) => (
            <div key={i} className="card-elevated p-8 animate-fade-up group" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary group-hover:bg-primary-gradient group-hover:text-white transition-all duration-500">
                  <f.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{f.num}</span>
              </div>
              <h3 className="mt-6 text-2xl" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="mt-6 divider-gradient" />
              <Link to="/capture" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary link-underline">
                Try step {f.num} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial split section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-28">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(220,80,120,0.25)]">
              <img src={heroBag} alt="Fashion product" className="w-full h-[540px] object-cover" loading="lazy" width={800} height={1000} />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:right-6 card-glass px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Personal shopper</p>
              <p className="mt-1 text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>Available 24/7 <em className="text-primary">→</em></p>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:pl-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Curated intelligence</span>
            <h2 className="mt-4 text-5xl lg:text-6xl leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
              Not another <em className="not-italic text-gradient">algorithm.</em>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              FashionOS was trained on decades of editorial styling, not just click data. It understands proportion, palette, and the difference between "elegant" and "safe".
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Trained on 500+ luxury and high-street brands",
                "Learns your personal palette in under 5 fits",
                "Weekly refresh with runway & street trends",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-primary-gradient shrink-0">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-foreground/80">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary-gradient p-10 md:p-20 text-center shadow-[0_40px_80px_-20px_rgba(220,80,120,0.4)]">
          <div aria-hidden className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div aria-hidden className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-6xl leading-[1.05] text-primary-foreground max-w-3xl mx-auto" style={{ fontFamily: "var(--font-display)" }}>
              Your closet just got a <em className="italic">masters degree</em> in style.
            </h2>
            <p className="mt-5 text-primary-foreground/85 max-w-xl mx-auto">First 30 days on us. No credit card needed.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-7 py-4 text-sm font-semibold hover:scale-105 transition-transform shadow-xl">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-7 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                See dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
