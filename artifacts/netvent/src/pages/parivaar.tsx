import { useState } from "react";
import { Link } from "wouter";
import {
  useListMembers, getListMembersQueryKey,
  useListExpertise, getListExpertiseQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, Phone, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { INDIA_CITIES } from "@/lib/india-cities";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

export default function Parivaar() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const params = {
    q: search || undefined,
    city: cityFilter || undefined,
    expertise: expertiseFilter || undefined,
    available: availableOnly || undefined,
    limit: 48,
  };

  const { data: membersData, isLoading } = useListMembers(params, {
    query: { queryKey: getListMembersQueryKey(params) },
  });
  const { data: expertiseData } = useListExpertise({ query: { queryKey: getListExpertiseQueryKey() } });

  return (
    <AppLayout>
      {/* Header */}
      <div className="py-16 px-4" style={{ background: LIGHT_BLUE }}>
        <div className="container mx-auto max-w-5xl">
          <h1 className="font-heading font-bold mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: NAVY }}>
            Our <em style={{ color: TEAL, fontStyle: "italic" }}>Parivaar</em>
          </h1>
          <p className="text-lg mb-8 max-w-2xl" style={{ color: "#4A5568" }}>
            Find and connect with fellow Parivaar members. Search by name, city, or skill.
          </p>

          {/* Search + filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(63,167,150,0.15)", boxShadow: "0 4px 20px rgba(63,167,150,0.08)" }}>
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "rgba(74,85,104,0.5)" }} />
              <Input placeholder="Search by name…" className="pl-10 h-12 bg-white rounded-xl border-0 focus-visible:ring-1"
                style={{ boxShadow: "0 0 0 1px rgba(63,167,150,0.2)" }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <Select value={cityFilter || "all"} onValueChange={val => setCityFilter(val === "all" ? "" : val)}>
              <SelectTrigger className="h-12 bg-white rounded-xl border-0" style={{ boxShadow: "0 0 0 1px rgba(63,167,150,0.2)" }}>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" style={{ color: "rgba(74,85,104,0.5)" }} />
                  <SelectValue placeholder="All Cities" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All Cities</SelectItem>
                {INDIA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={expertiseFilter || "all"} onValueChange={val => setExpertiseFilter(val === "all" ? "" : val)}>
              <SelectTrigger className="h-12 bg-white rounded-xl border-0" style={{ boxShadow: "0 0 0 1px rgba(63,167,150,0.2)" }}>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" style={{ color: "rgba(74,85,104,0.5)" }} />
                  <SelectValue placeholder="All Skills" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All Skills</SelectItem>
                {expertiseData?.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2.5 mt-4">
            <Switch id="availableOnly" checked={availableOnly} onCheckedChange={setAvailableOnly} />
            <label htmlFor="availableOnly" className="text-sm font-medium cursor-pointer" style={{ color: NAVY }}>
              Show available members only
            </label>
          </div>
        </div>
      </div>

      {/* Members grid */}
      <section className="py-14 px-4" style={{ background: LIGHT_BLUE }}>
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="py-20 text-center" style={{ color: "#4A5568" }}>Loading members…</div>
          ) : membersData?.data && membersData.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {membersData.data.map(member => {
                const unavailable = !member.isAvailable;
                return (
                  <Card key={member.id}
                    className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(63,167,150,0.15)",
                      borderRadius: "16px",
                      filter: unavailable ? "grayscale(1)" : "none",
                      opacity: unavailable ? 0.75 : 1,
                    }}>
                    <CardContent className="p-5">
                      {/* Avatar + Name + City */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                          style={{ border: `2px solid rgba(63,167,150,0.2)` }}>
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold font-heading text-xl"
                              style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}>
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base leading-tight transition-colors group-hover:text-[#3FA796] truncate" style={{ color: NAVY }}>
                            {member.name}
                          </h3>
                          {member.city && (
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(74,85,104,0.7)" }}>
                              <MapPin className="w-3 h-3" style={{ color: TEAL }} /> {member.city}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills — always visible */}
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {member.expertise.map(skill => (
                            <span key={skill.id} className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Contact section */}
                      {isAuthenticated ? (
                        /* Logged in — show full contact */
                        <div className="space-y-1.5 mb-4 text-sm" style={{ color: "#4A5568" }}>
                          {member.email && (
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
                              <a href={`mailto:${member.email}`} className="truncate hover:underline">{member.email}</a>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
                              <a href={`tel:+91${member.phone}`} className="hover:underline">+91 {member.phone}</a>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Logged out — blurred contact with signup CTA */
                        <div className="relative mb-4 rounded-xl overflow-hidden">
                          {/* Blurred fake contact */}
                          <div className="space-y-1.5 text-sm p-3" style={{
                            color: "#4A5568",
                            filter: "blur(5px)",
                            userSelect: "none",
                            pointerEvents: "none",
                          }}>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
                              <span>member@email.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
                              <span>+91 98765 43210</span>
                            </div>
                          </div>
                          {/* Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                            style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}>
                            <Lock className="w-4 h-4 mb-1" style={{ color: TEAL }} />
                            <Link href="/signup">
                              <span className="text-xs font-semibold hover:underline cursor-pointer" style={{ color: TEAL }}>
                                Sign up to see details
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}

                      <Link href={`/members/${member.id}`}>
                        <Button variant="outline" className="w-full rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                          style={{ borderColor: TEAL, color: TEAL }}>
                          View Profile
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl" style={{ border: `1.5px dashed rgba(63,167,150,0.25)`, color: "#4A5568" }}>
              No members found matching your criteria.
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
