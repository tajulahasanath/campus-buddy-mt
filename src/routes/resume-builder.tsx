import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Public URL kept for backwards compatibility — Resume Builder is now
// auth-only. Send signed-in users to their dashboard, others to login.
export const Route = createFileRoute("/resume-builder")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/resumes" });
    throw redirect({ to: "/auth" });
  },
});
