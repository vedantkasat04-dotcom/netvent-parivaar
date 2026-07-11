import { useListTeam, getListTeamQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Linkedin, Twitter } from "lucide-react";

export default function Team() {
  const { data: teamData, isLoading } = useListTeam({
    query: { queryKey: getListTeamQueryKey() }
  });

  const founders = teamData?.data?.filter(t => t.section === "FOUNDER") || [];
  const core = teamData?.data?.filter(t => t.section === "CORE") || [];
  const advisors = teamData?.data?.filter(t => t.section === "ADVISOR") || [];

  const MemberCard = ({ member }: { member: any }) => (
    <Card className="overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-colors shadow-sm">
      <div className="aspect-[4/5] relative bg-muted">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold font-heading text-muted-foreground/30">
            {member.name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 text-center">
          <h3 className="font-heading font-bold text-xl text-foreground">{member.name}</h3>
          <p className="text-primary font-medium text-sm">{member.roleTitle}</p>
        </div>
      </div>
      <CardContent className="p-4 bg-card/50 flex justify-center gap-4">
        {member.socialLinks?.linkedin && (
          <a href={member.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        )}
        {member.socialLinks?.twitter && (
          <a href={member.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
        )}
        {member.socialLinks?.instagram && (
          <a href={member.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background py-20 border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Meet the Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The dedicated individuals working tirelessly to build Bharat ka apna Parivaar.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading team...</div>
        ) : (
          <>
            {founders.length > 0 && (
              <section>
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl font-bold text-foreground">Founders</h2>
                  <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {founders.map(member => <MemberCard key={member.id} member={member} />)}
                </div>
              </section>
            )}

            {core.length > 0 && (
              <section>
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl font-bold text-foreground">Core Team</h2>
                  <div className="w-16 h-1 bg-secondary mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {core.map(member => <MemberCard key={member.id} member={member} />)}
                </div>
              </section>
            )}

            {advisors.length > 0 && (
              <section>
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl font-bold text-foreground">Advisors</h2>
                  <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {advisors.map(member => <MemberCard key={member.id} member={member} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
