import plumber from "@/assets/worker-plumber.png.asset.json";
import electrician from "@/assets/worker-electrician.png.asset.json";
import painter from "@/assets/worker-painter.png.asset.json";
import carpenter from "@/assets/worker-carpenter.png.asset.json";

const ALL = [plumber.url, electrician.url, painter.url, carpenter.url];

export function workerPhoto(professionName: string | undefined, id: string): string {
  const n = professionName ?? "";
  if (/سباك|سباكة/.test(n)) return plumber.url;
  if (/كهرب/.test(n)) return electrician.url;
  if (/نقاش|دهان|بويه/.test(n)) return painter.url;
  if (/نجار/.test(n)) return carpenter.url;
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ALL[h % ALL.length] ?? plumber.url;
}
