import { MapPin } from "lucide-react";

export function GovernorateMap({ governorate, area }: { governorate: string; area?: string | undefined }) {
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const q = encodeURIComponent([area, governorate, "مصر"].filter(Boolean).join("، "));
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="flex items-center gap-2 border-b px-4 py-2 text-sm font-semibold">
        <MapPin className="size-4 text-primary" /> {area ? `${area} — ${governorate}` : governorate}
      </div>
      {key ? (
        <iframe
          title={`خريطة ${governorate}`}
          className="h-64 w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}&language=ar&region=EG`}
        />
      ) : (
        <div className="grid h-64 place-items-center text-sm text-muted-foreground">الخريطة مش متاحة دلوقتي</div>
      )}
    </div>
  );
}
