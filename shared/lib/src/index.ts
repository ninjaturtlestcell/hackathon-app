import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./hooks/use-session";
export * from "./hooks/use-profile";
export * from "./hooks/use-role";

/**
 * Tailwind/NativeWind class'larini birlestirir ve cakisan utility'leri
 * dogru sekilde override eder (clsx + tailwind-merge). Web + mobile ortak.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
