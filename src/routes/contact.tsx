import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تواصل معنا | سهلناها" }, { name: "description", content: "ابعت لفريق سهلناها أي سؤال أو اقتراح." }, { property: "og:title", content: "تواصل معنا | سهلناها" }, { property: "og:description", content: "فريق سهلناها في خدمتك." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-4xl font-bold text-primary">تواصل معنا</h1>
      <p className="mt-2 text-muted-foreground">عندك سؤال أو اقتراح؟ اكتبلنا.</p>
      <form className="mt-6 space-y-3 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); toast.success("وصلتنا رسالتك، هنرد عليك قريب."); e.currentTarget.reset(); }}>
        <Input required placeholder="الاسم" /><Input required type="email" placeholder="الإيميل" /><Textarea required placeholder="رسالتك" rows={5} />
        <Button className="w-full">ابعت</Button>
      </form>
    </div>
  ),
});
