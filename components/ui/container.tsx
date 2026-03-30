import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

export function Container<T extends ElementType = "div">({
  as,
  className,
  children,
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </Component>
  );
}
