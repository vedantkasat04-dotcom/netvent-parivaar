import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, LogOut } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/parivaar", label: "Our Parivaar" },
  { href: "/groups", label: "Discussion Forum" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navBg = "rgba(255,255,255,0.97)";
  const navShadow = scrolled ? "0 2px 24px rgba(14,27,42,0.10)" : "0 1px 0 rgba(63,167,150,0.10)";
  const navBorder = "1px solid rgba(63,167,150,0.12)";
  const linkColor = NAVY;
  const logoColor = TEAL;

  const initial = user?.name?.charAt(0).toUpperCase() ?? "";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ background: navBg, boxShadow: navShadow, borderBottom: navBorder, backdropFilter: scrolled ? "blur(12px)" : "none" }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold font-heading text-xl text-white transition-colors"
              style={{ background: TEAL }}>N</div>
            <span className="font-heading font-bold text-lg transition-colors" style={{ color: logoColor }}>
              NetVent Parivaar
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm font-medium relative transition-colors group"
                style={{ color: isActive(href) ? TEAL : linkColor }}>
                {label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 rounded-full transition-all duration-300"
                  style={{ background: TEAL, width: isActive(href) ? "100%" : "0%", display: "block" }}
                  onMouseEnter={e => (e.currentTarget.style.width = "100%")}
                  onMouseLeave={e => !isActive(href) && (e.currentTarget.style.width = "0%")}
                />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium transition-colors" style={{ color: linkColor }}>
                  Dashboard
                </Link>
                <Link href="/dashboard">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-105"
                    style={{ border: `2px solid ${TEAL}`, background: "#EAF4F4" }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: TEAL }}>{initial}</span>
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} aria-label="Log out"
                  className="h-9 w-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                  style={{ color: NAVY }}>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: linkColor }}>
                  Log in
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full px-5 font-semibold text-white transition-all hover:scale-105 hover:shadow-md"
                    style={{ background: TEAL, border: "none" }}>
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
            style={{ color: NAVY }}
            onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "rgba(14,27,42,0.4)", opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <nav
          className="absolute top-0 right-0 h-full w-72 flex flex-col pt-20 px-6 pb-8 transition-transform duration-300"
          style={{
            background: "#EAF4F4",
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            pointerEvents: mobileOpen ? "auto" : "none",
            boxShadow: "-8px 0 40px rgba(14,27,42,0.15)",
          }}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-lg font-semibold py-3 px-4 rounded-xl transition-colors"
                style={{ color: isActive(href) ? TEAL : NAVY, background: isActive(href) ? "rgba(63,167,150,0.08)" : "transparent" }}>
                {label}
              </Link>
            ))}
          </div>
          <div className="my-4" style={{ height: "1px", background: "rgba(63,167,150,0.2)" }} />
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-base py-2.5 px-4 font-medium rounded-xl" style={{ color: NAVY }}>Dashboard</Link>
                <button onClick={handleLogout} className="text-base py-2.5 px-4 font-medium rounded-xl text-left flex items-center gap-2" style={{ color: NAVY }}>
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-base py-2.5 px-4 font-medium rounded-xl" style={{ color: NAVY }}>Log in</Link>
                <Link href="/signup">
                  <Button className="w-full rounded-full font-semibold text-white mt-2" style={{ background: TEAL, border: "none" }}>
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Spacer for fixed nav */}
      <div style={{ height: "64px" }} />
    </>
  );
}
