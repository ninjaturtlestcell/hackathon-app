import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@shared/lib";

export type Column<T> = {
  key: keyof T & string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Sade, generic tablo (mobil). Web'deki @tanstack DataTable'in mobil karsiligi —
 * kucuk veri setleri icin liste-tablo gosterimi.
 */
export function DataTable<T>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <View className="border-border w-full overflow-hidden rounded-md border">
      <View className="bg-muted flex-row px-3 py-2">
        {columns.map((c) => (
          <Text
            key={c.key}
            className={cn(
              "text-muted-foreground flex-1 font-sans-medium text-xs",
              c.className,
            )}
          >
            {c.header}
          </Text>
        ))}
      </View>
      {data.map((row, i) => (
        <View
          key={i}
          className="border-border flex-row items-center border-t px-3 py-3"
        >
          {columns.map((c) => (
            <View key={c.key} className={cn("flex-1", c.className)}>
              {c.render ? (
                c.render(row)
              ) : (
                <Text className="text-foreground font-sans text-sm">
                  {String(row[c.key])}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
