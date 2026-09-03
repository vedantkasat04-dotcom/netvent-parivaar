import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Heart, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// -----------------------------------------------------------------------------
// HERO IMAGES — pointing to gallery photos in /public/gallery/
// To change hero photos: upload naye photos to public/hero/ folder
// and change the paths below (e.g. "/hero/hero-1.jpg")
// -----------------------------------------------------------------------------
const HERO_IMAGES = [
  { src: "/gallery/gallery-01.jpg", objectPosition: "50% 85%" },
  { src: "/gallery/gallery-02.jpg", objectPosition: "50% 80%" },
  { src: "/gallery/gallery-03.jpg", objectPosition: "50% 75%" },
];

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

const SPONSORS = [
  "Harsha Engineers",
  "New Edge",
  "Kangen",
  "Urban Jungle",
  "Madhuvan Group",
  "Decathlon",
  "Rasna",
  "Woogom",
  "Neutron Jeans",
];

function useFadeUp(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.65s ease, transform 0.65s ease`,
  };
  return { ref, style };
}

function useCountUp(target: number, suffix = "", duration = 2200) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const hasRun = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.floor(eased * target);
            setDisplay(val + (p < 1 ? "" : suffix));
            if (p < 1) requestAnimationFrame(tick);
            else setDisplay(target + suffix);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, duration]);
  return { ref, display };
}

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 380);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + HERO_IMAGES.length) % HERO_IMAGES.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % HERO_IMAGES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const badge = useFadeUp(0);
  const headline = useFadeUp(150);
  const ctas = useFadeUp(300);

  return (
    <section style={{ background: LIGHT_BLUE }}>
      <div className="relative w-full overflow-hidden">
        <img
          src={HERO_IMAGES[current].src}
          alt="NetVent community"
          className="w-full block"
          style={{
            height: "clamp(62vh, 78vw, 92vh)",
            objectFit: "cover",
            objectPosition: HERO_IMAGES[current].objectPosition,
            background: "#0E1B2A",
            opacity: fading ? 0 : 1,
            transition: "opacity 0.45s ease-in-out",
          }}
        />
        <button onClick={prev} aria-label="Previous"
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full transition-all hover:scale-110 focus:outline-none"
          style={{ background: "rgba(14,27,42,0.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={next} aria-label="Next"
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full transition-all hover:scale-110 focus:outline-none"
          style={{ background: "rgba(14,27,42,0.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
              className="focus:outline-none transition-all duration-300"
              style={{ width: i === current ? "28px" : "8px", height: "8px", borderRadius: "9999px",
                background: i === current ? "#fff" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10 md:pt-14 pb-16 md:pb-20 text-center max-w-3xl">
        <div ref={badge.ref} style={badge.style} className="mb-6 md:mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.9)", color: TEAL, border: `1.5px solid rgba(63,167,150,0.3)`, boxShadow: "0 2px 12px rgba(63,167,150,0.12)" }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: TEAL }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: TEAL }} />
            </span>
            Bharat ka apna Parivaar
          </span>
        </div>

        <div ref={headline.ref} style={headline.style}>
          <h1 className="font-heading font-bold leading-tight mb-8 md:mb-10" style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)", color: NAVY }}>
            Where Bharat's Youth Interact to<br />Connect, Collaborate, and Lead.
          </h1>
        </div>

        <div ref={ctas.ref} style={ctas.style} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/join">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-13 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: TEAL, border: "none", height: "52px" }}>
              Join the Parivaar →
            </Button>
          </Link>
          <Link href="/events">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-13 text-base font-semibold transition-all hover:scale-105"
              style={{ background: "#fff", color: TEAL, borderColor: TEAL, height: "52px" }}>
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon, value, suffix, label, delay }: { icon: React.ReactNode; value: number; suffix: string; label: string; delay: number }) {
  const { ref, display } = useCountUp(value, suffix);
  const fade = useFadeUp(delay);
  return (
    <div ref={(el) => { (ref as any).current = el; (fade.ref as any).current = el; }}
      style={{ ...fade.style, textAlign: "center" }}>
      <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{ background: "rgba(63,167,150,0.15)" }}>
        <span style={{ color: TEAL }}>{icon}</span>
      </div>
      <div className="font-heading font-bold mb-2" style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", color: "#fff" }}>
        {display}
      </div>
      <p className="text-sm font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
    </div>
  );
}

function StatsBanner() {
  const title = useFadeUp(0);
  const sub = useFadeUp(100);
  return (
    <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #0E1B2A 0%, #1a3040 60%, #0E1B2A 100%)" }}>
      <div className="container mx-auto">
        <div ref={title.ref} style={{ ...title.style, textAlign: "center", marginBottom: "8px" }}>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">Our Impact So Far</h2>
        </div>
        <div ref={sub.ref} style={{ ...sub.style, textAlign: "center", marginBottom: "56px" }}>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Real numbers. Real connections. Real Parivaar.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatItem icon={<Users className="w-7 h-7" />} value={600} suffix="+" label="Youth Connected" delay={0} />
          <StatItem icon={<MapPin className="w-7 h-7" />} value={3} suffix="" label="Cities Covered" delay={100} />
          <StatItem icon={<Heart className="w-7 h-7" />} value={75} suffix="+" label="Parivaar Members" delay={200} />
          <StatItem icon={<Calendar className="w-7 h-7" />} value={4} suffix="" label="Events Organised" delay={300} />
        </div>
      </div>
    </section>
  );
}

function WhatIsNetVent() {
  const h = useFadeUp(0);
  const p1 = useFadeUp(100);
  const p2 = useFadeUp(200);
  const p3 = useFadeUp(300);
  const h2 = useFadeUp(400);
  const p4 = useFadeUp(500);
  const p5 = useFadeUp(600);
  const closing = useFadeUp(700);

  return (
    <section className="py-24 px-4" style={{ background: "#F0F9F8" }}>
      <div className="container mx-auto max-w-2xl">
        <div ref={h.ref} style={{ ...h.style, textAlign: "center", marginBottom: "40px" }}>
          <h2 className="font-heading font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: NAVY }}>
            What is <em style={{ color: TEAL, fontStyle: "italic" }}>NetVent</em>?
          </h2>
          <p className="text-xl font-semibold" style={{ color: TEAL, fontStyle: "italic" }}>
            Networking through Events.
          </p>
        </div>

        <div className="space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "#4A5568" }}>
          <div ref={p1.ref} style={p1.style}>
            <p>We design and host academic and co-curricular experiences, ranging from high-energy Model UN conferences to community nights and specialised activities. Every event we put together has one main goal in mind: bringing the right people together.</p>
          </div>

          <div ref={p2.ref} style={p2.style}>
            <p>We take traditional gatherings and turn them into spaces where real ideas are shared and conversations actually mean something. Every room we set up is meant to connect what you learn in theory with what you do in the real world, making sure every chat you have could lead to your next big collaboration.</p>
          </div>

          <div ref={p3.ref} style={p3.style}>
            <p className="font-semibold text-xl" style={{ color: NAVY }}>The right people. The right rooms. The right conversations.</p>
          </div>
        </div>

        <div ref={h2.ref} style={{ ...h2.style, textAlign: "center", marginTop: "72px", marginBottom: "32px" }}>
          <h3 className="font-heading font-bold mb-3" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", color: NAVY }}>
            Welcome to the <em style={{ color: TEAL, fontStyle: "italic" }}>Parivaar</em>
          </h3>
        </div>

        <div className="space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "#4A5568" }}>
          <div ref={p4.ref} style={p4.style}>
            <p>We are building much more than just a platform for events. We are a Parivaar, a youth community that works with the ambition of professionals while supporting each other like a family. At NetVent Parivaar, you never just attend an event and go home. You become part of a network that stays with you.</p>
          </div>

          <div ref={p5.ref} style={p5.style}>
            <p>That means having a group of peers who actually celebrate your wins, help you out through challenges, and push you to reach your full potential. We want to move away from networking that feels forced or transactional. Instead, we focus on building genuine relationships, so that long after the event is over, you still have a community standing right by your side.</p>
          </div>

          <div ref={closing.ref} style={{ ...closing.style, textAlign: "center", paddingTop: "24px" }}>
            <p className="font-bold italic" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: TEAL }}>
              It becomes your Parivaar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderCard({ name, title, quote, photoSrc, delay, objectPosition = "50% 20%" }: { name: string; title: string; quote: string; photoSrc: string; delay: number; objectPosition?: string }) {
  const fade = useFadeUp(delay);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div ref={fade.ref} style={{ ...fade.style, height: "100%" }}>
      <div className="group rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-2 h-full flex flex-col"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 32px rgba(0,0,0,0.25)" }}>
        <div className="w-full overflow-hidden flex-shrink-0" style={{ aspectRatio: "4/3", background: "linear-gradient(135deg, #1a3040, #3FA796)" }}>
          {!imgErr ? (
            <img src={photoSrc} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition }}
              onError={() => setImgErr(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-heading font-bold text-white" style={{ fontSize: "5rem", opacity: 0.3 }}>
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="p-7 flex-1 flex flex-col">
          <h3 className="font-heading font-bold text-2xl text-white mb-1">{name}</h3>
          <p className="text-sm font-semibold mb-5" style={{ color: TEAL }}>{title}</p>
          <blockquote className="pl-4 italic leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", borderLeft: `3px solid ${TEAL}`, fontSize: "0.95rem" }}>
            "{quote}"
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function FoundersDesk() {
  const h = useFadeUp(0);

  return (
    <section className="py-24 px-4" style={{ background: NAVY }}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div ref={h.ref} style={h.style}>
            <h2 className="font-heading font-bold text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)" }}>
              From the Founders' Desk
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <FounderCard
            name="Parth Kasat"
            title="Founder"
            quote="NetVent began with a simple ideology: just as human evolution relied on the building of societies, today's youth need strong communities to come together and create something meaningful. Ultimately, we believe that true power lies in connection and networking."
            photoSrc="/founders/parth.jpg"
            delay={0}
          />
          <FounderCard
            name="Vedant Kasat"
            title="Co-Founder"
            quote="Every event has taught me one thing: people aren't just looking for certificates or networking. They're looking for genuine connections. That's what we're trying to build with NetVent."
            photoSrc="/founders/vedant.jpg" objectPosition="50% 30%" objectPosition="50% 20%"
            delay={150}
          />
        </div>
      </div>
    </section>
  );
}

function SponsorsCarousel() {
  const label = useFadeUp(0);
  const loop = [...SPONSORS, ...SPONSORS];

  return (
    <section className="py-16" style={{ background: "#F7FBFA", borderTop: "1px solid rgba(63,167,150,0.08)", borderBottom: "1px solid rgba(63,167,150,0.08)" }}>
      <div className="container mx-auto px-4 mb-8">
        <div ref={label.ref} style={{ ...label.style, textAlign: "center" }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
            Trusted by
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}>
        <div className="flex items-center gap-16 py-2 marquee-track" style={{ width: "max-content" }}>
          {loop.map((name, i) => (
            <div key={`${name}-${i}`} className="flex items-center gap-16 flex-shrink-0">
              <span className="font-heading font-bold whitespace-nowrap select-none transition-colors"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.6rem)", color: "rgba(14,27,42,0.35)", letterSpacing: "0.02em" }}>
                {name.toUpperCase()}
              </span>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TEAL, opacity: 0.5 }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee-scroll 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function CTABanner() {
  const fade = useFadeUp(0);
  return (
    <section className="py-16 px-4" style={{ background: LIGHT_BLUE }}>
      <div ref={fade.ref} style={{ ...fade.style }} className="container mx-auto max-w-4xl">
        <div className="rounded-3xl p-12 md:p-16 text-center"
          style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0E1B2A 100%)`, boxShadow: "0 20px 60px rgba(63,167,150,0.3)" }}>
          <h2 className="font-heading font-bold text-white mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)" }}>
            Ready to Find Your People?
          </h2>
          <p className="text-lg mb-10 mx-auto" style={{ color: "rgba(255,255,255,0.8)", maxWidth: "480px" }}>
            Join a community of driven young people from across Bharat and beyond. Your Parivaar is waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/join">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 font-semibold transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: "#fff", color: TEAL, border: "none", height: "52px", fontSize: "1rem" }}>
                Join NetVent →
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 font-semibold transition-all hover:scale-105 text-white"
                style={{ background: "transparent", borderColor: "rgba(255,255,255,0.5)", height: "52px", fontSize: "1rem" }}>
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <AppLayout>
      <HeroSection />
      <StatsBanner />
      <WhatIsNetVent />
      <FoundersDesk />
      <SponsorsCarousel />
      <CTABanner />
    </AppLayout>
  );
}
