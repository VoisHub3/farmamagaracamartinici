import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Heart, Leaf, Mail, MapPin, Phone, Clock, Baby } from "lucide-react";
import { SiteProvider, contentQuery, useSite } from "@/lib/site-content";
import { EditableImage, EditableText } from "@/components/editable";
import { AdminBar } from "@/components/admin-bar";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import logo from "@/assets/donkey-logo.png";

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
  const { lang, setLang, setChatOpen } = useSite();
  return (
    <div className="min-h-screen">
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-hero-foreground">
          <a href="#" className="flex items-center gap-2">
            <img src={logo} alt="" width={40} height={40} className="size-10 rounded-full bg-card p-1" />
            <EditableText k="brand.name" className="font-display text-xl font-semibold" />
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="#prica" className="hidden sm:inline"><EditableText k="nav.story" /></a>
            <a href="#mlijeko" className="hidden sm:inline"><EditableText k="nav.milk" /></a>
            <a href="#kontakt" className="hidden sm:inline"><EditableText k="nav.contact" /></a>
            <div className="flex rounded-full border border-hero-foreground/40 p-0.5 text-xs">
              {(["sr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 uppercase ${lang === l ? "bg-hero-foreground text-foreground" : ""}`}
                >
                  {l === "sr" ? "ME" : "EN"}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <EditableImage k="hero" alt="Magarci na pašnjaku" eager wrapperClassName="absolute inset-0" className="size-full object-cover" buttonClassName="z-30" />
        <div className="pointer-events-none absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 text-hero-foreground">
          <EditableText k="hero.eyebrow" as="p" className="mb-4 text-sm uppercase tracking-[0.2em] opacity-90" />
          <EditableText k="hero.title" as="h1" className="max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-7xl" />
          <EditableText k="hero.subtitle" as="p" className="mt-6 max-w-xl text-lg opacity-90" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={() => setChatOpen(true)}>
              <EditableText k="hero.cta" />
            </Button>
            <Button variant="heroGhost" size="lg" asChild>
              <a href="#prica"><EditableText k="hero.cta2" /></a>
            </Button>
          </div>
        </div>
      </section>

      <section id="prica" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <EditableImage k="story" alt="Ždrijebe na farmi" wrapperClassName="overflow-hidden rounded-3xl" className="aspect-[4/5] w-full object-cover" />
        <div>
          <EditableText k="story.eyebrow" as="p" className="text-sm font-medium uppercase tracking-[0.2em] text-primary" />
          <EditableText k="story.title" as="h2" className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl" />
          <EditableText k="story.p1" as="p" className="mt-6 text-lg leading-relaxed text-muted-foreground" />
          <EditableText k="story.p2" as="p" className="mt-4 text-lg leading-relaxed text-muted-foreground" />
          <div className="mt-10 grid grid-cols-3 gap-4 border-t pt-8">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <EditableText k={`stat${n}.value`} as="p" className="font-display text-4xl font-semibold text-primary" />
                <EditableText k={`stat${n}.label`} as="p" className="mt-1 text-sm text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mlijeko" className="bg-olive py-24 text-olive-foreground">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <EditableText k="milk.eyebrow" as="p" className="text-sm uppercase tracking-[0.2em] opacity-80" />
            <EditableText k="milk.title" as="h2" className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl" />
            <EditableText k="milk.text" as="p" className="mt-6 text-lg leading-relaxed opacity-90" />
            <div className="mt-10 space-y-6">
              {[
                { n: 1, Icon: Heart },
                { n: 2, Icon: Droplets },
                { n: 3, Icon: Baby },
              ].map(({ n, Icon }) => (
                <div key={n} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-olive-foreground/15">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <EditableText k={`b${n}.title`} as="h3" className="text-xl font-semibold" />
                    <EditableText k={`b${n}.text`} as="p" className="mt-1 opacity-85" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <EditableImage k="milk" alt="Boce magarećeg mlijeka" wrapperClassName="overflow-hidden rounded-3xl" className="aspect-[5/4] w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <img src={logo} alt="" width={96} height={96} className="mx-auto size-24" loading="lazy" />
        <EditableText k="chat.title" as="h2" className="mt-6 text-4xl font-semibold" />
        <EditableText k="chat.text" as="p" className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground" />
        <Button variant="hero" size="lg" className="mt-8" onClick={() => setChatOpen(true)}>
          <EditableText k="hero.cta" />
        </Button>
      </section>

      <section id="kontakt" className="bg-secondary py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          <div>
            <EditableText k="contact.eyebrow" as="p" className="text-sm font-medium uppercase tracking-[0.2em] text-primary" />
            <EditableText k="contact.title" as="h2" className="mt-3 text-4xl font-semibold leading-tight" />
            <EditableText k="contact.text" as="p" className="mt-4 text-lg text-muted-foreground" />
          </div>
          <ul className="space-y-5 text-lg">
            {[
              { k: "contact.address", Icon: MapPin },
              { k: "contact.phone", Icon: Phone },
              { k: "contact.email", Icon: Mail },
              { k: "contact.hours", Icon: Clock },
            ].map(({ k, Icon }) => (
              <li key={k} className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary">
                  <Icon className="size-5" />
                </span>
                <EditableText k={k} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Leaf className="size-4 text-olive" /> <EditableText k="footer.text" />
        </span>
        <a href="/auth" className="hover:text-foreground">Admin</a>
      </footer>

      <ChatWidget />
      <AdminBar />
    </div>
  );
}
