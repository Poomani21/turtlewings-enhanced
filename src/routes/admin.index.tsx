import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminList } from "@/lib/cms";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const cards = [
  { name: "programs", label: "Programs", to: "/admin/programs" },
  { name: "members", label: "Members", to: "/admin/members" },
  { name: "blogs", label: "Blog posts", to: "/admin/blog" },
  { name: "videos", label: "Videos", to: "/admin/videos" },
  { name: "enquiries", label: "Enquiries", to: "/admin/enquiries" },
] as const;

function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-forest-deep">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you publish here appears on the website straight away.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CountCard key={card.name} {...card} />
        ))}
      </div>
    </div>
  );
}

function CountCard({
  name,
  label,
  to,
}: {
  name: (typeof cards)[number]["name"];
  label: string;
  to: (typeof cards)[number]["to"];
}) {
  const query = useQuery({
    queryKey: ["admin", name],
    queryFn: () => adminList<{ id: string }>(name),
  });

  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-accent/40">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-forest-deep">
        {query.isLoading ? "…" : query.isError ? "—" : (query.data ?? []).length}
      </p>
    </Link>
  );
}
