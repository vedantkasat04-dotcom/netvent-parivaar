import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Instagram, Mail, X } from "lucide-react";

const TEAL = "#3FA796";

const INSTAGRAM_HANDLES = [
  { handle: "netvent_parivaar", url: "https://instagram.com/netvent_parivaar" },
  { handle: "netvent_vadodara", url: "https://instagram.com/netvent_vadodara" },
  { handle: "netvent_ahmedabad", url: "https://instagram.com/netvent_ahmedabad" },
  { handle: "netvent_pune", url: "https://instagram.com/netvent_pune" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Our Parivaar", href: "/parivaar" },
  { label: "Discussion Forum", href: "/groups" },
  { label: "Join NetVent", href: "/join" },
];

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfF8QTuGxV8Ce1nLf7wvtrP-QZBzFkb23RmndIb5ltQWzfJow/viewform?embedded=true";

// ---------- Loading splash (once per session) ----------
function LoadingSplash() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    if (typeof window === "undefined") return;
    const shown = sessionStorage.getItem("nvp_splash_shown");
    if (shown) return;

    setVisible(true);
    sessionStorage.setItem("nvp_splash_shown", "1");

    // Start fade out at 1.6s, unmount at 2.2s
    const t1 = setTimeout(() => setFadeOut(true), 1600);
    const t2 = setTimeout(() => setVisible(false), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#EAF4F4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <img
        src="/logo.png"
        alt="NetVent Parivaar"
        style={{
          height: "clamp(90px, 18vw, 180px)",
          width: "auto",
          objectFit: "contain",
          animation: "nvp-splash-zoom 1.6s ease-out forwards",
        }}
      />
      <style>{`
        @keyframes nvp-splash-zoom {
          0%   { transform: scale(0.6); opacity: 0; }
          40%  { transform: scale(1.05); opacity: 1; }
          70%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1.18); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ---------- Event popup (once per session) ----------
function NotifyPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("nvp_event_popup_seen")) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem("nvp_event_popup_seen", "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 480,
          width: "100%",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer",
            color: "white", fontSize: 18, lineHeight: "32px", textAlign: "center",
          }}
        >
          ×
        </button>

        {/* Poster image */}
        <img
          src="/events/netventrepreneur-popup.jpg"
          alt="NetVentrepreneur Vadodara"
          style={{ width: "100%", display: "block" }}
        />

        {/* Register Now button */}
        
<a
          href="https://forms.gle/TmSGLs4HdLvHTxKF9"
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          style={{
            display: "block",
            background: "#3FA796",
            color: "white",
            textAlign: "center",
            padding: "16px",
            fontWeight: 700,
            fontSize: 18,
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          Register Now →
        </a>
      </div>
    </div>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LoadingSplash />
      <NotifyPopup />

      <Navbar />
      <main className="flex-1">{children}</main>

      <footer style={{ background: "#0A1628" }}>
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
            {/* Brand */}
            <div>
              <div className="mb-3">
                <img
                  src="/logo.png"
                  alt="NetVent Parivaar"
                  style={{ height: "56px", width: "auto", objectFit: "contain" }}
                />
              </div>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Bharat ka apna Parivaar
              </p>
              <a
                href="mailto:netventparivaar@gmail.com"
                className="flex items-center gap-2 text-sm group transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <Mail className="w-4 h-4" style={{ color: "rgba(255,255,255,0.35)" }} />
                <span className="group-hover:text-[#3FA796] transition-colors">
                  netventparivaar@gmail.com
                </span>
              </a>
            </div>

            {/* Quick links */}
            <div>
              <h3
                className="font-semibold mb-5 text-xs uppercase tracking-widest"
                style={{ color: TEAL }}
              >
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-sm transition-colors hover:text-[#3FA796]"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instagram */}
            <div>
              <h3
                className="font-semibold mb-5 text-xs uppercase tracking-widest"
                style={{ color: TEAL }}
              >
                Follow Us on Instagram
              </h3>
              <ul className="space-y-3">
                {INSTAGRAM_HANDLES.map(({ handle, url }) => (
                  <li key={handle}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm group transition-colors"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    >
                      <Instagram
                        className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-[#3FA796]"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      />
                      <span className="group-hover:text-[#3FA796] transition-colors">
                        @{handle}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="pt-8 text-center text-xs"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.28)",
            }}
          >
            © {new Date().getFullYear()} NetVent Parivaar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
