import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Instagram, Mail } from "lucide-react";

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

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>

      <footer style={{ background: "#0A1628" }}>
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
            {/* Brand */}
            <div>
              <div className="mb-3">
                <img src="/logo.png" alt="NetVent Parivaar" style={{ height: "56px", width: "auto", objectFit: "contain" }} />
              </div>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Bharat ka apna Parivaar
              </p>
              <a href="mailto:netventparivaar@gmail.com"
                className="flex items-center gap-2 text-sm group transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                <Mail className="w-4 h-4" style={{ color: "rgba(255,255,255,0.35)" }} />
                <span className="group-hover:text-[#3FA796] transition-colors">netventparivaar@gmail.com</span>
              </a>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{ color: TEAL }}>
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="text-sm transition-colors hover:text-[#3FA796]"
                      style={{ color: "rgba(255,255,255,0.6)" }}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instagram */}
            <div>
              <h3 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{ color: TEAL }}>
                Follow Us on Instagram
              </h3>
              <ul className="space-y-3">
                {INSTAGRAM_HANDLES.map(({ handle, url }) => (
                  <li key={handle}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm group transition-colors"
                      style={{ color: "rgba(255,255,255,0.65)" }}>
                      <Instagram className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-[#3FA796]"
                        style={{ color: "rgba(255,255,255,0.35)" }} />
                      <span className="group-hover:text-[#3FA796] transition-colors">@{handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.28)" }}>
            © {new Date().getFullYear()} NetVent Parivaar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
