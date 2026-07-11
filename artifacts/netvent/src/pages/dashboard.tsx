import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import {
  useUpdateMe, useSetAvailability, useListExpertise, getListExpertiseQueryKey,
  UpdateProfileInputEducationType, UpdateProfileInputDegreeLevel,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityCombobox } from "@/components/CityCombobox";
import { ExpertiseMultiSelect } from "@/components/ExpertiseMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { MapPin, GraduationCap, Pencil, Mail, Phone } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

const SCHOOL_CLASSES = ["8th", "9th", "10th", "11th", "12th"];
const COLLEGE_YEARS = ["1st", "2nd", "3rd", "4th", "5th"];

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: "Enter a valid 10-digit phone number." }),
  city: z.string().min(1, { message: "Please select your city." }),
  educationType: z.enum([UpdateProfileInputEducationType.SCHOOL, UpdateProfileInputEducationType.COLLEGE]),
  schoolOrCollegeName: z.string().min(2, { message: "Please enter your institution name." }),
  schoolClass: z.string().optional(),
  degreeLevel: z.string().optional(),
  collegeYear: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be under 500 characters." }).optional(),
  avatarUrl: z.string().url({ message: "Enter a valid URL." }).optional().or(z.literal("")),
  expertiseIds: z.array(z.string()).max(3, { message: "Select up to 3 skills." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [available, setAvailable] = useState(user?.isAvailable ?? true);

  const updateMutation = useUpdateMe();
  const availabilityMutation = useSetAvailability();
  const { data: expertiseData } = useListExpertise({ query: { queryKey: getListExpertiseQueryKey() } });

  useEffect(() => {
    if (user) setAvailable(user.isAvailable);
  }, [user?.isAvailable]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      city: user.city ?? "",
      educationType: (user.educationType ?? UpdateProfileInputEducationType.COLLEGE) as ProfileFormValues["educationType"],
      schoolOrCollegeName: user.schoolOrCollegeName ?? "",
      schoolClass: user.schoolClass ?? "",
      degreeLevel: user.degreeLevel ?? "",
      collegeYear: user.collegeYear ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      expertiseIds: user.expertise?.map(e => e.id) ?? [],
    } : undefined,
  });

  const educationType = form.watch("educationType");

  const onSubmit = (data: ProfileFormValues) => {
    const isSchool = data.educationType === UpdateProfileInputEducationType.SCHOOL;
    updateMutation.mutate({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        educationType: data.educationType,
        schoolOrCollegeName: data.schoolOrCollegeName,
        schoolClass: isSchool ? data.schoolClass || null : null,
        degreeLevel: isSchool ? null : (data.degreeLevel as UpdateProfileInputDegreeLevel) || null,
        collegeYear: isSchool ? null : data.collegeYear || null,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
        expertiseIds: data.expertiseIds,
      },
    }, {
      onSuccess: async () => {
        await refreshUser();
        setEditOpen(false);
        toast({ title: "Profile updated", description: "Your changes have been saved." });
      },
      onError: (error) => {
        toast({ title: "Update failed", description: error.data?.error?.message || "Could not update profile.", variant: "destructive" });
      },
    });
  };

  const handleAvailabilityChange = (next: boolean) => {
    setAvailable(next);
    availabilityMutation.mutate({ data: { isAvailable: next } }, {
      onSuccess: async () => {
        await refreshUser();
        toast({
          title: next ? "You're now available" : "You're now unavailable",
          description: next ? "Your card appears in full colour in the directory." : "Your card now appears in grayscale.",
        });
      },
      onError: (error) => {
        setAvailable(!next);
        toast({ title: "Update failed", description: error.message || "Could not update availability.", variant: "destructive" });
      },
    });
  };

  if (!user) {
    return <AppLayout><div className="container py-20 text-center">Loading…</div></AppLayout>;
  }

  const eduLabel = user.educationType === "SCHOOL"
    ? `${user.schoolOrCollegeName ?? ""}${user.schoolClass ? ` · Class ${user.schoolClass}` : ""}`
    : `${user.schoolOrCollegeName ?? ""}${user.degreeLevel ? ` · ${user.degreeLevel.charAt(0) + user.degreeLevel.slice(1).toLowerCase()}` : ""}${user.collegeYear ? ` · ${user.collegeYear} Year` : ""}`;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="font-heading text-3xl font-bold mb-8" style={{ color: NAVY }}>My Parivaar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-24" style={{ background: `linear-gradient(120deg, ${TEAL}, #2d8576)` }} />
              <CardContent className="p-6 -mt-12">
                <div className="flex items-end justify-between mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-muted">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold font-heading" style={{ background: "rgba(63,167,150,0.15)", color: TEAL }}>
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full gap-2" style={{ borderColor: TEAL, color: TEAL }}>
                        <Pencil className="w-4 h-4" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your details. Changes appear in the directory.</DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <span className="inline-flex items-center px-3 h-11 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                                  <Input type="tel" inputMode="numeric" maxLength={10} className="h-11 rounded-l-none" value={field.value}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                                </div>
                              </FormControl><FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><CityCombobox value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                            <FormItem><FormLabel>Avatar URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Input placeholder="https://…" {...field} value={field.value ?? ""} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Bio <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Textarea placeholder="Tell the Parivaar about yourself…" {...field} value={field.value ?? ""} rows={3} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={form.control} name="educationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Education</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3">
                                  {[
                                    { v: UpdateProfileInputEducationType.SCHOOL, label: "School" },
                                    { v: UpdateProfileInputEducationType.COLLEGE, label: "College" },
                                  ].map(({ v, label }) => (
                                    <label key={v} htmlFor={`d-edu-${v}`} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                      <RadioGroupItem value={v} id={`d-edu-${v}`} /><span className="font-medium text-sm">{label}</span>
                                    </label>
                                  ))}
                                </RadioGroup>
                              </FormControl><FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="schoolOrCollegeName" render={({ field }) => (
                            <FormItem><FormLabel>{educationType === "SCHOOL" ? "School Name" : "College Name"}</FormLabel><FormControl><Input {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />

                          {educationType === "SCHOOL" ? (
                            <FormField control={form.control} name="schoolClass" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                                  <SelectContent>{SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                              </FormItem>
                            )} />
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <FormField control={form.control} name="degreeLevel" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Degree" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.DIPLOMA}>Diploma</SelectItem>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.BACHELORS}>Bachelor's</SelectItem>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.MASTERS}>Master's</SelectItem>
                                    </SelectContent>
                                  </Select><FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="collegeYear" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                                    <SelectContent>{COLLEGE_YEARS.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}</SelectContent>
                                  </Select><FormMessage />
                                </FormItem>
                              )} />
                            </div>
                          )}

                          <FormField control={form.control} name="expertiseIds" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills <span className="text-muted-foreground font-normal">(up to 3)</span></FormLabel>
                              <FormControl><ExpertiseMultiSelect options={expertiseData?.data ?? []} value={field.value} onChange={field.onChange} max={3} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <DialogFooter>
                            <Button type="submit" disabled={updateMutation.isPending} className="font-semibold">
                              {updateMutation.isPending ? "Saving…" : "Save changes"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <h2 className="font-heading text-2xl font-bold" style={{ color: NAVY }}>{user.name}</h2>
                {user.city && (
                  <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#4A5568" }}>
                    <MapPin className="w-4 h-4" style={{ color: TEAL }} /> {user.city}
                  </p>
                )}
                {eduLabel.trim() && (
                  <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#4A5568" }}>
                    <GraduationCap className="w-4 h-4" style={{ color: TEAL }} /> {eduLabel}
                  </p>
                )}

                {user.bio && <p className="text-sm mt-4 leading-relaxed" style={{ color: "#4A5568" }}>{user.bio}</p>}

                <div className="flex flex-col gap-1.5 mt-4 text-sm" style={{ color: "#4A5568" }}>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: TEAL }} /> {user.email}</div>
                  {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: TEAL }} /> +91 {user.phone}</div>}
                </div>

                {user.expertise && user.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {user.expertise.map(s => (
                      <span key={s.id} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}>{s.name}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-heading text-lg">Availability</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm" style={{ color: NAVY }}>{available ? "Available to connect" : "Not available"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {available ? "Your card shows in full colour." : "Your card shows in grayscale."}
                    </p>
                  </div>
                  <Switch checked={available} onCheckedChange={handleAvailabilityChange} disabled={availabilityMutation.isPending} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-heading text-lg">Discussion Forum</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Community discussions are coming soon. Stay tuned!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
