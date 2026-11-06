import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/app";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

export function useMe() {
  const { user, ready } = useAuthUser();
  const q = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return { profile: null, isAdmin: false };
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      return {
        profile: profile as Profile | null,
        isAdmin: !!roles?.some((r) => r.role === "admin"),
      };
    },
  });
  return {
    user,
    ready: ready && (!user || !q.isLoading),
    profile: q.data?.profile ?? null,
    isAdmin: q.data?.isAdmin ?? false,
    refetch: q.refetch,
  };
}
