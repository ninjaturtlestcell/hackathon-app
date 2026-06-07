import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: { label: string; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  title,
  value,
  delta,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta ? (
          <p
            className={cn(
              "text-xs",
              delta.positive ? "text-emerald-600" : "text-destructive",
            )}
          >
            {delta.label}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
