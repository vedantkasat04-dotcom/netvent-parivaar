import { useState } from "react";
import { useListEvents } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Award, Mic, Sparkles } from "lucide-react";
import { format } from "date-fns";

// Parse metadata out of the event description
function parseEventMeta(description: string | null | undefined) {
  if (!description) {
    return {
      footfall: null as string | null,
      footfallLabel: null as string | null,
      dateRange: null as string | null,
      committees: null as string | null,
      committeesLabel: null as string | null,
      chiefGuest: null as string | null,
      sponsors: null as string | null,
    };
  }

  const grab = (re: RegExp) => {
    const m = description.match(re);
    return m ? m[1].trim() : null;
  };

  const footfallMatch = description.match(/Footfall:\s*([\d,]+\+?)/i);
  const playersMatch = description.match(/Players:\s*([\d,]+\+?)/i);
  const teamsMatch = description.match(/Teams:\s*([\d,]+\+?)/i);
  const dateRange = grab(/Dates?:\s*([^|]+?)(?:\s*\||$)/i);
  const committees = grab(/Committees?:\s*([^|]+?)(?:\s*\||$)/i);
  const format = grab(/Format:\s*([^|]+?)(?:\s*\||$)/i);
  const chiefGuest = grab(/Chief Guest:\s*([^|]+?)(?:\s*\||$)/i);
  const sponsors = grab(/Sponsors?:\s*([^|]+?)(?:\s*\.\s*[A-Z]|$)/i);

  let footfall: string | null = null;
  let footfallLabel: string | null = null;
  if (footfallMatch) {
    footfall = footfallMatch[1].trim();
    footfallLabel = "Footfall";
  } else if (playersMatch) {
    footfall = playersMatch[1].trim();
    footfallLabel = teamsMatch ? `Players · ${teamsMatch[1].trim()} Teams` : "Players";
  }

  return {
    footfall,
    footfallLabel,
    dateRange,
    committees,
    committeesLabel: committees ? "Committees" : format ? "Format" : null,
    committeesOrFormat: committees || format,
    chiefGuest,
    sponsors: sponsors ? sponsors.replace(/\.$/, "") : null,
  };
}

export default function Events() {
  const [tab, setTab] = useState<"UPCOMING" | "PAST">("PAST");
  const { data: eventsData, isLoading } = useListEvents({ status: tab });

  return (
    <AppLayout>
      <div className="bg-muted/30 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl font-bold mb-4">Events & Gatherings</h1>
          <p className="text-xl text-muted-foreground">
            Meet the Parivaar in real life and online. Learn, connect, and grow.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="UPCOMING" className="text-base px-6">Upcoming</TabsTrigger>
            <TabsTrigger value="PAST" className="text-base px-6">Past</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {isLoading ? (
              <div className="text-center py-20 text-muted-foreground">Loading events...</div>
            ) : eventsData?.data && eventsData.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {eventsData.data.map((event) => {
                  const meta = parseEventMeta(event.description);
                  const committeesOrFormat = (meta as any).committeesOrFormat as string | null;

                  return (
                    <Card
                      key={event.id}
                      className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
                    >
                      {/* Cover image */}
                      <div className="aspect-[16/9] bg-muted relative flex-shrink-0">
                        {event.coverImageUrl ? (
                          <img
                            src={event.coverImageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                            <Calendar className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur px-3 py-1 rounded-md text-sm font-medium shadow-sm border border-border/50">
                          {meta.dateRange || format(new Date(event.eventDate), "MMM d, yyyy")}
                        </div>
                      </div>

                      {/* Body */}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="font-heading font-bold text-xl mb-4 line-clamp-2">
                          {event.title}
                        </h3>

                        <div className="space-y-2.5 text-sm text-muted-foreground">
                          {/* Venue */}
                          {event.venue && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="leading-snug">{event.venue}</span>
                            </div>
                          )}

                          {/* Footfall / Players */}
                          {meta.footfall && (
                            <div className="flex items-start">
                              <Users className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="leading-snug">
                                <span className="font-semibold text-foreground">{meta.footfall}</span>{" "}
                                {meta.footfallLabel}
                              </span>
                            </div>
                          )}

                          {/* Committees / Format */}
                          {committeesOrFormat && (
                            <div className="flex items-start">
                              <Award className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="leading-snug">
                                <span className="font-semibold text-foreground">
                                  {meta.committeesLabel}:
                                </span>{" "}
                                {committeesOrFormat}
                              </span>
                            </div>
                          )}

                          {/* Chief Guest */}
                          {meta.chiefGuest && (
                            <div className="flex items-start">
                              <Mic className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="leading-snug">
                                <span className="font-semibold text-foreground">Chief Guest:</span>{" "}
                                {meta.chiefGuest}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sponsors — at the bottom */}
                        {meta.sponsors && (
                          <div className="mt-5 pt-4 border-t border-border/50">
                            <div className="flex items-start">
                              <Sparkles className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-primary" />
                              <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                                  Sponsors
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {meta.sponsors}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-heading text-xl font-bold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {tab === "UPCOMING"
                    ? "We are planning new events. Check back soon!"
                    : "No past events to show."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
