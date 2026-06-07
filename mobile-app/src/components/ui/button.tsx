import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@shared/lib";

type Variant = "default" | "secondary" | "outline" | "destructive" | "ghost";
type Size = "default" | "sm" | "lg";

// Web'deki shadcn Button ile ayni variant isimleri -> zihinsel parite.
const container: Record<Variant, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
  outline: "border border-input bg-background",
  destructive: "bg-destructive",
  ghost: "bg-transparent",
};

const label: Record<Variant, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  destructive: "text-destructive-foreground",
  ghost: "text-foreground",
};

const sizes: Record<Size, string> = {
  default: "h-11 px-4",
  sm: "h-9 px-3",
  lg: "h-12 px-8",
};

export type ButtonProps = PressableProps & {
  title: string;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function Button({
  title,
  variant = "default",
  size = "default",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center rounded-md active:opacity-80",
        container[variant],
        sizes[size],
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <Text className={cn("text-sm font-sans-medium", label[variant])}>
        {title}
      </Text>
    </Pressable>
  );
}
