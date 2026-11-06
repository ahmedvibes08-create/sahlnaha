import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LayoutDashboard, LogOut, MessageCircle, Search, House, Heart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-session";
import { notificationTarget } from "@/lib/app";

function NotificationBell({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", userId],
    refetchInterval: 20000,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      return data ?? [];
    },
  });
  const unread = data.filter((n) => !n.is_read).length;
  return (
    <DropdownMenu
      onOpenChange={async (open) => {
        if (!open && unread) {
          await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
          qc.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -left-0.5 grid size-5 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">الإشعارات
          {unread > 0 && <button type="button" className="text-xs font-semibold text-primary" onClick={async () => { await supabase.from("notifications").update({ is_read: true }).eq("is_read", false); qc.invalidateQueries({ queryKey: ["notifications", userId] }); }}>تحديد الكل كمقروء</button>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">مفيش إشعارات لسه</div>
        )}
        {data.map((n) => (
          <DropdownMenuItem
            key={n.id}
            onClick={() => navigate({ to: notificationTarget(n.link) })}
            className="flex flex-col items-start gap-0.5"
          >
            <span className={n.is_read ? "" : "font-semibold"}>{n.title_ar}</span>
            {n.message_ar && (
              <span className="line-clamp-1 text-xs text-muted-foreground">{n.message_ar}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const { user, profile } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const navCls = "border-b-2 border-transparent px-3 py-5 font-medium text-foreground hover:text-primary";
  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <House className="size-9 text-primary" />
          <span className="leading-tight"><span className="block font-display text-2xl font-extrabold text-ink">سهلناها</span><span className="block text-[10px] font-semibold text-muted-foreground">كل حرفة أقرب ليك</span></span>
        </Link>
        <nav className="mx-auto hidden gap-4 text-sm md:flex">
          {([["/", "الرئيسية"], ["/providers", "الحرفيين"], ["/about", "عن المنصة"], ["/contact", "تواصل معنا"]] as const).map(([to, t]) => (
            <Link key={to} to={to} className={navCls} activeOptions={{ exact: to === "/" }} activeProps={{ className: "border-primary! text-primary!" }}>{t}</Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <Button variant="ghost" size="icon" asChild className="md:hidden" aria-label="بحث"><Link to="/providers"><Search className="size-5" /></Link></Button>
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild aria-label="الرسائل"><Link to="/messages"><MessageCircle className="size-5" /></Link></Button>
              <Button variant="ghost" size="icon" asChild aria-label="المفضلة"><Link to="/dashboard"><Heart className="size-5" /></Link></Button>
              <NotificationBell userId={user.id} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full"><UserRound className="size-4" /><span className="max-w-24 truncate">{profile?.full_name || "حسابي"}</span></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}><LayoutDashboard className="size-4" /> لوحة التحكم</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/messages" })}><MessageCircle className="size-4" /> الرسائل</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="size-4" /> خروج</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild className="rounded-lg"><Link to="/auth" search={{ mode: "signup" }}>إنشاء حساب</Link></Button>
              <Link to="/auth" className="hidden text-sm font-medium sm:block">تسجيل الدخول</Link>
              <Link to="/auth" aria-label="حسابي" className="grid size-9 place-items-center rounded-full bg-secondary text-primary"><UserRound className="size-5" /></Link>
              <span className="grid size-9 place-items-center rounded-full border bg-card" aria-hidden><Bell className="size-4" /></span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span className="font-display text-base text-primary">سهلناها — كل خدمة قريبة منك</span>
        <span>© {new Date().getFullYear()} سهلناها</span>
      </div>
    </footer>
  );
}
