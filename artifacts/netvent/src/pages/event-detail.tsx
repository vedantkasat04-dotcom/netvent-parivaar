import { Link, useParams } from "wouter";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, ExternalLink, Phone } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

// NetVentrepreneur specific event ID
const NETVENTREPRENEUR_ID = "0c915525-59ed-437c-896d-d043d5535c63";

const COMMITTEES = [
  {
    name: "The Board Room",
    tagline: "Are you the smartest in the room?",
    flow: "Prove → Speak → Lead",
    desc: "Step into the shoes of a business leader and navigate high-stakes decisions, strategy, and leadership.",
    icon: "🏛️",
  },
  {
    name: "The Floor",
    tagline: "Defend like your life depends on it. Attack like you have multiple lives.",
    flow: "Strategy · Negotiation · Position",
    desc: "A fast-paced committee where strategy, negotiation, and the ability to defend your position are everything.",
    icon: "⚔️",
  },
  {
    name: "The Crisis Cabinet",
    tagline: "The clock is ticking. Save the organisation now…",
    flow: "Assess → Decide → Act",
    desc: "Handle unexpected business crises, make critical decisions under pressure, and lead your organisation through uncertainty.",
    icon: "🚨",
  },
  {
    name: "Shark Tank",
    tagline: "Pitch → Defend → Raise",
    flow: "Pitch → Defend → Raise",
    desc: "Present your business idea, convince the investors, defend your vision, and raise the stakes.",
    icon: "🦈",
  },
  {
    name: "The Launchpad",
    tagline: "Ideate → Create → Market → Challenge → Expand",
    flow: "Ideate → Create → Market → Challenge → Expand",
    desc: "Turn your idea into a business, take it to the market, tackle challenges, and scale your venture.",
    icon: "🚀",
  },
];

