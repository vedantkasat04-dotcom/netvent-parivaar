import { Link, useParams } from "wouter";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { format } from "date-fns";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

// Parse the metadata pieces out of the description
function parseEventMeta(description: string | null | undefined) {
  if (!description) return { count: null as string | null, label: null as string | null, dateRange: null as string | null, sponsors: null as string | null, blurb: null as string | null };

  const footfallMatch = description.match(/Footfall:\s*([\d,]+\+?)/i);
  const playersMatch = description.match(/Players:\s*([\d,]+\+?)/i);
  const teamsMatch = description.match(/Teams:\s*([\d,]+\+?)/i);
  const datesMatch = description.match(/Dates?:\s*([^|]+?)(?:\s*\||$)/i);
  const sponsorsMatch = description.match(/Sponsors?:\s*([^|]+?)(?:\s*\.\s*[A-Z]|$)/i);

  let count: string | null = null;
  let label: string | null = null;

  if (footfallMatch) {
    count = footfallMatch[1].trim();
    label = "Footfall";
  } else if (playersMatch) {
    count = playersMatch[1].trim();
    label = teamsMatch ? `Players · ${teamsMatch[1].trim()} Teams` : "Players";
  }

  const dateRange = datesMatch ? datesMatch[1].trim() : null;
  const sponsors = sponsorsMatch ? sponsorsMatch[1].trim().replace(/\.$/, "") : null;

  // Blurb = everything after the metadata pipes
  let blurb: string | null = null;
  const lastPipeIdx = description.lastIndexOf("|");
  if (lastPipeIdx > -1) {
    const rest = description.slice(lastPipeIdx + 1).trim();
    // Strip a leading "Sponsors: ...." segment if it slipped in
    const afterSponsorPeriod = rest.match(/\.\s*([A-Z].*)$/s);
    blurb = afterSponsorPeriod ? afterSponsorPeriod[1].trim() : rest;
  } else {
    blurb = description;
  }

  return { count, label, dateRange, sponsors, blurb };
}

export default function EventDetail() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId || "";

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: {
      enabled: !!eventId,
      queryKey: getGetEventQueryKey(eventId),
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading event details...
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading font-bold text-2xl mb-4" style={{ color: NAVY }}>Event not found</h1>
          <Link href="/events">
            <Button variant="outline">← Back to Events</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const meta = parseEventMeta(event.description);

  return (
    <AppLayout>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${TEAL} 0%, ${NAVY} 100%)` }}>
        <div className="container mx-auto px-4 py-16 md:py-20">
          <Link href="/events">
            <button className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </button>
          </Link>

          <h1 className="font-heading font-bold text-white mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}>
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
              <Calendar className="w-4 h-4" />
              {meta.dateRange || format(new Date(event.eventDate), "MMMM d, yyyy")}
            </div>
            {event.venue && (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </div>
            )}
            {meta.count && (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
                {meta.count} {meta.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Blurb */}
        {meta.blurb && (
          <section className="mb-12">
            <p className="text-lg leading-relaxed" style={{ color: "#4A5568" }}>
              {meta.blurb}
            </p>
          </section>
        )}

        {/* Sponsors */}
        {meta.sponsors && (
          <section className="mb-12">
            <h2 className="font-heading font-bold text-xl mb-4" style={{ color: NAVY }}>Our Sponsors</h2>
            <p className="text-base leading-relaxed" style={{ color: "#4A5568" }}>
              {meta.sponsors}
            </p>
          </section>
        )}

        {/* Coming Soon */}
        <section
          className="text-center py-16 px-6 rounded-3xl"
          style={{
            background: "rgba(63,167,150,0.06)",
            border: "1.5px dashed rgba(63,167,150,0.35)",
          }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5" style={{ background: "rgba(63,167,150,0.15)" }}>
            <Sparkles className="w-7 h-7" style={{ color: TEAL }} />
          </div>
          <h3 className="font-heading font-bold text-2xl mb-3" style={{ color: NAVY }}>
            Full Details Coming Soon
          </h3>
          <p className="text-base max-w-md mx-auto mb-6" style={{ color: "#4A5568" }}>
            We're putting together the full recap of this event — photos, moments, speakers, and stories from the day. Check back soon.
          </p>
          <Link href="/events">
            <Button variant="outline" className="rounded-full px-6">
              Explore Other Events
            </Button>
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}
