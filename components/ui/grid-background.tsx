import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  className?: string;
};

/* One soft green glow at the top; kept quiet so content stays the focus. */
export function GridBackground({ className }: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute left-1/2 top-[-14rem] h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />
    </div>
  );
}
