import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const addAdminByEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = (data?.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Unesite ispravnu email adresu");
    }
    return { email };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    // Only existing admins may add another admin.
    const { data: isAdmin, error: roleErr } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw roleErr;
    if (!isAdmin) throw new Error("Samo admin može dodati drugog admina");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find the user by email (paginate through auth users).
    let target: { id: string; email?: string } | undefined;
    for (let page = 1; page <= 20 && !target; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      target = list.users.find((u) => u.email?.toLowerCase() === data.email);
      if (list.users.length < 200) break;
    }
    if (!target) {
      throw new Error("Nalog sa tom email adresom ne postoji. Osoba se prvo mora registrovati na stranici za prijavu.");
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw error;

    return { ok: true, email: data.email };
  });
