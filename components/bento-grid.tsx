"use client";

import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full max-w-[1600px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
