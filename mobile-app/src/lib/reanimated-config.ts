import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

// Reanimated strict-mode uyarilarini kapat (or. "Writing to `value` during
// component render"). Hatalar/gercek uyarilar yine loglanir, strict gurultusu cikmaz.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
