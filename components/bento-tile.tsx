"use client";

import { cn } from "@/lib/utils";

interface BentoTileProps {
  title: string;
  subtitle?: string;
  colSpan?: number;
  rowSpan?: number;
  children: React.ReactNode;
  className?: string;
}

export function BentoTile({
  title,
  subtitle,
  colSpan = 1,
  rowSpan = 1,
  children,
  className,
}: BentoTileProps) {
  const spanClasses = [
    "",
    "",
    "md:col-span-2",
    "md:col-span-2 lg:col-span-3",
    "md:col-span-2 lg:col-span-4",
  ];
  const rowClasses = ["", "", "row-span-2", "row-span-3"];

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 flex flex-col gap-3 overflow-hidden",
        spanClasses[colSpan] || "",
        rowClasses[rowSpan] || "",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-2 shrink-0">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
