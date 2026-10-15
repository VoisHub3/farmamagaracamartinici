import { createFileRoute } from "@tanstack/react-router";
import { SiteProvider, contentQuery } from "@/lib/site-content";
import { SitePage } from "@/components/page-builder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farma Magarica — magareće mlijeko s planine" },
      { name: "description", content: "Porodična farma magarica: priča o stadu, prirodno magareće mlijeko i asistent koji odgovara na pitanja." },
      { property: "og:title", content: "Farma Magarica — magareće mlijeko s planine" },
      { property: "og:description", content: "Porodična farma magarica i prirodno magareće mlijeko." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  component: () => (
    <SiteProvider>
      <Page />
    </SiteProvider>
  ),
});

function Page() {
  return <SitePage slug="home" />;
}
