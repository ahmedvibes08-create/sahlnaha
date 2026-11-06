import { icons, Sparkles, type LucideProps } from "lucide-react";

export function CategoryIcon({ name, ...props }: { name: string | null | undefined } & LucideProps) {
  const Icon = (name && (icons as Record<string, typeof Sparkles>)[name]) || Sparkles;
  return <Icon {...props} />;
}
