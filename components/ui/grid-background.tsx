import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  className?: string;
};

export function GridBackground({ className }: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-sky-500/12 blur-3xl" />
      <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
    </div>
  );
}
