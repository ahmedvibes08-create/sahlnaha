import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GovernorateMap } from "@/components/GovernorateMap";
import { professionsQuery } from "@/lib/queries";
import { GOVERNORATES } from "@/lib/app";

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => z.object({ mode: z.enum(["signin", "signup"]).optional() }).parse(s),
  head: () => ({ meta: [{ title: "دخول أو حساب جديد | سهلناها" }, { name: "description", content: "ادخل أو اعمل حساب على سهلناها." }, { property: "og:title", content: "دخول | سهلناها" }, { property: "og:description", content: "ادخل أو اعمل حساب على سهلناها." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const [signup, setSignup] = useState(mode === "signup");
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", profession: "", experience: "", governorate: "", area: "", bio: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { data: professions = [] } = useQuery(professionsQuery);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (signup && role === "provider" && (!f.profession || !f.governorate)) { toast.error("اختار نوع الخدمة والمحافظة"); return; }
    setBusy(true);
    if (signup) {
      const data: Record<string, string> = { full_name: f.name, role, phone: f.phone, governorate: f.governorate, area: f.area };
      if (role === "provider") Object.assign(data, { profession_id: f.profession, experience_years: f.experience || "0", bio: f.bio });
      const { error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { emailRedirectTo: window.location.origin, data } });
      if (error) toast.error(error.message); else toast.success("اتأكد من إيميلك علشان تفعّل الحساب.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) toast.error("الإيميل أو الباسورد غلط"); else navigate({ to: "/dashboard" });
    }
    setBusy(false);
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <h1 className="text-2xl font-bold">{signup ? "إنشاء حساب" : "تسجيل الدخول"}</h1>
        {signup && (
          <>
            <div className="text-sm font-medium">إنت هنا علشان إيه؟</div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={role === "customer" ? "default" : "outline"} onClick={() => setRole("customer")}>محتاج خدمة</Button>
              <Button type="button" variant={role === "provider" ? "default" : "outline"} onClick={() => setRole("provider")}>أنا حرفي</Button>
            </div>
            <Input required placeholder="الاسم" value={f.name} onChange={set("name")} />
            <Input required={role === "provider"} type="tel" inputMode="tel" pattern="[0-9+ ]{8,15}" placeholder="رقم الموبايل" value={f.phone} onChange={set("phone")} />
            {role === "provider" && (
              <>
                <Select value={f.profession} onValueChange={(v) => setF({ ...f, profession: v })}><SelectTrigger><SelectValue placeholder="نوع الخدمة" /></SelectTrigger><SelectContent>{professions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)}</SelectContent></Select>
                <Input required type="number" min={0} max={60} placeholder="سنين الخبرة" value={f.experience} onChange={set("experience")} />
                <Textarea placeholder="اكتب نبذة عن خبرتك وشغلك" maxLength={1000} value={f.bio} onChange={set("bio")} />
              </>
            )}
            <Select value={f.governorate} onValueChange={(v) => setF({ ...f, governorate: v })}><SelectTrigger><SelectValue placeholder="المحافظة" /></SelectTrigger><SelectContent>{GOVERNORATES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="المنطقة (مثلاً: مدينة نصر)" value={f.area} onChange={set("area")} />
            {f.governorate && <GovernorateMap governorate={f.governorate} area={f.area || undefined} />}
          </>
        )}
        <Input required type="email" placeholder="الإيميل" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input required type="password" minLength={6} placeholder="الباسورد" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Button disabled={busy} className="w-full">{signup ? "اعمل الحساب" : "ادخل"}</Button>
        {!signup && <button type="button" className="w-full text-sm text-primary" onClick={async () => { if (!f.email) { toast.error("اكتب إيميلك الأول"); return; } const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) toast.error("حصلت مشكلة، جرّب تاني"); else toast.success("بعتنالك لينك تغيير الباسورد على إيميلك"); }}>نسيت الباسورد؟</button>}
        <button type="button" className="w-full text-sm text-teal" onClick={() => setSignup(!signup)}>
          {signup ? "عندك حساب؟ ادخل" : "معندكش حساب؟ اعمل واحد"}
        </button>
      </form>
    </div>
  );
}
