import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@shared/lib";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "border-border items-center justify-center gap-3 rounded-lg border border-dashed p-10",
        className,
      )}
    >
      {icon ? (
        <Icon as={icon} size={32} className="text-muted-foreground" />
      ) : null}
      <View className="items-center gap-1">
        <Text className="font-sans-medium text-sm text-foreground">{title}</Text>
        {description ? (
          <Text className="text-center font-sans text-sm text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export { EmptyState };
