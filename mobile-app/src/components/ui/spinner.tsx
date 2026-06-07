import { Loader } from "lucide-react-native";
import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/ui/icon";
import { cn } from "@shared/lib";

function Spinner({ className, size = 16 }: { className?: string; size?: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon
        as={Loader}
        size={size}
        className={cn("text-muted-foreground", className)}
      />
    </Animated.View>
  );
}

export { Spinner };
