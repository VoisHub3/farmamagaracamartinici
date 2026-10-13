import { useRef, useState, type ElementType } from "react";
import { toast } from "sonner";
import { ImageUp, Loader2 } from "lucide-react";
import { useSite } from "@/lib/site-content";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function EditableText({
  k,
  as: Tag = "span",
  className,
}: {
  k: string;
  as?: ElementType;
  className?: string;
}) {
  const { t, textFor, editMode, save } = useSite();
  const [open, setOpen] = useState(false);
  const [sr, setSr] = useState("");
  const [en, setEn] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditor = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSr(textFor(k, "sr"));
    setEn(textFor(k, "en"));
    setOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await save({ [`t:${k}:sr`]: sr, [`t:${k}:en`]: en });
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
      <Tag className={cn(className, editMode && "editable-outline")} onClick={openEditor}>
        {t(k)}
      </Tag>
      {editMode && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
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

async function fileToDataUrl(file: File, maxW = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function EditableImage({
  k,
  alt,
  className,
  wrapperClassName,
  eager,
}: {
  k: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
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
    <div className={cn("relative", wrapperClassName)}>
      <img src={img(k)} alt={alt} className={className} loading={eager ? "eager" : "lazy"} />
      {editMode && (
        <>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-edit px-4 py-2 text-sm font-medium text-edit-foreground shadow-lg"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            Promijeni sliku
          </button>
        </>
      )}
    </div>
  );
}
