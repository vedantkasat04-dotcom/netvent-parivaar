import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const TEAL = "#3FA796";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        toast({ title: "Something went wrong", description: data.error?.message || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not connect. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold font-heading text-2xl mx-auto mb-2">
              N
            </div>
            <CardTitle className="font-heading text-3xl font-bold">
              {sent ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription className="text-base">
              {sent
                ? `We've sent a reset link to ${email}`
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16" style={{ color: TEAL }} />
                </div>
                <div className="rounded-xl p-4 text-sm text-center space-y-1"
                  style={{ background: "rgba(63,167,150,0.08)", border: "1px solid rgba(63,167,150,0.2)" }}>
                  <p className="font-medium" style={{ color: "#0E1B2A" }}>Email sent!</p>
                  <p className="text-muted-foreground">Check your inbox (and spam folder). The link expires in 1 hour.</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Try a different email
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: TEAL }}>
                    Back to Log in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || !email}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: TEAL }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Log in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
