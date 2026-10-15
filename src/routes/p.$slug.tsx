import { createFileRoute } from "@tanstack/react-router";
import { SiteProvider, contentQuery } from "@/lib/site-content";
import { SitePage } from "@/components/page-builder";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: ({ params, loaderData }) => {
    const name = loaderData?.[`t:page.${params.slug}.title:sr`] ?? params.slug;
    const title = `${name} — Farma Magarica`;
    const description = `${name} — porodična farma magarica i prirodno magareće mlijeko.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PageRoute,
});

function PageRoute() {
  const { slug } = Route.useParams();
  return (
    <SiteProvider>
      <SitePage key={slug} slug={slug} />
    </SiteProvider>
  );
}
