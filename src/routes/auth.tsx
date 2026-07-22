import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Student Hub" }] }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(6, "Min 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name required").max(100);

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  let active = true;

  const goToDashboard = () => {
    if (!active) return;

    window.setTimeout(() => {
      if (active) {
        navigate({ to: "/dashboard", replace: true });
      }
    }, 0);
  };

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session) goToDashboard();
    },
  );

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) goToDashboard();
  });

  return () => {
    active = false;
    authListener.subscription.unsubscribe();
  };
}, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(form.get("email"));
    const password = passwordSchema.safeParse(form.get("password"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = nameSchema.safeParse(form.get("name"));
    const email = emailSchema.safeParse(form.get("email"));
    const password = passwordSchema.safeParse(form.get("password"));
    if (!name.success) return toast.error(name.error.issues[0].message);
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
  email: email.data,
  password: password.data,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
    data: { full_name: name.data },
  },
});
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Account created! Check your email to confirm your account, then sign in.");
      return;
    }
    toast.success("Account created! Welcome to Student Hub.");
    navigate({ to: "/dashboard" });
  };
const handleGoogle = async () => {
  setLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    setLoading(false);
    toast.error("Google sign-in failed");
  }
};
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          StudentHub
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">The smartest way<br />to study, prep & grow.</h2>
          <p className="mt-4 max-w-md text-white/80">Join thousands of students using Student Hub to organize notes, build resumes, crack placements, and ace every semester.</p>
        </div>
        <div className="text-sm text-white/60">© {new Date().getFullYear()} StudentHub</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 font-bold lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            StudentHub
          </Link>
          <h1 className="text-3xl font-bold">Welcome 👋</h1>
          <p className="mt-1.5 text-muted-foreground">Sign in or create your free account to continue.</p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="si-email">Email</Label><Input id="si-email" name="email" type="email" placeholder="you@college.edu" required /></div>
                <div className="space-y-1.5"><Label htmlFor="si-password">Password</Label><Input id="si-password" name="password" type="password" placeholder="••••••••" required /></div>
                <Button type="submit" className="w-full bg-gradient-brand" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="mt-4 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="su-name">Full name</Label><Input id="su-name" name="name" placeholder="Aarav Sharma" required /></div>
                <div className="space-y-1.5"><Label htmlFor="su-email">Email</Label><Input id="su-email" name="email" type="email" placeholder="you@college.edu" required /></div>
                <div className="space-y-1.5"><Label htmlFor="su-password">Password</Label><Input id="su-password" name="password" type="password" placeholder="Min 6 characters" required /></div>
                <Button type="submit" className="w-full bg-gradient-brand" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms & privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
