import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, MapPin, Star, MessageCircle, Heart, Crown, Wrench, Phone } from "lucide-react";
import { workerPhoto } from "@/lib/worker-photos";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/use-session";
import { type Profile, type ProviderStat } from "@/lib/app";

function useFavoriteIds(userId: string | undefined) {
  return useQuery({
    queryKey: ["favorite-ids", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("provider_id").eq("customer_id", userId!);
      return new Set((data ?? []).map((f) => f.provider_id));
    },
  });
}

export function ProviderCard({ p, stat, professionName, top, minPrice }: { p: Profile; stat?: ProviderStat | undefined; professionName?: string | undefined; top?: boolean; minPrice?: number | undefined }) {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: favs } = useFavoriteIds(user?.id);
  const isFav = !!favs?.has(p.id);
  const [busy, setBusy] = useState(false);
  const reviews = stat?.review_count ?? 0;
  const isNew = Date.now() - new Date(p.created_at).getTime() < 30 * 864e5;
  const badge = top ? { t: "الأكثر تقييمًا", c: "bg-gold text-foreground", i: Crown } : p.is_verified ? { t: "موثّق", c: "bg-primary text-primary-foreground", i: BadgeCheck } : p.experience_years >= 5 ? { t: "محترف", c: "bg-primary text-primary-foreground", i: Wrench } : isNew ? { t: "جديد", c: "bg-teal text-teal-foreground", i: Star } : null;
  const digits = (p.phone ?? "").replace(/\D/g, "");
  const wa = digits ? (digits.startsWith("0") ? "2" + digits : digits) : "";

  async function toggleFav() {
    if (!user) { toast("سجّل دخولك الأول عشان تحفظ الحرفي"); navigate({ to: "/auth" }); return; }
    if (busy || user.id === p.id) return;
    setBusy(true);
    const { error } = isFav
      ? await supabase.from("favorites").delete().eq("customer_id", user.id).eq("provider_id", p.id)
      : await supabase.from("favorites").insert({ customer_id: user.id, provider_id: p.id });
    setBusy(false);
    if (error) { toast.error("ماقدرناش نحدث المفضلة"); return; }
    toast.success(isFav ? "اتشال من المفضلة" : "اتضاف للمفضلة");
    qc.invalidateQueries({ queryKey: ["favorite-ids"] });
    qc.invalidateQueries({ queryKey: ["favorite"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <article className="card-lift overflow-hidden rounded-2xl border bg-card p-2 shadow-soft">
      <div className="relative h-32 overflow-hidden rounded-xl bg-secondary">
        <Link to="/providers/$id" params={{ id: p.id }} className="block h-full w-full">
          <img src={p.avatar_url || workerPhoto(professionName, p.id)} alt={p.full_name} loading="lazy" className="h-full w-full object-cover object-top" />
        </Link>
        <button type="button" onClick={toggleFav} disabled={busy} aria-pressed={isFav} aria-label={isFav ? "شيل من المفضلة" : "أضف للمفضلة"} className="absolute top-2 start-2 grid size-8 place-items-center rounded-full bg-card text-destructive shadow-soft">
          <Heart className={`size-4 ${isFav ? "fill-destructive" : ""}`} />
        </button>
        {badge && <span className={`pointer-events-none absolute bottom-2 end-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${badge.c}`}><badge.i className="size-3" />{badge.t}</span>}
        {p.is_available && <span className="absolute bottom-2 start-2 size-3 rounded-full border-2 border-card bg-success" />}
      </div>
      <div className="space-y-1.5 px-2 pt-3 pb-1 text-sm">
        <Link to="/providers/$id" params={{ id: p.id }}><h3 className="truncate font-display text-base font-bold text-ink">{p.full_name}</h3></Link>
        <div className="flex items-center gap-1 text-muted-foreground"><Wrench className="size-3.5 text-primary" />{professionName ?? "مقدم خدمة"}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3.5 fill-gold text-gold" />{reviews > 0 ? `${Number(stat?.avg_rating).toFixed(1)} (${reviews} تقييم)` : "لسه بدون تقييمات"}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 text-destructive" />{[p.governorate, p.area].filter(Boolean).join(" - ") || "الموقع غير محدد"}</div>
        <div className="flex items-center justify-between text-xs font-semibold"><span className="text-muted-foreground">{p.experience_years} سنين خبرة</span>{minPrice !== undefined && <span className="text-primary" title="السعر النهائي بيختلف حسب تفاصيل الشغل">من {minPrice} ج.م</span>}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button className="mt-2 w-full rounded-full" size="sm"><MessageCircle className="size-3.5" />تواصل معه</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => navigate(user ? { to: "/messages", search: { peer: p.id } } : { to: "/auth" })}><MessageCircle className="size-4" />محادثة على سهلناها</DropdownMenuItem>
            {digits && <DropdownMenuItem asChild><a href={`tel:${p.phone}`}><Phone className="size-4" />اتصال: {p.phone}</a></DropdownMenuItem>}
            {wa && <DropdownMenuItem asChild><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />واتساب</a></DropdownMenuItem>}
            <DropdownMenuItem onClick={() => navigate({ to: "/providers/$id", params: { id: p.id } })}><Wrench className="size-4" />اطلب خدمة</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
