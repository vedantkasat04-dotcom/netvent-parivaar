import { useParams, Link } from "wouter";
import { useGetMember, getGetMemberQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, GraduationCap, Mail, Phone, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>();
  const { isAuthenticated } = useAuth();

  const { data: memberResponse, isLoading } = useGetMember(memberId || "", {
    query: { enabled: !!memberId, queryKey: getGetMemberQueryKey(memberId || "") },
  });
  const member = memberResponse?.data;

  if (isLoading) {
    return <AppLayout><div className="container py-20 text-center" style={{ color: "#4A5568" }}>Loading profile…</div></AppLayout>;
  }
  if (!member) {
    return (
      <AppLayout>
        <div className="container py-20 text-center" style={{ color: "#4A5568" }}>
          <p className="mb-4">Member not found.</p>
          <Link href="/parivaar"><Button variant="outline" style={{ borderColor: TEAL, color: TEAL }}>Back to Parivaar</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const unavailable = !member.isAvailable;
  const eduLabel = member.educationType === "SCHOOL"
    ? `${member.schoolOrCollegeName ?? ""}${member.schoolClass ? ` · Class ${member.schoolClass}` : ""}`
    : `${member.schoolOrCollegeName ?? ""}${member.degreeLevel ? ` · ${member.degreeLevel.charAt(0) + member.degreeLevel.slice(1).toLowerCase()}` : ""}${member.collegeYear ? ` · ${member.collegeYear} Year` : ""}`;

  return (
    <AppLayout>
      <div className="px-4 py-10" style={{ background: LIGHT_BLUE, minHeight: "calc(100vh - 16rem)" }}>
        <div className="container mx-auto max-w-3xl">
          <Link href="/parivaar" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline" style={{ color: TEAL }}>
            <ArrowLeft className="w-4 h-4" /> Back to Parivaar
          </Link>

          <Card className="overflow-hidden border-border/50" style={{ filter: unavailable ? "grayscale(1)" : "none" }}>
            <div className="h-28" style={{ background: `linear-gradient(120deg, ${TEAL}, #2d8576)` }} />
            <CardContent className="p-6 sm:p-8 -mt-16">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-muted mb-4">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold font-heading" style={{ background: "rgba(63,167,150,0.15)", color: TEAL }}>
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-heading text-3xl font-bold" style={{ color: NAVY }}>{member.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: unavailable ? "rgba(74,85,104,0.12)" : "rgba(63,167,150,0.12)", color: unavailable ? "#4A5568" : TEAL }}>
                  {unavailable ? "Not available" : "Available to connect"}
                </span>
              </div>

              {member.city && (
                <p className="flex items-center gap-1.5 text-sm mt-2" style={{ color: "#4A5568" }}>
                  <MapPin className="w-4 h-4" style={{ color: TEAL }} /> {member.city}
                </p>
              )}
              {eduLabel.trim() && (
                <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#4A5568" }}>
                  <GraduationCap className="w-4 h-4" style={{ color: TEAL }} /> {eduLabel}
                </p>
              )}

              {member.bio && <p className="text-sm mt-5 leading-relaxed" style={{ color: "#4A5568" }}>{member.bio}</p>}

              {member.expertise && member.expertise.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {member.expertise.map(s => (
                      <span key={s.id} className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Contact</h3>
                {isAuthenticated ? (
                  <div className="space-y-2 text-sm" style={{ color: "#4A5568" }}>
                    {member.email && (
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: TEAL }} /><a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a></div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: TEAL }} /><a href={`tel:+91${member.phone}`} className="hover:underline">+91 {member.phone}</a></div>
                    )}
                    {!member.email && !member.phone && <p className="text-muted-foreground">No contact details shared.</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(74,85,104,0.06)", color: "#4A5568" }}>
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span><Link href="/login" className="font-semibold hover:underline" style={{ color: TEAL }}>Log in</Link> to view contact details.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
