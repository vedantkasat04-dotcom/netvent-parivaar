import { useState } from "react";
import { Link } from "wouter";
import { useListEvents } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

// Parse metadata out of the event description
function parseEventMeta(description: string | null | undefined) {
  if (!description) return { count: null as string | null, label: null as string | null, dateRange: null as string | null };

  const footfallMatch = description.match(/Footfall:\s*([\d,]+\+?)/i);
  const playersMatch = description.match(/Players:\s*([\d,]+\+?)/i);
  const teamsMatch = description.match(/Teams:\s*([\d,]+\+?)/i);
  const datesMatch = description.match(/Dates?:\s*([^|]+?)(?:\s*\||$)/i);

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
  return { count, label, dateRange };
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.data.map((event) => {
                  const meta = parseEventMeta(event.description);
                  return (
                    <Card key={event.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors shadow-sm">
                      <div className="aspect-[16/9] bg-muted relative">
                        {event.coverImageUrl ? (
                          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                            <Calendar className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur px-3 py-1 rounded-md text-sm font-medium shadow-sm border border-border/50">
                          {meta.dateRange || format(new Date(event.eventDate), "MMM d, yyyy")}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-heading font-bold text-xl mb-3 line-clamp-2">{event.title}</h3>
                        <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                            <span className="truncate">{event.venue || "Online"}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                            <span>
                              {meta.count
                                ? `${meta.count} ${meta.label}`
                                : `${event.rsvpCount || 0} Attending`}
                            </span>
                          </div>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button variant={tab === "UPCOMING" ? "default" : "outline"} className="w-full font-medium">
                            {tab === "UPCOMING" ? "View Details & RSVP" : "View Details"}
                          </Button>
                        </Link>
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
                  {tab === "UPCOMING" ? "We are planning new events. Check back soon!" : "No past events to show."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
