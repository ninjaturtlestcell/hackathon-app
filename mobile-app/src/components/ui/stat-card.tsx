import type { LucideIcon } from "lucide-react-native";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@shared/lib";

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
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("w-44 gap-2 py-4", className)}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <Text className="font-sans-medium text-sm text-muted-foreground">
          {title}
        </Text>
        {icon ? (
          <Icon as={icon} size={16} className="text-muted-foreground" />
        ) : null}
      </CardHeader>
      <CardContent>
        <Text className="font-sans-bold text-2xl text-foreground">{value}</Text>
        {delta ? (
          <Text
            className={cn(
              "font-sans text-xs",
              delta.positive ? "text-emerald-600" : "text-destructive",
            )}
          >
            {delta.label}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
