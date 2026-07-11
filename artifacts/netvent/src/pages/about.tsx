import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Globe, Zap, Users } from "lucide-react";

export default function About() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">About NetVent Parivaar</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are India's own family of driven students, building the future together.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              NetVent Parivaar was founded with a single belief: that the energy, ambition, and talent of Indian students is unmatched, but often siloed.
            </p>
            <p className="text-lg text-muted-foreground">
              We're building a digital and physical space where students can find their tribe, collaborate on projects, attend curated events, and grow both personally and professionally. We are not just a networking site; we are a Parivaar (family).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Community First</h3>
                <p className="text-sm text-muted-foreground">Supportive, warm, and always welcoming.</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/5 border-secondary/20 translate-y-8">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-secondary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Pan-India</h3>
                <p className="text-sm text-muted-foreground">Connecting diverse talents across the nation.</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-bold mb-2">Action Oriented</h3>
                <p className="text-sm text-muted-foreground">Less talk, more building and creating.</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20 translate-y-8">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Mentorship</h3>
                <p className="text-sm text-muted-foreground">Learn from those who walked the path before.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-medium text-lg">Who can join NetVent Parivaar?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Any student currently enrolled in a college or university in India who is passionate about building, learning, and networking. Whether you're into tech, design, marketing, or arts, there's a place for you here.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-medium text-lg">Is it free to join?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes! Creating a basic account is completely free. We do have a selective membership process (MEMBER status) for full access to the directory and exclusive groups to ensure high quality interactions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-medium text-lg">How are the events structured?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                We host both online workshops and offline meetups in active cities. Events range from casual mixers and coffee chats to structured hackathons and speaker sessions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-medium text-lg">What does the membership application involve?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                The application asks about your background, skills, and what you hope to contribute to the community. We review these to ensure every new member adds value to the Parivaar.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
