import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Columns3, Image, Images, Plus, Settings2, Trash2, Type, AlignLeft, AlignCenter, AlignRight, MousePointerClick, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/lib/site-content";
import { EditableImage, EditableText } from "@/components/editable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuilderButton, BuilderSocialLinks } from "@/components/builder-actions";

type ElementKind = "title" | "text" | "image" | "gallery" | "button" | "social";
type SectionElement = { id: string; type: ElementKind; margin: number; padding: number };
type Column = { id: string; width: 25 | 50 | 75 | 100; padding: number; gap: number; elements: SectionElement[] };
export type SectionSettings = { background: string; customColor?: string; paddingY: number; paddingX: number; marginTop: number; marginBottom: number; gap: number; alignment?: "left" | "center" | "right" };
const defaults: SectionSettings = { background: "background", paddingY: 64, paddingX: 24, marginTop: 0, marginBottom: 0, gap: 24 };
const uid = () => crypto.randomUUID().slice(0, 8);
const backgrounds = [
  { id: "background", label: "Osnovna", color: "bg-background" },
  { id: "card", label: "Svijetla", color: "bg-card" },
  { id: "secondary", label: "Blaga", color: "bg-secondary" },
  { id: "olive", label: "Maslinasta", color: "bg-olive" },
  { id: "primary", label: "Terakota", color: "bg-primary" },
  { id: "foreground", label: "Tamna", color: "bg-foreground" },
];
export function NumberSetting({ label, value, onChange, max = 240, min = 0 }: { label: string; value: number; onChange: (value: number) => void; max?: number; min?: number }) {
  return <Label className="flex min-w-0 flex-col gap-2"><span>{label} (px)</span><Input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} /></Label>;
}
export function sectionStyle(settings: SectionSettings): CSSProperties {
  const background = settings.background === "custom" ? settings.customColor : `var(--${settings.background})`;
  let foreground = "var(--foreground)";
  if (["olive", "primary", "foreground"].includes(settings.background)) foreground = "var(--hero-foreground)";
  if (settings.background === "custom" && /^#[0-9a-f]{6}$/i.test(settings.customColor ?? "")) {
    const color = settings.customColor ?? "";
    const luminance = parseInt(color.slice(1, 3), 16) * 0.299 + parseInt(color.slice(3, 5), 16) * 0.587 + parseInt(color.slice(5, 7), 16) * 0.114;
    foreground = luminance < 145 ? "var(--hero-foreground)" : "var(--foreground)";
  }
  return { "--section-background": background, "--section-foreground": foreground, "--section-padding-y": `${settings.paddingY}px`, "--section-padding-x": `${settings.paddingX}px`, marginTop: settings.marginTop, marginBottom: settings.marginBottom } as CSSProperties;
}
export function SectionSettingsButton({ id }: { id: string }) {
  const { json, save } = useSite();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(defaults);
  const key = `section-style:${id}`;
  const change = (patch: Partial<SectionSettings>) => setDraft((old) => ({ ...old, ...patch }));
  return <>
    <Button size="icon-xs" variant="ghost" title="Izgled sekcije" aria-label="Izgled sekcije" onClick={() => { setDraft(json(key, defaults)); setOpen(true); }}><Settings2 /></Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Izgled sekcije</DialogTitle></DialogHeader>
      <Label>Boja pozadine</Label><div className="flex flex-wrap gap-2">{backgrounds.map((bg) => <Button key={bg.id} variant="outline" size="icon" title={bg.label} aria-label={bg.label} aria-pressed={draft.background === bg.id} className={draft.background === bg.id ? "ring-2 ring-edit" : ""} onClick={() => change({ background: bg.id })}><span className={`size-6 rounded border ${bg.color}`} /></Button>)}</div>
      <Label className="flex items-center justify-between">Prilagođena boja<Input type="color" aria-label="Prilagođena boja" className="h-10 w-20 p-1" value={draft.customColor ?? "#ffffff"} onChange={(e) => change({ background: "custom", customColor: e.target.value })} /></Label>
      <div className="grid grid-cols-2 gap-4"><NumberSetting label="Unutrašnji razmak gore/dolje" value={draft.paddingY} onChange={(paddingY) => change({ paddingY })} /><NumberSetting label="Unutrašnji razmak lijevo/desno" value={draft.paddingX} onChange={(paddingX) => change({ paddingX })} /><NumberSetting label="Margina iznad" value={draft.marginTop} onChange={(marginTop) => change({ marginTop })} /><NumberSetting label="Margina ispod" value={draft.marginBottom} onChange={(marginBottom) => change({ marginBottom })} /><NumberSetting label="Razmak između blokova" value={draft.gap} onChange={(gap) => change({ gap })} /></div>
      <Label>Poravnanje blokova u redu</Label><div className="flex gap-2">{([{ value: "left", label: "Lijevo", Icon: AlignLeft }, { value: "center", label: "Centrirano", Icon: AlignCenter }, { value: "right", label: "Desno", Icon: AlignRight }] as const).map(({ value, label, Icon }) => <Button key={value} variant="outline" size="icon" aria-label={label} title={label} aria-pressed={(draft.alignment ?? "left") === value} className={(draft.alignment ?? "left") === value ? "ring-2 ring-edit" : ""} onClick={() => change({ alignment: value })}><Icon /></Button>)}</div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Otkaži</Button><Button disabled={busy} onClick={async () => { setBusy(true); try { await save({ [key]: JSON.stringify(draft) }); setOpen(false); toast.success("Izgled sačuvan"); } catch { toast.error("Izgled nije sačuvan"); } finally { setBusy(false); } }}>Sačuvaj</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
const kinds: { type: ElementKind; label: string; icon: typeof Type }[] = [{ type: "title", label: "Naslov", icon: Type }, { type: "text", label: "Tekst", icon: AlignLeft }, { type: "image", label: "Slika", icon: Image }, { type: "gallery", label: "Galerija", icon: Images }, { type: "button", label: "Dugme", icon: MousePointerClick }, { type: "social", label: "Društvene mreže", icon: Share2 }];
export function FlexibleSection({ id, renderGallery }: { id: string; renderGallery: (id: string) => ReactNode }) {
  const { json, save, editMode } = useSite();
  const key = `section:${id}`;
  const columns = json<Column[]>(key, []);
  const settings = json<SectionSettings>(`section-style:${id}`, defaults);
  const [selected, setSelected] = useState<{ column: string; element?: string } | null>(null);
  const [padding, setPadding] = useState(0);
  const [gap, setGap] = useState(16);
  const [margin, setMargin] = useState(0);
  const [busy, setBusy] = useState(false);
  const [newWidth, setNewWidth] = useState<Column["width"]>(50);
  const persist = async (next: Column[], extra: Record<string, string> = {}) => { setBusy(true); try { await save({ [key]: JSON.stringify(next), ...extra }); return true; } catch { toast.error("Promjena nije sačuvana"); return false; } finally { setBusy(false); } };
  const update = (cid: string, patch: Partial<Column>) => persist(columns.map((c) => c.id === cid ? { ...c, ...patch } : c));
  const addColumn = (width: Column["width"], after?: string) => {
    const next = [...columns];
    const index = after ? columns.findIndex((c) => c.id === after) + 1 : columns.length;
    next.splice(index, 0, { id: uid(), width, padding: 16, gap: 16, elements: [] });
    persist(next);
  };
  const addElement = (c: Column, type: ElementKind) => {
    const eid = uid();
    const extra: Record<string, string> = {};
    if (type === "title" || type === "text") { extra[`t:element.${eid}:sr`] = type === "title" ? "Novi naslov" : "Novi tekst"; extra[`t:element.${eid}:en`] = type === "title" ? "New title" : "New text"; }
    persist(columns.map((col) => col.id === c.id ? { ...col, elements: [...col.elements, { id: eid, type, margin: 0, padding: 0 }] } : col), extra);
  };
  const reorder = (items: SectionElement[], index: number, direction: number) => { const next = [...items]; const target = index + direction; const current = next[index]; const other = next[target]; if (!current || !other) return items; next[index] = other; next[target] = current; return next; };
  return <section className="builder-section w-full" data-section-id={id} style={sectionStyle(settings)}>
    <fieldset disabled={busy} className="min-w-0">
    <div className={`builder-columns min-w-0 ${settings.alignment === "center" ? "justify-center" : settings.alignment === "right" ? "justify-end" : "justify-start"}`} style={{ "--block-gap": `${settings.gap}px` } as CSSProperties}>
      {columns.map((c, index) => <div key={c.id} className={`builder-column min-w-0 ${editMode ? "border border-dashed border-edit" : ""}`} style={{ padding: c.padding, "--block-width": c.width / 100 } as CSSProperties} data-column-width={c.width}>
        {editMode && <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-edit/30 pb-2 text-foreground"><span className="mr-auto flex items-center gap-1 text-xs"><Columns3 className="size-4" /> Blok {index + 1}</span><Select value={String(c.width)} onValueChange={(v) => update(c.id, { width: Number(v) as Column["width"] })}><SelectTrigger aria-label={`Širina bloka ${index + 1}`} className="w-24 bg-background"><SelectValue /></SelectTrigger><SelectContent>{[25, 50, 75, 100].map((w) => <SelectItem key={w} value={String(w)}>{w}%</SelectItem>)}</SelectContent></Select><Button variant="outline" size="icon-sm" title="Razmaci bloka" aria-label="Razmaci bloka" onClick={() => { setSelected({ column: c.id }); setPadding(c.padding); setGap(c.gap); }}><Settings2 /></Button><Button variant="outline" size="icon-sm" title="Obriši unutrašnji blok" aria-label="Obriši unutrašnji blok" onClick={() => { if (confirm("Obrisati blok sa svim sadržajem?")) persist(columns.filter((col) => col.id !== c.id)); }}><Trash2 /></Button></div>}
        <div className="flex min-w-0 flex-col" style={{ gap: c.gap }}>{c.elements.map((el, i) => <div key={el.id} className="min-w-0" style={{ padding: el.padding, marginTop: el.margin }}>
          {editMode && <div className="mb-2 flex items-center gap-1 text-foreground"><span className="mr-auto text-xs">{kinds.find((k) => k.type === el.type)?.label}</span><Button size="icon-xs" variant="outline" title="Pomjeri objekat gore" aria-label="Pomjeri objekat gore" disabled={i === 0} onClick={() => update(c.id, { elements: reorder(c.elements, i, -1) })}><ArrowUp /></Button><Button size="icon-xs" variant="outline" title="Pomjeri objekat dolje" aria-label="Pomjeri objekat dolje" disabled={i === c.elements.length - 1} onClick={() => update(c.id, { elements: reorder(c.elements, i, 1) })}><ArrowDown /></Button><Button size="icon-xs" variant="outline" title="Razmaci objekta" aria-label="Razmaci objekta" onClick={() => { setSelected({ column: c.id, element: el.id }); setPadding(el.padding); setMargin(el.margin); }}><Settings2 /></Button><Button size="icon-xs" variant="outline" title="Obriši objekat" aria-label="Obriši objekat" onClick={() => { if (confirm("Obrisati objekat?")) update(c.id, { elements: c.elements.filter((item) => item.id !== el.id) }); }}><Trash2 /></Button></div>}
          {el.type === "title" && <EditableText k={`element.${el.id}`} as="h2" className="break-words text-4xl font-semibold leading-tight" />}
          {el.type === "text" && <EditableText k={`element.${el.id}`} as="p" className="whitespace-pre-line break-words text-lg leading-relaxed" />}
          {el.type === "image" && <EditableImage k={`element.${el.id}`} alt="" />}
          {el.type === "gallery" && renderGallery(el.id)}
          {el.type === "button" && <BuilderButton id={el.id} />}
          {el.type === "social" && <BuilderSocialLinks id={el.id} />}
        </div>)}</div>
        {editMode && <div className="mt-4 flex flex-wrap gap-2">{kinds.map(({ type, label, icon: Icon }) => <Button key={type} variant="outline" size="sm" onClick={() => addElement(c, type)}><Icon />{label}</Button>)}</div>}
        {editMode && <Button variant="ghost" size="sm" className="mt-3" onClick={() => addColumn(newWidth, c.id)}><Plus />Dodaj blok pored</Button>}
      </div>)}
    </div>
    {editMode && <div className="mt-6 flex flex-wrap items-center gap-3 text-foreground"><Label htmlFor={`new-width-${id}`}>Širina novog bloka</Label><Select value={String(newWidth)} onValueChange={(v) => setNewWidth(Number(v) as Column["width"])}><SelectTrigger id={`new-width-${id}`} aria-label="Širina novog bloka" className="w-24 bg-background"><SelectValue /></SelectTrigger><SelectContent>{[25, 50, 75, 100].map((w) => <SelectItem key={w} value={String(w)}>{w}%</SelectItem>)}</SelectContent></Select><Button variant="outline" onClick={() => addColumn(newWidth)}><Plus />Dodaj unutrašnji blok</Button></div>}
    </fieldset>
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent><DialogHeader><DialogTitle>{selected?.element ? "Razmaci objekta" : "Razmaci bloka"}</DialogTitle></DialogHeader><NumberSetting label="Unutrašnji razmak" value={padding} onChange={setPadding} />{selected?.element ? <NumberSetting label="Margina iznad objekta" value={margin} onChange={setMargin} /> : <NumberSetting label="Razmak između objekata" value={gap} onChange={setGap} />}<DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Otkaži</Button><Button disabled={busy} onClick={async () => { if (!selected) return; setBusy(true); const next = columns.map((c) => c.id !== selected.column ? c : selected.element ? { ...c, elements: c.elements.map((el) => el.id === selected.element ? { ...el, padding, margin } : el) } : { ...c, padding, gap }); if (await persist(next)) setSelected(null); setBusy(false); }}>Sačuvaj</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}