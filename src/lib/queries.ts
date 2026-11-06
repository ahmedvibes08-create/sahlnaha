import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Profession, Profile, ProviderStat } from "./app";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) throw error;
    return data as Category[];
  },
});

export const professionsQuery = queryOptions({
  queryKey: ["professions"],
  queryFn: async () => {
    const { data, error } = await supabase.from("professions").select("*").order("name_ar");
    if (error) throw error;
    return data as Profession[];
  },
});

export const providersQuery = queryOptions({
  queryKey: ["providers"],
  queryFn: async () => {
    const [{ data, error }, { data: stats }, { data: services }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "provider").eq("is_suspended", false),
      supabase.rpc("provider_stats"),
      supabase.from("provider_services").select("provider_id, price").eq("is_active", true),
    ]);
    if (error) throw error;
    const statMap: Record<string, ProviderStat> = {};
    (stats ?? []).forEach((s) => (statMap[s.provider_id] = s));
    const minPrice: Record<string, number> = {};
    (services ?? []).forEach((s) => {
      const p = Number(s.price);
      if (p > 0 && (minPrice[s.provider_id] === undefined || p < minPrice[s.provider_id]!)) minPrice[s.provider_id] = p;
    });
    return { providers: data as Profile[], stats: statMap, minPrice };
  },
});
