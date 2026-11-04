import type { AccentTone } from "@/lib/session-types";

/** Prefixes a public/ path with the deploy base path (e.g. "/Youssef-Fathy-Guides" on GitHub Pages). */
export function withBasePath(src: string) {
  return src.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}` : src;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((part) => `${part}${part}`)
        .join("")
    : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getAccentClasses(tone: AccentTone) {
  const map = {
    blue: {
      badge: "border-sky-400/20 bg-sky-500/12 text-sky-800 dark:text-sky-200",
      border: "border-sky-400/18",
      dot: "bg-sky-400",
      gradient: "from-sky-400/25 via-sky-400/10 to-transparent",
    },
    purple: {
      badge: "border-violet-400/20 bg-violet-500/12 text-violet-800 dark:text-violet-200",
      border: "border-violet-400/18",
      dot: "bg-violet-400",
      gradient: "from-violet-400/25 via-violet-400/10 to-transparent",
    },
    green: {
      badge: "border-emerald-400/20 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
      border: "border-emerald-400/18",
      dot: "bg-emerald-400",
      gradient: "from-emerald-400/25 via-emerald-400/10 to-transparent",
    },
    amber: {
      badge: "border-amber-400/20 bg-amber-500/12 text-amber-800 dark:text-amber-200",
      border: "border-amber-400/18",
      dot: "bg-amber-400",
      gradient: "from-amber-400/25 via-amber-400/10 to-transparent",
    },
  } satisfies Record<
    AccentTone,
    {
      badge: string;
      border: string;
      dot: string;
      gradient: string;
    }
  >;

  return map[tone];
}
