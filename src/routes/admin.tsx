import { useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { adminSignIn, adminSignOut, useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Content Manager | Turtle Wings" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private content manager for the Turtle Wings website." },
    ],
  }),
  component: AdminLayout,
});

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/programs", label: "Programs" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/videos", label: "Videos" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/settings", label: "Site settings" },
] as const;

function AdminLayout() {
  const { user, loading, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Checking your session…
        </p>
      </div>
    );
  }

  if (!user) return <SignIn initialError={error} />;

  return (
    <div className="container-site py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <nav aria-label="Content manager" className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/admin" }}
              activeProps={{ className: "bg-forest-deep text-cream" }}
              className="inline-flex min-h-9 items-center rounded-full border border-input px-3 text-sm font-bold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user.email}</span>
          <button
            type="button"
            onClick={() => void adminSignOut()}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-input px-3 font-bold"
          >
            <LogOut aria-hidden="true" className="size-3.5" /> Sign out
          </button>
        </div>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

function SignIn({ initialError }: { initialError: string | null }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(initialError);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage(null);
    try {
      await adminSignIn(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
    } catch {
      setMessage("We could not sign you in. Please check your email and password.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="container-site max-w-md py-16">
      <h1 className="font-display text-2xl font-extrabold text-forest-deep">Content manager</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with the Turtle Wings administrator account to manage programs, members, blog posts,
        videos and enquiries.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
          />
        </div>
        {message ? (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-extrabold text-primary-foreground disabled:opacity-70"
        >
          {status === "loading" ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}
