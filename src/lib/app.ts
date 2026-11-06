import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Profession = Database["public"]["Tables"]["professions"]["Row"];
export type Service = Database["public"]["Tables"]["provider_services"]["Row"];
export type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"];
export type RequestStatus = Database["public"]["Enums"]["request_status"];
export type ProviderStat = Database["public"]["Functions"]["provider_stats"]["Returns"][number];

export const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الشرقية", "الدقهلية", "الغربية",
  "المنوفية", "البحيرة", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية", "السويس",
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
  "البحر الأحمر", "مطروح", "شمال سيناء", "جنوب سيناء", "الوادي الجديد",
];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "مستني الرد",
  accepted: "مقبول",
  rejected: "مرفوض",
  completed: "خلص",
  cancelled: "اتلغى",
};

export const STATUS_CLASS: Record<RequestStatus, string> = {
  pending: "bg-warning/15 text-foreground",
  accepted: "bg-teal-soft text-accent-foreground",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-success/15 text-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export const DAYS = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

export function formatPrice(n: number | null | undefined) {
  if (n == null) return "—";
  return `${Number(n).toLocaleString("ar-EG")} ج.م`;
}

export function initials(name: string) {
  return (name || "؟").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
}

/** Notification links stored in the database point at legacy paths; map them to real pages. */
export function notificationTarget(link: string | null): "/dashboard" | "/messages" {
  return link && link.includes("messages") ? "/messages" : "/dashboard";
}
