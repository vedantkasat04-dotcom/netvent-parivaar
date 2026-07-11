import { useParams } from "wouter";
import { useGetEvent, getGetEventQueryKey, useRsvpEvent } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, CheckCircle, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function EventDetail() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId || "";
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: {
      enabled: !!eventId,
      queryKey: getGetEventQueryKey(eventId),
    }
  });

  const rsvpMutation = useRsvpEvent();

  const handleRsvp = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to RSVP for events.",
      });
      return;
    }

    rsvpMutation.mutate({ eventId }, {
      onSuccess: () => {
        toast({
          title: "RSVP Successful",
          description: "You're all set for this event!",
        });
        queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
      },
      onError: (err) => {
        toast({
          title: "RSVP Failed",
          description: err.message || "Could not complete RSVP.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">Loading event details...</div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">Event not found.</div>
      </AppLayout>
    );
  }

  const isUpcoming = event.status === "UPCOMING";

  return (
    <AppLayout>
      <div className="w-full h-[40vh] min-h-[300px] bg-muted relative border-b border-border/50">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
            <Calendar className="w-24 h-24 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isUpcoming ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'}`}>
                  {isUpcoming ? 'UPCOMING' : 'PAST EVENT'}
                </span>
                <span className="bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-border">
                  {format(new Date(event.eventDate), "MMMM d, yyyy")}
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">About the Event</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap">{event.description || "No description provided."}</p>
              </div>
            </section>

            {event.photos && event.photos.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-primary" />
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-border/50">
                      <img src={photo.photoUrl} alt="Event photo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {event.sponsors && event.sponsors.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold mb-6">Our Sponsors</h2>
                <div className="flex flex-wrap gap-8 items-center">
                  {event.sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center gap-3">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-12 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                      ) : (
                        <div className="text-lg font-bold text-muted-foreground">{sponsor.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <h3 className="font-heading text-xl font-bold mb-6">Event Details</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 mr-4" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(event.eventDate), "EEEE, MMMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(event.eventDate), "h:mm a")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 mr-4" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">{event.venue || "Online"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-primary mt-0.5 mr-4" />
                    <div>
                      <p className="font-medium">Attendees</p>
                      <p className="text-sm text-muted-foreground">{event.rsvpCount || 0} Registered</p>
                    </div>
                  </div>
                </div>

                {isUpcoming && (
                  <Button 
                    className={`w-full h-12 font-bold text-lg ${event.hasRsvped ? 'bg-accent hover:bg-accent text-accent-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                    onClick={handleRsvp}
                    disabled={rsvpMutation.isPending || event.hasRsvped}
                  >
                    {rsvpMutation.isPending ? "Processing..." : 
                     event.hasRsvped ? (
                       <><CheckCircle className="w-5 h-5 mr-2" /> You're Going!</>
                     ) : "RSVP Now"}
                  </Button>
                )}
                {!isUpcoming && (
                  <Button variant="outline" className="w-full h-12 font-bold text-lg" disabled>
                    Event has ended
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
