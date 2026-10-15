import { useState } from "react";
import { Facebook, Instagram, Youtube, MousePointerClick, Settings2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function safeBuilderLink(value: string): string | undefined {
  const link = value.trim();
  if (!link || /[\s\\\u0000-\u001f]/.test(link)) return undefined;
  if (link.startsWith("#") || (link.startsWith("/") && !link.startsWith("//"))) return link;
  try {
    const url = new URL(link);
    if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) return link;
  } catch { /* Invalid or unsupported link. */ }
  return undefined;
}

type ButtonSettings = { sr: string; en: string; action: "link" | "chat" | "scroll"; target: string; newTab: boolean; variant: "default" | "outline" | "secondary" };
const buttonDefaults: ButtonSettings = { sr: "Novo dugme", en: "New button", action: "link", target: "", newTab: false, variant: "default" };

export function BuilderButton({ id }: { id: string }) {
  const { json, save, editMode, lang, setChatOpen } = useSite();
  const key = `button:${id}`;
  const settings = json<ButtonSettings>(key, buttonDefaults);
  const [draft, setDraft] = useState(settings);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const change = (patch: Partial<ButtonSettings>) => setDraft((old) => ({ ...old, ...patch }));
  const label = settings[lang] || settings.sr || settings.en;
  const href = settings.action === "link" ? safeBuilderLink(settings.target) : undefined;
  const run = () => {
    if (settings.action === "chat") setChatOpen(true);
    if (settings.action === "scroll") {
      const target = document.getElementById(settings.target.replace(/^#/, ""));
      if (target) target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      else toast.error(lang === "sr" ? "Sekcija nije pronađena" : "Section not found");
    }
  };
  const persist = async () => {
    if (!draft.sr.trim() && !draft.en.trim()) { toast.error("Upišite tekst dugmeta"); return; }
    if (draft.action === "link" && !safeBuilderLink(draft.target)) { toast.error("Unesite ispravan link (https://, /, #, mailto: ili tel:)"); return; }
    if (draft.action === "scroll" && !/^[\w-]+$/.test(draft.target.replace(/^#/, ""))) { toast.error("Unesite oznaku sekcije, npr. kontakt"); return; }
    setBusy(true);
    try { await save({ [key]: JSON.stringify(draft) }); setOpen(false); toast.success("Dugme sačuvano"); }
    catch { toast.error("Dugme nije sačuvano"); }
    finally { setBusy(false); }
  };
  return <>
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {href ? <Button asChild variant={settings.variant} className="h-auto min-h-9 max-w-full whitespace-normal break-words"><a href={href} target={settings.newTab ? "_blank" : undefined} rel={settings.newTab ? "noopener noreferrer" : undefined}>{label}</a></Button>
        : <Button variant={settings.variant} disabled={settings.action === "link"} className="h-auto min-h-9 max-w-full whitespace-normal break-words" onClick={run}>{label}</Button>}
      {editMode && <Button variant="outline" size="icon-sm" aria-label="Podesi dugme" title="Podesi dugme" onClick={() => { setDraft(settings); setOpen(true); }}><Settings2 /></Button>}
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Podešavanje dugmeta</DialogTitle></DialogHeader>
      <Label className="flex flex-col gap-2">Tekst dugmeta (ME)<Input value={draft.sr} onChange={(e) => change({ sr: e.target.value })} /></Label>
      <Label className="flex flex-col gap-2">Tekst dugmeta (EN)<Input value={draft.en} onChange={(e) => change({ en: e.target.value })} /></Label>
      <Label>Na klik</Label><Select value={draft.action} onValueChange={(action: ButtonSettings["action"]) => change({ action })}><SelectTrigger aria-label="Na klik"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="link">Otvori link</SelectItem><SelectItem value="chat">Otvori chatbot</SelectItem><SelectItem value="scroll">Idi do sekcije</SelectItem></SelectContent></Select>
      {draft.action !== "chat" && <Label className="flex flex-col gap-2">{draft.action === "link" ? "Link" : "Oznaka sekcije"}<Input value={draft.target} placeholder={draft.action === "link" ? "https://…" : "kontakt"} onChange={(e) => change({ target: e.target.value })} /></Label>}
      {draft.action === "link" && <Label className="flex items-center justify-between gap-3">Otvori u novoj kartici<Switch checked={draft.newTab} onCheckedChange={(newTab) => change({ newTab })} /></Label>}
      <Label>Izgled dugmeta</Label><Select value={draft.variant} onValueChange={(variant: ButtonSettings["variant"]) => change({ variant })}><SelectTrigger aria-label="Izgled dugmeta"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Puno</SelectItem><SelectItem value="outline">Sa okvirom</SelectItem><SelectItem value="secondary">Blago</SelectItem></SelectContent></Select>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Otkaži</Button><Button disabled={busy} onClick={persist}><MousePointerClick />Sačuvaj</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}

function TikTokIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M16.7 2h-3.5v13.6a3 3 0 1 1-2.6-3V9a6.7 6.7 0 1 0 6.1 6.6V8.7a9 9 0 0 0 5.1 1.6V6.8A5.2 5.2 0 0 1 16.7 2Z" /></svg>;
}
const networks: { id: string; name: string; Icon: LucideIcon | typeof TikTokIcon }[] = [
  { id: "facebook", name: "Facebook", Icon: Facebook }, { id: "instagram", name: "Instagram", Icon: Instagram },
  { id: "tiktok", name: "TikTok", Icon: TikTokIcon }, { id: "youtube", name: "YouTube", Icon: Youtube },
];

export function BuilderSocialLinks({ id }: { id: string }) {
  const { json, save, editMode } = useSite();
  const key = `social:${id}`;
  const settings = json<Record<string, string>>(key, {});
  const [draft, setDraft] = useState(settings);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const persist = async () => {
    for (const network of networks) {
      const value = draft[network.id]?.trim();
      if (value && (!safeBuilderLink(value) || !/^https?:\/\//i.test(value))) { toast.error(`Unesite ispravan https:// link za ${network.name}`); return; }
    }
    setBusy(true);
    try { await save({ [key]: JSON.stringify(draft) }); setOpen(false); toast.success("Linkovi sačuvani"); }
    catch { toast.error("Linkovi nisu sačuvani"); }
    finally { setBusy(false); }
  };
  return <>
    <div className="flex flex-wrap items-center gap-2">
      {networks.map(({ id: networkId, name, Icon }) => {
        const href = safeBuilderLink(settings[networkId] ?? "");
        if (href) return <Button key={networkId} asChild variant="ghost" size="icon-lg"><a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}><Icon className="size-5" /></a></Button>;
        return editMode ? <span key={networkId} className="flex size-10 items-center justify-center text-muted-foreground" title={name}><Icon className="size-5" /></span> : null;
      })}
      {editMode && <Button variant="outline" size="icon-sm" aria-label="Podesi društvene mreže" title="Podesi društvene mreže" onClick={() => { setDraft(settings); setOpen(true); }}><Settings2 /></Button>}
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Društvene mreže</DialogTitle></DialogHeader>
      {networks.map(({ id: networkId, name, Icon }) => <Label key={networkId} className="flex flex-col gap-2"><span className="flex items-center gap-2"><Icon className="size-4" />{name}</span><Input type="url" placeholder="https://…" value={draft[networkId] ?? ""} onChange={(e) => setDraft((old) => ({ ...old, [networkId]: e.target.value }))} /></Label>)}
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Otkaži</Button><Button disabled={busy} onClick={persist}>Sačuvaj</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}