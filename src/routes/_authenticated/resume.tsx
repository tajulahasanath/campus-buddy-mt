import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/resume")({
  beforeLoad: () => { throw redirect({ to: "/resumes" }); },
});
