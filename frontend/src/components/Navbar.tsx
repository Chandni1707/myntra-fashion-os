import api from "../lib/api";
import { Link, useNavigate } from "@tanstack/react-router";
import { Gem, User, Menu, X, LogOut, Settings, LayoutDashboard, ChevronDown, CalendarHeart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/capture", label: "Fashion Capture" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/event-planner", label: "Event Planner" },
  { to: "/history", label: "History" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<{
  name: string;
  email: string;
} | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => {
  const loadUser = async () => {
    try {
      const { data } = await api.get("/profile");
      setUser(data);
    } catch (err) {
      console.error("Failed to load navbar user:", err);
    }
  };

  loadUser();
}, []);

  const logout = () => {
    localStorage.removeItem("fashionos_token");
    setMenu(false);
    navigate({ to: "/login" });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_20px_-8px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary-gradient shadow-[0_8px_20px_-8px_rgba(255,63,108,0.6)] transition-transform group-hover:scale-105">
            <Gem className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-xl font-medium tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Fashion<span className="italic text-primary">OS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[13px] font-medium tracking-wide text-foreground/70 hover:text-primary transition-colors link-underline"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(!menu)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-2 py-1.5 hover:border-primary transition-colors"
              aria-label="User menu"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-gradient text-primary-foreground">
                <User className="h-3.5 w-3.5" />
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${menu ? "rotate-180" : ""}`} />
            </button>

            {menu && (
              <div className="absolute right-0 mt-2 w-56 card-elevated overflow-hidden animate-fade-in p-2">
                <div className="px-3 py-3 border-b border-border">
                  <p className="text-sm font-semibold">
  {user?.name || "User"}
</p>
                  <p className="text-xs text-muted-foreground truncate">
  {user?.email || ""}
</p>
                </div>
                <div className="py-1">
                  <MenuLink to="/profile" icon={User} label="Profile" onClick={() => setMenu(false)} />
                  <MenuLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenu(false)} />
                  <MenuLink to="/event-planner" icon={CalendarHeart} label="Event Planner" onClick={() => setMenu(false)} />
                  <MenuLink to="/settings" icon={Settings} label="Settings" onClick={() => setMenu(false)} />
                </div>
                <button
                  onClick={logout}
                  className="w-full mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-background/70 backdrop-blur border border-border"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/90 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col px-5 py-5 gap-1">
            {[...links, { to: "/profile", label: "Profile" }, { to: "/settings", label: "Settings" }].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-base font-medium py-3 border-b border-border/40"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="mt-4 text-center btn-primary rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary-soft hover:text-primary transition-colors"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
