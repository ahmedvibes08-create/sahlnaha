import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Star } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "عن المنصة | سهلناها" }, { name: "description", content: "سهلناها منصة بتوصلك بالحرفيين الموثوقين في محافظتك." }, { property: "og:title", content: "عن المنصة | سهلناها" }, { property: "og:description", content: "اعرف أكتر عن سهلناها." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl font-bold text-primary">عن سهلناها</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">سهلناها بتجمع الحرفيين والصنايعية في كل محافظات مصر في مكان واحد، علشان تلاقي الشخص المناسب، تقارن التقييمات، وتتواصل معاه بسهولة.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[{ i: ShieldCheck, t: "حرفيين موثوقين" }, { i: MapPin, t: "قريبين منك" }, { i: Star, t: "تقييمات حقيقية" }].map((x) => <div key={x.t} className="rounded-2xl border bg-card p-6 shadow-soft"><x.i className="size-8 text-primary" /><div className="mt-3 font-semibold">{x.t}</div></div>)}
      </div>
    </div>
  ),
});
