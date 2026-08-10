import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import {
  useSignup, useListExpertise, getListExpertiseQueryKey,
  SignupInputEducationType, SignupInputDegreeLevel,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { CityCombobox } from "@/components/CityCombobox";
import { ExpertiseMultiSelect } from "@/components/ExpertiseMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

const SCHOOL_CLASSES = ["8th", "9th", "10th", "11th", "12th"];
const COLLEGE_YEARS = ["1st", "2nd", "3rd", "4th", "5th"];

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: "Enter a valid 10-digit phone number." }),
  city: z.string().min(1, { message: "Please select your city." }),
  educationType: z.enum([SignupInputEducationType.SCHOOL, SignupInputEducationType.COLLEGE], {
    message: "Please select your education type.",
  }),
  schoolOrCollegeName: z.string().optional(),
  schoolClass: z.string().optional(),
  degreeLevel: z.string().optional(),
  collegeYear: z.string().optional(),
  expertiseIds: z.array(z.string()).max(3, { message: "Select up to 3 skills." }),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms & Conditions to join.",
  }),
}).superRefine((data, ctx) => {
  if (!data.schoolOrCollegeName || data.schoolOrCollegeName.trim().length < 2) {
    ctx.addIssue({ code: "custom", path: ["schoolOrCollegeName"], message: "Please enter your institution name." });
  }
  if (data.educationType === SignupInputEducationType.SCHOOL) {
    if (!data.schoolClass) ctx.addIssue({ code: "custom", path: ["schoolClass"], message: "Please select your class." });
  } else if (data.educationType === SignupInputEducationType.COLLEGE) {
    if (!data.degreeLevel) ctx.addIssue({ code: "custom", path: ["degreeLevel"], message: "Please select your degree." });
    if (!data.collegeYear) ctx.addIssue({ code: "custom", path: ["collegeYear"], message: "Please select your year." });
  }
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { refreshUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, setLocation]);

  const signupMutation = useSignup();
  const { data: expertiseData } = useListExpertise({ query: { queryKey: getListExpertiseQueryKey() } });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "", email: "", password: "", phone: "", city: "",
      educationType: undefined as unknown as SignupFormValues["educationType"],
      schoolOrCollegeName: "", schoolClass: "", degreeLevel: "", collegeYear: "",
      expertiseIds: [],
      agreedToTerms: false,
    },
  });

  const educationType = form.watch("educationType");
  const agreedToTerms = form.watch("agreedToTerms");

  const onSubmit = (data: SignupFormValues) => {
    const isSchool = data.educationType === SignupInputEducationType.SCHOOL;
    signupMutation.mutate({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        city: data.city,
        educationType: data.educationType,
        schoolOrCollegeName: data.schoolOrCollegeName || null,
        schoolClass: isSchool ? data.schoolClass || null : null,
        degreeLevel: isSchool ? null : (data.degreeLevel as SignupInputDegreeLevel) || null,
        collegeYear: isSchool ? null : data.collegeYear || null,
        expertiseIds: data.expertiseIds,
      },
    }, {
      onSuccess: async () => {
        await refreshUser();
        toast({ title: "Account created!", description: "Welcome to NetVent Parivaar." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Signup failed",
          description: error.data?.error?.message || "An error occurred during signup.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AppLayout>
      {/* Terms & Conditions Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl" style={{ color: NAVY }}>
              Your Privacy on NetVent Parivaar
            </DialogTitle>
            <DialogDescription>
              How your information is used within our community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4 text-sm" style={{ color: "#4A5568" }}>
            {/* Visible to others */}
            <section>
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Visible to other logged-in members
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your name</li>
                <li>Your profile photo</li>
                <li>Your city</li>
                <li>Your school/college and education details</li>
                <li>Your skills and expertise</li>
                <li>Your bio (if added)</li>
              </ul>
            </section>

            {/* Gated behind login */}
            <section>
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Visible to logged-in members only (gated behind login)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your email address</li>
                <li>Your phone number</li>
              </ul>
              <p className="text-xs mt-2 italic" style={{ color: "rgba(74,85,104,0.75)" }}>
                Visitors who are not logged in cannot see these details.
              </p>
            </section>

            {/* Not visible */}
            <section>
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Not visible to anyone
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your password (encrypted, only you know it)</li>
              </ul>
            </section>

            {/* Your control */}
            <section>
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Your control
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Toggle <strong>"Availability"</strong> off from your dashboard — your profile will appear in grayscale to others
                </li>
                <li>Edit or remove any information anytime from your dashboard</li>
              </ul>
            </section>

            {/* Community guidelines */}
            <section>
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Community guidelines
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use real information — this is a genuine community</li>
                <li>Don't spam, harass, or misuse contact details of other members</li>
                <li>Respect fellow Parivaar members</li>
                <li>Content you post may be reviewed by moderators</li>
              </ul>
            </section>

            {/* Consent */}
            <section
              className="rounded-xl p-4"
              style={{ background: "rgba(63,167,150,0.08)", border: "1px solid rgba(63,167,150,0.2)" }}
            >
              <h3 className="font-semibold text-base mb-2" style={{ color: NAVY }}>
                Your consent
              </h3>
              <p>
                By checking the box on the signup form, you agree to join NetVent Parivaar
                and understand how your information will be used.
              </p>
            </section>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setTermsOpen(false)} style={{ background: TEAL }} className="text-white">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-16 flex justify-center items-start min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-xl border-border/50 shadow-lg">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold font-heading text-2xl mx-auto mb-2">
              N
            </div>
            <CardTitle className="font-heading text-3xl font-bold">Join the Parivaar</CardTitle>
            <CardDescription className="text-base">
              Create your profile and connect with driven students across India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
                {/* Account */}
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h3>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Full Name</FormLabel>
                      <FormControl><Input placeholder="Aarav Sharma" autoComplete="name" {...field} className="h-12" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 h-12 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                          <Input
                            type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="9876543210"
                            maxLength={10} className="h-12 rounded-l-none"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Email</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} className="h-12" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" {...field} className="h-12 pr-10" />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">City</FormLabel>
                      <FormControl><CityCombobox value={field.value} onChange={field.onChange} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Education */}
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Education</h3>
                  <FormField control={form.control} name="educationType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">I am currently in</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3">
                          {[
                            { v: SignupInputEducationType.SCHOOL, label: "School" },
                            { v: SignupInputEducationType.COLLEGE, label: "College" },
                          ].map(({ v, label }) => (
                            <label key={v} htmlFor={`edu-${v}`}
                              className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <RadioGroupItem value={v} id={`edu-${v}`} />
                              <span className="font-medium">{label}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {educationType && (
                    <FormField control={form.control} name="schoolOrCollegeName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">{educationType === SignupInputEducationType.SCHOOL ? "School Name" : "College Name"}</FormLabel>
                        <FormControl><Input placeholder={educationType === SignupInputEducationType.SCHOOL ? "Delhi Public School" : "IIT Bombay"} {...field} value={field.value ?? ""} className="h-12" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  {educationType === SignupInputEducationType.SCHOOL && (
                    <FormField control={form.control} name="schoolClass" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Select your class" /></SelectTrigger></FormControl>
                          <SelectContent>{SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  {educationType === SignupInputEducationType.COLLEGE && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="degreeLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Degree</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Degree" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value={SignupInputDegreeLevel.DIPLOMA}>Diploma</SelectItem>
                              <SelectItem value={SignupInputDegreeLevel.BACHELORS}>Bachelor's</SelectItem>
                              <SelectItem value={SignupInputDegreeLevel.MASTERS}>Master's</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="collegeYear" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Year</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                            <SelectContent>{COLLEGE_YEARS.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills &amp; Expertise</h3>
                  <FormField control={form.control} name="expertiseIds" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Your top skills <span className="text-muted-foreground font-normal">(up to 3)</span></FormLabel>
                      <FormControl>
                        <ExpertiseMultiSelect options={expertiseData?.data ?? []} value={field.value} onChange={field.onChange} max={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2">
                  <FormField control={form.control} name="agreedToTerms" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3 rounded-xl border p-4"
                        style={{ background: "rgba(63,167,150,0.04)", borderColor: "rgba(63,167,150,0.2)" }}>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                            id="terms-checkbox"
                          />
                        </FormControl>
                        <label htmlFor="terms-checkbox" className="text-sm leading-relaxed cursor-pointer select-none" style={{ color: NAVY }}>
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}
                            className="font-semibold underline hover:opacity-80"
                            style={{ color: "#2563EB" }}
                          >
                            Terms &amp; Conditions
                          </button>
                          {" "}and understand how my information will be used and visible within the NetVent Parivaar community.
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-2"
                  disabled={signupMutation.isPending || !agreedToTerms}
                >
                  {signupMutation.isPending ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