function NetVentrepreneurDetail() {
  return (
    <div style={{ background: "#f7fafa", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a4a 50%, #0d2535 100%)`, padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(63,167,150,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(63,167,150,0.1) 0%, transparent 40%)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <Link href="/events">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 32, background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={16} /> Back to Events
            </button>
          </Link>

          <div style={{ display: "inline-block", background: "rgba(63,167,150,0.2)", border: "1px solid rgba(63,167,150,0.4)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: TEAL, marginBottom: 20, fontWeight: 600, letterSpacing: "0.05em" }}>
            NetVent Parivaar Presents
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, color: "white", lineHeight: 1.1, margin: "0 0 16px", fontFamily: "inherit" }}>
            NetVent<span style={{ color: TEAL }}>repreneur</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "rgba(255,255,255,0.7)", marginBottom: 40, fontStyle: "italic", letterSpacing: "0.1em" }}>
            Business · Beyond · Boundaries
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
              <Calendar size={18} style={{ color: TEAL }} />
              <span>31st October &amp; 1st November 2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
              <MapPin size={18} style={{ color: TEAL }} />
              <span>Vadodara (Venue TBA)</span>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <a href="https://forms.gle/TmSGLs4HdLvHTxKF9" target="_blank" rel="noopener noreferrer">
              <button style={{ background: TEAL, color: "white", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                Register Now <ExternalLink size={16} />
              </button>
            </a>
            <div style={{ background: "rgba(63,167,150,0.15)", border: "1px solid rgba(63,167,150,0.3)", borderRadius: 10, padding: "14px 24px", color: "white", fontSize: 15 }}>
              Early Bird: <span style={{ color: TEAL, fontWeight: 700 }}>₹1,800</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>

        {/* About */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 16 }}>About the Event</h2>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#4A5568", maxWidth: 700 }}>
            NetVentrepreneur is an initiative by NetVent Parivaar that aims to foster entrepreneurship, creativity, leadership, and business acumen among young minds. It provides participants with an immersive platform to think beyond boundaries, take strategic decisions, build ideas, and experience the world of business.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#718096", marginTop: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
            Challenging the future Tycoons of Bharat.
          </p>
        </section>

        {/* Committees */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 8 }}>Our Committees</h2>
          <p style={{ color: "#718096", marginBottom: 32, fontSize: "0.95rem" }}>5 arenas. One chance to prove yourself.</p>

          <div style={{ display: "grid", gap: 20 }}>
            {COMMITTEES.map((c, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, padding: "28px 32px", border: "1px solid #E2E8F0", display: "flex", gap: 24, alignItems: "flex-start", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "2.5rem", flexShrink: 0, marginTop: 4 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>{c.name}</h3>
                  <p style={{ fontSize: "0.9rem", color: TEAL, fontWeight: 600, margin: "0 0 8px", fontStyle: "italic" }}>{c.tagline}</p>
                  <p style={{ fontSize: "0.95rem", color: "#4A5568", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                  <div style={{ marginTop: 12, background: `rgba(63,167,150,0.08)`, borderRadius: 8, padding: "8px 14px", display: "inline-block", fontSize: "0.85rem", color: TEAL, fontWeight: 600 }}>
                    {c.flow}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Registration + Contact */}
        <section style={{ background: NAVY, borderRadius: 20, padding: "48px 40px", color: "white" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8, color: "white" }}>Register Now</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, fontSize: "0.95rem", lineHeight: 1.6 }}>
                Early bird fee: <strong style={{ color: TEAL }}>₹1,800</strong><br />
                Dates: 31st Oct &amp; 1st Nov 2026<br />
                Venue: Vadodara (TBA)
              </p>
              <a href="https://forms.gle/TmSGLs4HdLvHTxKF9" target="_blank" rel="noopener noreferrer">
                <button style={{ background: TEAL, color: "white", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                  Fill Registration Form <ExternalLink size={16} />
                </button>
              </a>
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 20, color: "white" }}>Contact Us</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Phone size={18} style={{ color: TEAL, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 2 }}>Parth Kasat</div>
                    <a href="tel:+919137061145" style={{ color: "white", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>+91 91370 61145</a>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Phone size={18} style={{ color: TEAL, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 2 }}>Vedant Kasat</div>
                    <a href="tel:+919137061147" style={{ color: "white", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>+91 91370 61147</a>
                  </div>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: 24 }}>
                Regards,<br />
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>NetVent Parivaar</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();

  // NetVentrepreneur gets special page
  if (eventId === NETVENTREPRENEUR_ID) {
    return (
      <AppLayout>
        <NetVentrepreneurDetail />
      </AppLayout>
    );
  }

  const { data: eventResponse, isLoading } = useGetEvent(eventId || "", {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId || "") },
  });
  const event = eventResponse?.data;

  if (isLoading) {
    return <AppLayout><div className="container py-20 text-center" style={{ color: "#4A5568" }}>Loading event…</div></AppLayout>;
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container py-20 text-center" style={{ color: "#4A5568" }}>
          <p className="mb-4">Event not found.</p>
          <Link href="/events"><Button variant="outline" style={{ borderColor: TEAL, color: TEAL }}>Back to Events</Button></Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ background: "#f7fafa", minHeight: "calc(100vh - 16rem)", padding: "60px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/events">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, color: TEAL, fontSize: 14, marginBottom: 32, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Events
            </button>
          </Link>
          <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ height: 200, background: `linear-gradient(120deg, ${TEAL}, #2d8576)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={64} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
            <div style={{ padding: "40px" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: NAVY, marginBottom: 12 }}>{event.title}</h1>
              {event.venue && (
                <p style={{ display: "flex", alignItems: "center", gap: 6, color: "#718096", marginBottom: 8, fontSize: "0.95rem" }}>
                  <MapPin size={16} style={{ color: TEAL }} /> {event.venue}
                </p>
              )}
              {event.eventDate && (
                <p style={{ display: "flex", alignItems: "center", gap: 6, color: "#718096", marginBottom: 24, fontSize: "0.95rem" }}>
                  <Calendar size={16} style={{ color: TEAL }} />
                  {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              {event.description && (
                <p style={{ color: "#4A5568", lineHeight: 1.8, fontSize: "1rem" }}>{event.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
