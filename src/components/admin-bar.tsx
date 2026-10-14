import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Loader2, LogOut, PencilLine, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSite } from "@/lib/site-content";
import { addAdminByEmail } from "@/lib/admin.functions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminBar() {
  const { isAdmin, editMode, setEditMode } = useSite();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  const onDoc = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = res.value;
      } else {
        text = await file.text();
      }
      text = text.trim();
      if (!text) throw new Error("Dokument je prazan");
      const { error } = await supabase
        .from("knowledge_base")
        .upsert({ id: 1, filename: file.name, content: text, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success(`Baza znanja ažurirana (${text.length.toLocaleString()} znakova)`);
    } catch (err) {
      toast.error("Greška: " + (err as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const onAddAdmin = async () => {
    setAdminBusy(true);
    try {
      const res = await addAdminByEmail({ data: { email: adminEmail } });
      toast.success(`${res.email} je sada admin`);
      setAdminOpen(false);
      setAdminEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdminBusy(false);
    }
  };

  const signOut = async () => {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm shadow-xl">
        <label className="flex items-center gap-2 font-medium">
          <PencilLine className="size-4 text-edit" />
          Uređivanje
          <Switch checked={editMode} onCheckedChange={setEditMode} />
        </label>
        <span className="h-5 w-px bg-border" />
        <input ref={input} type="file" accept=".docx,.txt,.md" hidden onChange={(e) => onDoc(e.target.files?.[0])} />
        <Button size="sm" variant="ghost" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <FileText />} Dokument za chatbot
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAdminOpen(true)}>
          <UserPlus /> Dodaj admina
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={signOut} aria-label="Odjava">
          <LogOut />
        </Button>
      </div>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj admina</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Unesite email osobe koja se već registrovala na stranici za prijavu. Dobiće iste administratorske
            mogućnosti kao vi.
          </p>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="ime@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={onAddAdmin} disabled={adminBusy || !adminEmail.trim()}>
              {adminBusy && <Loader2 className="animate-spin" />} Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
