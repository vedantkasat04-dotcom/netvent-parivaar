import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const TEAL = "#3FA796";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { refreshUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, setLocation]);

  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: async () => {
        await refreshUser();
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.data?.error?.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold font-heading text-2xl mx-auto mb-2">
              N
            </div>
            <CardTitle className="font-heading text-3xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Log in to your NetVent Parivaar account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-foreground">Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} className="h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-medium text-foreground">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: TEAL }}>
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" {...field} className="h-12 pr-10" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="rememberMe" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} id="rememberMe" />
                    </FormControl>
                    <FormLabel htmlFor="rememberMe" className="font-normal text-sm text-muted-foreground cursor-pointer">
                      Keep me logged in for 30 days
                    </FormLabel>
                  </FormItem>
                )} />

                <Button type="submit" className="w-full h-12 text-base font-semibold mt-2" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
