import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, ArrowLeft, ShieldCheck, Star, Wrench, Map as MapIcon, Users, Briefcase, Smile, Headphones, CreditCard, Lightbulb, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProviderCard } from "@/components/ProviderCard";
import { GovernorateMap } from "@/components/GovernorateMap";
import { categoriesQuery, professionsQuery, providersQuery } from "@/lib/queries";
import { GOVERNORATES } from "@/lib/app";
import hero from "@/assets/hero-reference.jpg";
import promo from "@/assets/promo-phone.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "سهلناها — احتاجت صنايعي؟ سهلناها عليك" }, { name: "description", content: "ابحث عن الحرفيين الموثوقين في محافظتك، قارن بينهم وتواصل معهم بسهولة على سهلناها." }, { property: "og:title", content: "سهلناها — كل حرفة أقرب ليك" }, { property: "og:description", content: "صنايعية وخدمات قريبة منك في كل محافظات مصر." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:site_name", content: "سهلناها" }, { property: "og:image", content: "https://sahhlnaha-service-circle.lovable.app/og-image.png" }, { name: "twitter:image", content: "https://sahhlnaha-service-circle.lovable.app/og-image.png" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(categoriesQuery), context.queryClient.ensureQueryData(professionsQuery), context.queryClient.ensureQueryData(providersQuery)]),
  component: Home,
});

