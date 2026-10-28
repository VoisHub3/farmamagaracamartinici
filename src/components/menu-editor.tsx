import { useState } from "react";
import { ArrowDown, ArrowUp, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/lib/site-content";
import { sectionAnchor, type MenuBlock, type SectionMenuLink } from "@/lib/menu-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type MenuTarget = MenuBlock & { label: string };

export function MenuEditor({ slug, links, targets }: { slug: string; links: SectionMenuLink[]; targets: MenuTarget[] }) {
  const { save } = useSite();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SectionMenuLink[]>([]);
  const [busy, setBusy] = useState(false);
  const change = (id: string, patch: Partial<SectionMenuLink>) => setDraft((old) => old.map((link) => link.id === id ? { ...link, ...patch } : link));
  const move = (index: number, offset: number) => setDraft((old) => {
    const next = [...old];
    const item = next[index];
    const other = next[index + offset];
    if (!item || !other) return old;
    next[index] = other;
    next[index + offset] = item;
    return next;
  });
  return <>
    <Button variant="outline" size="icon-sm" title="Linkovi menija" aria-label="Linkovi menija" onClick={() => { setDraft(links.map((link) => ({ ...link }))); setOpen(true); }}><Link2 /></Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Linkovi menija</DialogTitle></DialogHeader>
      {draft.map((link, index) => <div key={link.id} className="space-y-3 border-b border-border pb-4">
        <div className="flex items-center gap-2"><span className="mr-auto text-sm font-medium">Stavka {index + 1}</span>
          <Button variant="ghost" size="icon-sm" aria-label="Pomjeri link gore" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Pomjeri link dolje" disabled={index === draft.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Obriši link" onClick={() => setDraft((old) => old.filter((item) => item.id !== link.id))}><Trash2 /></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2"><Label className="flex flex-col gap-2">Naziv (ME)<Input value={link.sr} onChange={(e) => change(link.id, { sr: e.target.value })} /></Label><Label className="flex flex-col gap-2">Naziv (EN)<Input value={link.en} onChange={(e) => change(link.id, { en: e.target.value })} /></Label></div>
        <Label className="flex flex-col gap-2">Sekcija<Select value={link.sectionId} onValueChange={(sectionId) => change(link.id, { sectionId })}><SelectTrigger aria-label={`Sekcija za stavku ${index + 1}`} className="w-full"><SelectValue placeholder="Izaberite sekciju" /></SelectTrigger><SelectContent>{targets.map((target) => <SelectItem key={target.id} value={target.id}>{target.label}</SelectItem>)}</SelectContent></Select></Label>
        <Input aria-label={`Ankor link ${index + 1}`} readOnly value={`#${sectionAnchor(link.sectionId)}`} />
      </div>)}
      <Button variant="outline" disabled={!targets.length} onClick={() => { const first = targets[0]; if (first) setDraft((old) => [...old, { id: crypto.randomUUID(), sectionId: first.id, sr: "", en: "" }]); }}><Plus />Dodaj link</Button>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Otkaži</Button><Button disabled={busy} onClick={async () => {
        if (draft.some((link) => !link.sr.trim() && !link.en.trim())) { toast.error("Upišite naziv za svaku stavku"); return; }
        if (draft.some((link) => !targets.some((target) => target.id === link.sectionId))) { toast.error("Izaberite postojeću sekciju za svaki link"); return; }
        setBusy(true);
        try { await save({ [`menu:${slug}`]: JSON.stringify(draft) }); setOpen(false); toast.success("Linkovi menija sačuvani"); }
        catch { toast.error("Linkovi nisu sačuvani"); } finally { setBusy(false); }
      }}>Sačuvaj</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}