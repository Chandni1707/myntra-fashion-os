import { Gem, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-gradient">
                <Gem className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="text-xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
                Fashion<span className="italic text-primary">OS</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              About FashionOS — an AI stylist that understands your taste and curates outfits for every moment of your day.
            </p>
          </div>

          <FooterCol title="Quick links" links={[
            { to: "/dashboard", label: "Dashboard" },
            { to: "/capture", label: "Fashion Capture" },
            { to: "/recommendations", label: "Recommendations" },
            { to: "/history", label: "History" },
            { to: "/profile", label: "Profile" },
            { to: "/settings", label: "Settings" },
          ]} />

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:hello@fashionos.app" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" /> hello@fashionos.app
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FashionOS. Crafted with intelligence.
          </p>
          <p className="text-xs text-muted-foreground">
            Style, curated by <span className="text-primary font-medium">AI</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm hover:text-primary transition-colors link-underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