const ALL = "all";
function Home() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: professions } = useSuspenseQuery(professionsQuery);
  const { data } = useSuspenseQuery(providersQuery);
  const [q, setQ] = useState(""); const [prof, setProf] = useState(ALL); const [gov, setGov] = useState(ALL); const [area, setArea] = useState(ALL);
  const navigate = useNavigate();
  const areas = [...new Set(data.providers.filter((p) => p.governorate === gov && p.area).map((p) => p.area as string))];
  const top = [...data.providers].sort((a, b) => (Number(data.stats[b.id]?.avg_rating) || 0) - (Number(data.stats[a.id]?.avg_rating) || 0)).slice(0, 4);
  // Satisfaction = weighted average rating as a percentage of 5 stars, shown only once there are 10+ real reviews.
  const statList = Object.values(data.stats);
  const totalReviews = statList.reduce((s, x) => s + (x?.review_count ?? 0), 0);
  const satisfaction = totalReviews >= 10 ? Math.round((statList.reduce((s, x) => s + Number(x?.avg_rating ?? 0) * (x?.review_count ?? 0), 0) / totalReviews / 5) * 100) : null;
  const field = "flex flex-col gap-1 rounded-xl border bg-card px-3 py-1.5";
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden">
        <img src={hero} alt="حرفي سهلناها والقاهرة وراه" className="absolute inset-0 h-full w-full object-cover object-left" />
        <div className="absolute inset-y-0 start-2 hidden flex-col justify-center gap-3 min-[1440px]:flex">
          {[{ i: Users, n: `+${data.providers.length}`, t: "حرفي مسجل" }, { i: Briefcase, n: `+${professions.length}`, t: "مهنة مختلفة" }, ...(satisfaction !== null ? [{ i: Smile, n: `${satisfaction}%`, t: "رضا العملاء" }] : [])].map((s) => (
            <div key={s.t} className="flex items-center gap-2 rounded-xl bg-card/90 px-3 py-2 shadow-soft"><s.i className="size-6 text-primary" /><div><div className="font-display text-base font-extrabold text-ink">{s.n}</div><div className="text-[10px] text-muted-foreground">{s.t}</div></div></div>
          ))}
        </div>
        <div className="relative mx-auto flex min-h-[340px] max-w-6xl px-4 pt-10 pb-24 md:min-h-[420px] md:pt-14">
          <div className="max-w-xl fade-up">
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.15] md:text-6xl">
              <span className="block text-ink">إحتاجت صنايعي؟</span>
              <span className="relative mt-1 inline-block text-primary">
                سهلناها عليك!
                <svg viewBox="0 0 200 14" aria-hidden className="absolute -bottom-2 start-0 h-3.5 w-[72%] text-primary">
                  <path d="M3 3 C 60 0, 130 3, 197 8 L 196 11 C 130 7, 60 5, 4 11 Z" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 24 24" aria-hidden className="absolute -start-9 -top-2 size-7 -rotate-12 text-primary" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
                <svg viewBox="0 0 24 24" aria-hidden className="absolute -start-8 top-6 size-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M4 15 L8 8 M13 17 L16 10" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-9 text-ink-soft md:text-xl">ابحث عن الحرفيين الموثوقين في محافظتك،<br />قارن بينهم، وتواصل معهم بكل سهولة.</p>
          </div>
          <div className="ms-auto hidden -rotate-6 self-start text-center lg:block">
            <p className="font-hand text-3xl font-bold leading-snug text-hand">حرفيين محترفين<br />في كل مكان<br />وأحلى!</p>
            <svg viewBox="0 0 24 24" aria-hidden className="mx-auto mt-1 size-5 rotate-6 text-hand" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <form className="grid gap-3 rounded-2xl border bg-card p-3 shadow-lift md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); const pr = professions.find((x) => x.id === prof); navigate({ to: "/providers", search: { q: [q, area === ALL ? "" : area].filter(Boolean).join(" ") || undefined, gov: gov === ALL ? undefined : gov, profession: pr?.slug } }); }}>
          <div className="flex items-center gap-2 rounded-xl border px-3"><Search className="size-5 text-muted-foreground" /><Input aria-label="بحث" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الحرفي أو الخدمة..." className="h-12 border-0 shadow-none" /></div>
          <label className={field}><span className="flex items-center gap-1 text-xs font-semibold"><Wrench className="size-3.5 text-primary" />نوع الحرفة</span>
            <Select value={prof} onValueChange={setProf}><SelectTrigger className="h-7 border-0 px-0 shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>اختر الحرفة</SelectItem>{professions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)}</SelectContent></Select></label>
          <label className={field}><span className="flex items-center gap-1 text-xs font-semibold"><MapIcon className="size-3.5 text-primary" />المحافظة</span>
            <Select value={gov} onValueChange={(v) => { setGov(v); setArea(ALL); }}><SelectTrigger className="h-7 border-0 px-0 shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>اختر المحافظة</SelectItem>{GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></label>
          <label className={field}><span className="flex items-center gap-1 text-xs font-semibold"><MapPin className="size-3.5 text-primary" />المنطقة</span>
            <Select value={area} onValueChange={setArea} disabled={gov === ALL}><SelectTrigger className="h-7 border-0 px-0 shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>اختر المنطقة</SelectItem>{areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></label>
          <Button size="lg" className="h-14 gap-2 rounded-xl px-8 text-base" type="submit"><Search className="size-5" />ابحث الآن</Button>
        </form>
        {gov !== ALL && <div className="mt-4"><GovernorateMap governorate={gov} area={area === ALL ? undefined : area} /></div>}
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex gap-4 overflow-x-auto pb-3">
          {categories.map((c, i) => <Link key={c.id} to="/providers" search={{ category: c.slug }} className="flex min-w-20 flex-col items-center gap-2 text-center"><span className={`category-tone-${i % 5} grid size-14 place-items-center rounded-2xl`}><CategoryIcon name={c.icon} className="size-6" /></span><span className="text-sm font-semibold">{c.name_ar}</span></Link>)}
          <Link to="/providers" className="flex min-w-20 flex-col items-center gap-2"><span className="grid size-14 place-items-center rounded-2xl bg-secondary"><MoreHorizontal className="size-6 text-primary" /></span><span className="text-sm font-semibold">أخرى</span></Link>
          <Link to="/providers" className="ms-auto flex shrink-0 items-center gap-1 self-center text-sm font-semibold text-primary">كل الفئات<ArrowLeft className="size-4" /></Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink"><Star className="size-5 text-primary" />أشهر الحرفيين</h2><p className="mt-1 text-xs text-muted-foreground">نخبة من أفضل الحرفيين اللي واثق فيهم عملاءنا</p></div><Link to="/providers" className="flex items-center gap-1 text-sm font-semibold text-primary">عرض الكل<ArrowLeft className="size-4" /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{top.map((p, i) => <ProviderCard key={p.id} p={p} top={i === 0} stat={data.stats[p.id]} minPrice={data.minPrice[p.id]} professionName={professions.find((x) => x.id === p.profession_id)?.name_ar} />)}</div>
          {top.length === 0 && <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">لسه مفيش حرفيين مسجلين — كن أول واحد!</div>}
        </div>
        <aside className="self-start rounded-3xl bg-secondary p-5 text-center md:sticky md:top-20">
          <img src={promo} width={896} height={752} loading="lazy" alt="حرفي بيشاور على موبايل سهلناها" className="mx-auto w-48 rounded-2xl" />
          <h3 className="mt-4 font-display text-xl font-extrabold leading-snug text-ink">ابحث، قارن،<br />واختار الأنسب لك</h3>
          <p className="mt-2 text-sm text-muted-foreground">فلتر حسب الحرفة والمحافظة والتقييم وتلاقي الحرفي المثالي حسب احتياجاتك.</p>
          <Button asChild className="mt-4 w-full rounded-full"><Link to="/about"><Lightbulb className="size-4" />كيف يعمل؟</Link></Button>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-5 shadow-soft md:grid-cols-5">
          {[{ i: Star, t: "تقييمات حقيقية", s: "من عملاء فعليين" }, { i: MapPin, t: "مناسب لميزانيتك", s: "خيارات متعددة لكل الفئات" }, { i: CreditCard, t: "أسعار واضحة", s: "بدون مفاجآت" }, { i: Headphones, t: "دعم ومساعدة", s: "على مدار الساعة" }, { i: ShieldCheck, t: "حرفيين موثوقين", s: "تم التحقق من حساباتهم" }].map((x) => (
            <div key={x.t} className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary"><x.i className="size-5 text-primary" /></span><div><div className="text-sm font-bold text-ink">{x.t}</div><div className="text-[11px] text-muted-foreground">{x.s}</div></div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
