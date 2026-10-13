import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultImages, defaultTexts, type Lang } from "./content-defaults";

export const contentQuery = queryOptions({
  queryKey: ["site_content"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("key,value");
    if (error) throw error;
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  },
});

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  textFor: (key: string, lang: Lang) => string;
  img: (key: string) => string;
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  save: (entries: Record<string, string>) => Promise<void>;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { data: content } = useSuspenseQuery(contentQuery);
  const qc = useQueryClient();
  const [lang, setLangState] = useState<Lang>("sr");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "sr") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setIsAdmin(false);
        setEditMode(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");
      setIsAdmin(!!roles?.length);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") check();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const textFor = useCallback(
    (key: string, l: Lang) => content[`t:${key}:${l}`] ?? defaultTexts[key]?.[l] ?? key,
    [content],
  );
  const t = useCallback((key: string) => textFor(key, lang), [textFor, lang]);
  const img = useCallback((key: string) => content[`img:${key}`] || defaultImages[key] || "", [content]);

  const save = async (entries: Record<string, string>) => {
    const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_content").upsert(rows);
    if (error) throw error;
    qc.setQueryData(contentQuery.queryKey, (old: Record<string, string> | undefined) => ({ ...old, ...entries }));
  };

  return (
    <SiteCtx.Provider
      value={{ lang, setLang, t, textFor, img, isAdmin, editMode: isAdmin && editMode, setEditMode, save, chatOpen, setChatOpen }}
    >
      {children}
    </SiteCtx.Provider>
  );
}

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside SiteProvider");
  return c;
}
