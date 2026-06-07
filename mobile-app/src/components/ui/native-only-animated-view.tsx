import * as React from "react";
import { Platform } from "react-native";
import Animated from "react-native-reanimated";

/**
 * Yalniz native'de animasyon uygulanmasi gereken view'lari sarar; web'de
 * cocuklari oldugu gibi render eder.
 */
function NativeOnlyAnimatedView(
  props: React.ComponentProps<typeof Animated.View> &
    React.RefAttributes<typeof Animated.View>,
) {
  if (Platform.OS === "web") {
    return <>{props.children as React.ReactNode}</>;
  }
  return <Animated.View {...props} />;
}

export { NativeOnlyAnimatedView };
