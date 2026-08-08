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
import { CityCombobox } from "@/components/CityCombobox";
import { ExpertiseMultiSelect } from "@/components/ExpertiseMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  expertiseIds: z.array(z.string()).max(6, { message: "Select up to 6 skills." }).optional().default([]),
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
    },
  });

  const educationType = form.watch("educationType");

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
        expertiseIds: data.expertiseIds ?? [],
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

                {/* Skills — optional */}
                <div className="space-y-5 pt-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills &amp; Expertise <span className="normal-case font-normal text-muted-foreground">(optional)</span></h3>
                  <FormField control={form.control} name="expertiseIds" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Your top skills <span className="text-muted-foreground font-normal">(up to 6)</span></FormLabel>
                      <FormControl>
                        <ExpertiseMultiSelect options={expertiseData?.data ?? []} value={field.value ?? []} onChange={field.onChange} max={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold mt-2" disabled={signupMutation.isPending}>
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
