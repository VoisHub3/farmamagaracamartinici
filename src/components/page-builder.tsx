import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowDown, ArrowUp, Baby, Clock, Droplets, FilePlus2, GripVertical, Heart, ImagePlus, Leaf, Loader2, Mail, MapPin,
  Phone, Plus, Trash2, X,
} from "lucide-react";
import { useSite } from "@/lib/site-content";
import { EditableImage, EditableText } from "@/components/editable";
import { AdminBar } from "@/components/admin-bar";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logo from "@/assets/donkey-logo.png";
import { FlexibleSection, SectionSettingsButton, sectionStyle, type SectionSettings } from "@/components/section-editor";

export type Block = { id: string; type: string };
export type PageInfo = { slug: string };

const BUILTIN: Record<string, string> = {
  hero: "Glavna slika (naslovna)",
  story: "Naša priča",
  milk: "Mlijeko",
  chat: "Asistent (chat)",
  contact: "Kontakt",
};
const CUSTOM: Record<string, string> = {
  section: "Sekcija 100% sa blokovima",
  text: "Tekst",
  textImage: "Tekst sa slikom",
  gallery: "Galerija slika",
};
const HOME_DEFAULT: Block[] = Object.keys(BUILTIN).map((t) => ({ id: t, type: t }));

const newId = () => Math.random().toString(36).slice(2, 10);
export const layoutKey = (slug: string) => `layout:${slug}`;

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Slika se ne može obraditi");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function SitePage({ slug }: { slug: string }) {
  const { json, save, editMode } = useSite();
  const blocks = json<Block[]>(layoutKey(slug), slug === "home" ? HOME_DEFAULT : []);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const persist = async (next: Block[]) => {
    try {
      await save({ [layoutKey(slug)]: JSON.stringify(next) });
    } catch (e) {
      toast.error("Greška: " + (e as Error).message);
    }
  };
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    if (!b) return;
    next.splice(to, 0, b);
    persist(next);
  };
  const remove = (i: number) => {
    if (!confirm("Obrisati ovaj blok?")) return;
    persist(blocks.filter((_, j) => j !== i));
  };
  const add = (type: string) => {
    const id = BUILTIN[type] ? type : newId();
    persist([...blocks, { id, type }]);
    toast.success("Blok dodat na dno stranice");
  };

  const heroFirst = blocks[0]?.type === "hero";

  return (
    <div className="min-h-screen">
      <SiteHeader overlay={heroFirst} />
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className={cn("relative", json<SectionSettings | null>(`section-style:${b.id}`, null) && b.type !== "section" && "builder-configured", editMode && "group/block", dragOver === i && dragFrom !== i && "ring-4 ring-edit ring-inset")}
          style={(() => { const settings = json<SectionSettings | null>(`section-style:${b.id}`, null); return settings && b.type !== "section" ? sectionStyle(settings) : undefined; })()}
          onDragOver={(e) => {
            if (dragFrom === null) return;
            e.preventDefault();
            setDragOver(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragFrom !== null) move(dragFrom, i);
            setDragFrom(null);
            setDragOver(null);
          }}
        >
          {editMode && (
            <div className={cn("absolute left-4 z-40 flex items-center gap-1 rounded-full bg-edit p-1 text-edit-foreground shadow-lg", heroFirst && i === 0 ? "top-24" : "top-4")}>
              <span
                draggable
                onDragStart={(e) => {
                  setDragFrom(i);
                  const el = e.currentTarget.closest(".group\\/block") as HTMLElement | null;
                  if (el) e.dataTransfer.setDragImage(el, 20, 20);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                className="flex cursor-grab items-center gap-1 rounded-full px-2 py-1 text-xs font-medium active:cursor-grabbing"
                title="Prevuci da promijeniš redosled"
              >
                <GripVertical className="size-4" /> {BUILTIN[b.type] ?? CUSTOM[b.type] ?? b.type}
              </span>
              <IconBtn title="Pomjeri gore" onClick={() => move(i, i - 1)} disabled={i === 0}><ArrowUp className="size-4" /></IconBtn>
              <IconBtn title="Pomjeri dolje" onClick={() => move(i, i + 1)} disabled={i === blocks.length - 1}><ArrowDown className="size-4" /></IconBtn>
              <SectionSettingsButton id={b.id} />
              <IconBtn title="Obriši blok" onClick={() => remove(i)}><Trash2 className="size-4" /></IconBtn>
            </div>
          )}
          <RenderBlock block={b} />
        </div>
      ))}

      {editMode && (
        <div className="mx-auto flex max-w-6xl justify-center px-6 py-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="bg-edit text-edit-foreground hover:bg-edit/90">
                <Plus /> Dodaj novi blok
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Novi blok</DropdownMenuLabel>
              {Object.entries(CUSTOM).map(([t, l]) => (
                <DropdownMenuItem key={t} onClick={() => add(t)}>{l}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Postojeće sekcije</DropdownMenuLabel>
              {Object.entries(BUILTIN)
                .filter(([t]) => !blocks.some((b) => b.type === t))
                .map(([t, l]) => (
                  <DropdownMenuItem key={t} onClick={() => add(t)}>{l}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {blocks.length === 0 && !editMode && <div className="py-40" />}

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

function IconBtn({ children, ...p }: { children: ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" {...p} className="rounded-full p-1.5 hover:bg-edit-foreground/20 disabled:opacity-40">
      {children}
    </button>
  );
}

function SiteHeader({ overlay }: { overlay: boolean }) {
  const { lang, setLang, editMode, save, json } = useSite();
  const pages = json<PageInfo[]>("pages", []);
  const [pagesOpen, setPagesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => {
      const hero = document.querySelector("[data-hero]") as HTMLElement | null;
      const h = headerRef.current?.offsetHeight ?? 72;
      setScrolled(window.scrollY > 8);
      setPastHero(hero ? hero.getBoundingClientRect().bottom <= h : window.scrollY > h);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overlay]);
  const solid = !overlay || pastHero;
  const removeBrand = async () => {
    await save({ "t:brand.name:sr": "", "t:brand.name:en": "" });
    toast.success("Tekst pored logoa obrisan");
  };
  return (
    <header
      ref={headerRef}
      className={cn(
        "inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow,border-color] duration-300",
        overlay ? (stuck ? "fixed" : "absolute") : "sticky",
        solid ? "border-b border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-md" : "text-hero-foreground",
      )}
    >
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <EditableImage k="logo" alt="Logo" fallback={logo} compact wrapperClassName="w-10 shrink-0" />
            <EditableText k="brand.name" className="font-display text-xl font-semibold" />
          </Link>
          {editMode && (
            <button type="button" onClick={removeBrand} title="Obriši tekst pored logoa" className="rounded-full bg-edit p-1.5 text-edit-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          {overlay && (
            <>
              <a href="#prica" className="hidden sm:inline"><EditableText k="nav.story" /></a>
              <a href="#mlijeko" className="hidden sm:inline"><EditableText k="nav.milk" /></a>
              <a href="#kontakt" className="hidden sm:inline"><EditableText k="nav.contact" /></a>
            </>
          )}
          {!overlay && <Link to="/"><EditableText k="nav.home" /></Link>}
          {pages.map((p) => (
            <Link key={p.slug} to="/p/$slug" params={{ slug: p.slug }} activeProps={{ className: "underline underline-offset-4" }}>
              <EditableText k={`page.${p.slug}.title`} />
            </Link>
          ))}
          {editMode && (
            <button type="button" onClick={() => setPagesOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-edit px-3 py-1 text-xs font-medium text-edit-foreground">
              <FilePlus2 className="size-3.5" /> Stranice
            </button>
          )}
          <div className={cn("flex rounded-full border p-0.5 text-xs", solid ? "border-border" : "border-hero-foreground/40")}>
            {(["sr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn("rounded-full px-3 py-1 uppercase", lang === l && (solid ? "bg-foreground text-background" : "bg-hero-foreground text-foreground"))}
              >
                {l === "sr" ? "ME" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </nav>
      {editMode && <PagesDialog open={pagesOpen} onOpenChange={setPagesOpen} />}
    </header>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function PagesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { json, save, t } = useSite();
  const pages = json<PageInfo[]>("pages", []);
  const [sr, setSr] = useState("");
  const [en, setEn] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const slug = slugify(sr || en);
    if (!slug) { toast.error("Upišite naziv stranice"); return; }
    if (pages.some((p) => p.slug === slug)) { toast.error("Stranica s tim nazivom već postoji"); return; }
    setBusy(true);
    try {
      await save({
        pages: JSON.stringify([...pages, { slug }]),
        [`t:page.${slug}.title:sr`]: sr || en,
        [`t:page.${slug}.title:en`]: en || sr,
        [layoutKey(slug)]: JSON.stringify([{ id: newId(), type: "text" }]),
      });
      toast.success("Stranica napravljena — pojavila se u meniju");
      setSr(""); setEn("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const del = async (slug: string) => {
    if (!confirm("Obrisati ovu stranicu?")) return;
    await save({ pages: JSON.stringify(pages.filter((p) => p.slug !== slug)) });
    toast.success("Stranica obrisana");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader><DialogTitle>Stranice</DialogTitle></DialogHeader>
        <ul className="space-y-2">
          <li className="rounded-lg border px-3 py-2 text-sm">Početna (glavna stranica)</li>
          {pages.map((p) => (
            <li key={p.slug} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <Link to="/p/$slug" params={{ slug: p.slug }} onClick={() => onOpenChange(false)} className="hover:underline">
                {t(`page.${p.slug}.title`) || p.slug}
              </Link>
              <Button size="icon" variant="ghost" onClick={() => del(p.slug)} title="Obriši"><Trash2 /></Button>
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t pt-4">
          <p className="font-medium">Nova stranica</p>
          <div className="space-y-1"><Label>Naziv (crnogorski)</Label><Input value={sr} onChange={(e) => setSr(e.target.value)} placeholder="npr. Proizvodi" /></div>
          <div className="space-y-1"><Label>Naziv (English)</Label><Input value={en} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Products" /></div>
        </div>
        <DialogFooter>
          <Button onClick={create} disabled={busy}>{busy && <Loader2 className="animate-spin" />} Dodaj stranicu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "section": return <FlexibleSection id={block.id} renderGallery={(id) => <GalleryBlock id={id} embedded />} />;
    case "hero": return <HeroBlock />;
    case "story": return <StoryBlock />;
    case "milk": return <MilkBlock />;
    case "chat": return <ChatBlock />;
    case "contact": return <ContactBlock />;
    case "text": return <TextBlock id={block.id} />;
    case "textImage": return <TextImageBlock id={block.id} />;
    case "gallery": return <GalleryBlock id={block.id} />;
    default: return null;
  }
}

function HeroBlock() {
  const { setChatOpen } = useSite();
  return (
    <section data-hero className="relative grid bg-foreground">
      <EditableImage k="hero" alt="Magarci na pašnjaku" eager wrapperClassName="col-start-1 row-start-1" className="mx-auto" buttonClassName="z-30 top-24" />
      <div className="pointer-events-none absolute inset-0 bg-hero-overlay" />
      <div className="relative z-10 col-start-1 row-start-1 mx-auto w-full max-w-6xl self-end px-6 pt-40 pb-20 text-hero-foreground">
        <EditableText k="hero.eyebrow" as="p" className="mb-4 text-sm uppercase tracking-[0.2em] opacity-90" />
        <EditableText k="hero.title" as="h1" className="max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-7xl" />
        <EditableText k="hero.subtitle" as="p" className="mt-6 max-w-xl text-lg opacity-90" />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="hero" size="lg" onClick={() => setChatOpen(true)}><EditableText k="hero.cta" /></Button>
          <Button variant="heroGhost" size="lg" asChild><a href="#prica"><EditableText k="hero.cta2" /></a></Button>
        </div>
      </div>
    </section>
  );
}

function StoryBlock() {
  return (
    <section id="prica" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
      <EditableImage k="story" alt="Ždrijebe na farmi" />
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
  );
}

function MilkBlock() {
  return (
    <section id="mlijeko" className="scroll-mt-24 bg-olive py-24 text-olive-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <EditableText k="milk.eyebrow" as="p" className="text-sm uppercase tracking-[0.2em] opacity-80" />
          <EditableText k="milk.title" as="h2" className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl" />
          <EditableText k="milk.text" as="p" className="mt-6 text-lg leading-relaxed opacity-90" />
          <div className="mt-10 space-y-6">
            {[{ n: 1, Icon: Heart }, { n: 2, Icon: Droplets }, { n: 3, Icon: Baby }].map(({ n, Icon }) => (
              <div key={n} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-olive-foreground/15"><Icon className="size-5" /></span>
                <div>
                  <EditableText k={`b${n}.title`} as="h3" className="text-xl font-semibold" />
                  <EditableText k={`b${n}.text`} as="p" className="mt-1 opacity-85" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <EditableImage k="milk" alt="Boce magarećeg mlijeka" />
      </div>
    </section>
  );
}

function ChatBlock() {
  const { setChatOpen } = useSite();
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <EditableImage k="logo" alt="" fallback={logo} wrapperClassName="mx-auto w-24" />
      <EditableText k="chat.title" as="h2" className="mt-6 text-4xl font-semibold" />
      <EditableText k="chat.text" as="p" className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground" />
      <Button variant="hero" size="lg" className="mt-8" onClick={() => setChatOpen(true)}><EditableText k="hero.cta" /></Button>
    </section>
  );
}

function ContactBlock() {
  return (
    <section id="kontakt" className="scroll-mt-24 bg-secondary py-24">
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
              <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary"><Icon className="size-5" /></span>
              <EditableText k={k} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TextBlock({ id }: { id: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <EditableText k={`blk.${id}.eyebrow`} as="p" className="text-sm font-medium uppercase tracking-[0.2em] text-primary" />
      <EditableText k={`blk.${id}.title`} as="h2" className="mt-3 text-4xl font-semibold leading-tight" />
      <EditableText k={`blk.${id}.text`} as="p" className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground" />
    </section>
  );
}

function TextImageBlock({ id }: { id: string }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
      <EditableImage k={`blk.${id}.img`} alt="" />
      <div>
        <EditableText k={`blk.${id}.eyebrow`} as="p" className="text-sm font-medium uppercase tracking-[0.2em] text-primary" />
        <EditableText k={`blk.${id}.title`} as="h2" className="mt-3 text-4xl font-semibold leading-tight" />
        <EditableText k={`blk.${id}.text`} as="p" className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground" />
      </div>
    </section>
  );
}

function GalleryBlock({ id, embedded = false }: { id: string; embedded?: boolean }) {
  const { json, img, save, editMode } = useSite();
  const listKey = `gal:${id}`;
  const items = json<string[]>(listKey, []);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<string | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const entries: Record<string, string> = {};
      const ids: string[] = [];
      for (const f of Array.from(files)) {
        const iid = newId();
        entries[`img:gal.${id}.${iid}`] = await fileToDataUrl(f);
        ids.push(iid);
      }
      entries[listKey] = JSON.stringify([...items, ...ids]);
      await save(entries);
      toast.success("Slike dodate");
    } catch (e) {
      toast.error("Greška: " + (e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const removeImg = async (iid: string) => {
    await save({ [listKey]: JSON.stringify(items.filter((x) => x !== iid)) });
  };

  return (
    <section className={embedded ? "min-w-0" : "mx-auto max-w-6xl px-6 py-20"}>
      {!embedded && <EditableText k={`blk.${id}.title`} as="h2" className="text-center text-4xl font-semibold" />}
      <div className={cn("grid grid-cols-2 items-start gap-4", !embedded && "mt-10 md:grid-cols-3")}>
        {items.map((iid) => (
          <div key={iid} className="relative min-w-0">
            <button type="button" className="block w-full" onClick={() => setView(img(`gal.${id}.${iid}`))}>
              <img src={img(`gal.${id}.${iid}`)} alt="" loading="lazy" className="builder-image" />
            </button>
            {editMode && (
              <button type="button" onClick={() => removeImg(iid)} title="Obriši sliku" className="absolute right-2 top-2 rounded-full bg-edit p-2 text-edit-foreground shadow">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <button type="button" onClick={() => input.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-edit text-edit">
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            <span className="text-sm font-medium">Dodaj slike</span>
          </button>
        )}
      </div>
      {editMode && <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />}
      {!editMode && items.length === 0 && <p className="mt-6 text-center text-muted-foreground">—</p>}
      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only"><DialogTitle>Slika</DialogTitle></DialogHeader>
          {view && <img src={view} alt="" className="mx-auto block h-auto max-h-[85vh] w-auto max-w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
