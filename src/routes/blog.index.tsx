import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, CtaBand } from "@/components/site/Sections";
import { posts, formatDate } from "@/lib/blog-data";

const title = "Blog — Autism Support, Parenting & Early Learning | Turtle Wings";
const description =
  "Practical notes on routines, communication, play and early learning for children with Autism Spectrum Disorder, written by the team at Turtle Wings, Bengaluru.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes for parents and families"
        intro="Short, practical articles on routines, communication, play and early learning."
      />

      <section className="section-pad">
        <div className="container-site">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 80} className="card-soft overflow-hidden">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block h-full focus-visible:outline-none"
                >
                  <span className="block overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      width={1200}
                      height={800}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="block p-6">
                    <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                      {post.category}
                    </span>
                    <span className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </span>
                    <span className="mt-2 block font-display text-xl font-bold text-forest-deep">
                      {post.title}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-forest-deep">
                      Read more
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
