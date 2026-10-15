import { useRef, useState, type ElementType, type CSSProperties } from "react";
import { toast } from "sonner";
import { ImageUp, Loader2 } from "lucide-react";
import { useSite } from "@/lib/site-content";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function EditableText({
  k,
  as: Tag = "span",
  className,
}: {
  k: string;
  as?: ElementType;
  className?: string;
}) {
  const { t, textFor, editMode, save, json } = useSite();
  const [open, setOpen] = useState(false);
  const [sr, setSr] = useState("");
  const [en, setEn] = useState("");
  const [saving, setSaving] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const [marginTop, setMarginTop] = useState(0);
  const [padding, setPadding] = useState(0);
  const appearance = json<{ fontSize?: number; marginTop?: number; padding?: number }>(`text-style:${k}`, {});

  const openEditor = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSr(textFor(k, "sr"));
    setEn(textFor(k, "en"));
    setFontSize(appearance.fontSize ?? 0);
    setMarginTop(appearance.marginTop ?? 0);
    setPadding(appearance.padding ?? 0);
    setOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await save({ [`t:${k}:sr`]: sr, [`t:${k}:en`]: en, [`text-style:${k}`]: JSON.stringify({ fontSize, marginTop, padding }) });
      toast.success("Sačuvano");
      setOpen(false);
    } catch (err) {
      toast.error("Greška pri čuvanju: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {t(k) || editMode ? (
        <Tag className={cn(className, appearance.fontSize && "builder-text-size", editMode && "editable-outline")} style={{ "--text-size": appearance.fontSize ? `${appearance.fontSize}px` : undefined, ...(appearance.marginTop !== undefined ? { marginTop: appearance.marginTop } : {}), ...(appearance.padding !== undefined ? { padding: appearance.padding } : {}) } as CSSProperties} onClick={openEditor}>
          {t(k) || <span className="opacity-50">✎ upiši tekst…</span>}
        </Tag>
      ) : null}
      {editMode && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Izmijeni tekst</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Crnogorski / srpski</Label>
                <Textarea rows={4} value={sr} onChange={(e) => setSr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>English</Label>
                <Textarea rows={4} value={en} onChange={(e) => setEn(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Label className="flex flex-col gap-2">Veličina slova (px, 0 = osnovna)<Input aria-label="Veličina slova" type="number" min={0} max={120} value={fontSize} onChange={(e) => setFontSize(Math.min(120, Math.max(0, Number(e.target.value))))} /></Label>
                <Label className="flex flex-col gap-2">Margina iznad (px)<Input type="number" min={0} max={240} value={marginTop} onChange={(e) => setMarginTop(Math.min(240, Math.max(0, Number(e.target.value))))} /></Label>
                <Label className="flex flex-col gap-2">Unutrašnji razmak (px)<Input type="number" min={0} max={120} value={padding} onChange={(e) => setPadding(Math.min(120, Math.max(0, Number(e.target.value))))} /></Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={onSave} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />} Sačuvaj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Slika se ne može obraditi");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function EditableImage({
  k,
  alt,
  className,
  wrapperClassName,
  buttonClassName,
  eager,
  compact,
  fallback,
}: {
  compact?: boolean;
  fallback?: string;
  k: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
  eager?: boolean;
}) {
  const { img, editMode, save } = useSite();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataUrl(file);
      await save({ [`img:${k}`]: url });
      toast.success("Slika promijenjena");
    } catch (err) {
      toast.error("Greška: " + (err as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={cn("relative min-w-0 max-w-full", wrapperClassName)}>
      {img(k) || fallback ? (
        <img src={img(k) || fallback} alt={alt} className={cn("builder-image", className)} loading={eager ? "eager" : "lazy"} />
      ) : (
        <div className={cn(className, "flex min-h-32 items-center justify-center bg-muted text-muted-foreground")}>
          {editMode ? "Dodaj sliku" : ""}
        </div>
      )}
      {editMode && (
        <>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); input.current?.click(); }}
            title="Promijeni sliku"
            className={cn(
              compact && "!-right-2 !-top-2 !p-1.5",
              "absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-edit px-4 py-2 text-sm font-medium text-edit-foreground shadow-lg",
              buttonClassName,
            )}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            {!compact && "Promijeni sliku"}
          </button>
        </>
      )}
    </div>
  );
}
