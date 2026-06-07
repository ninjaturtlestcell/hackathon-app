import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./hooks/use-session";

/**
 * Tailwind/NativeWind class'larini birlestirir ve cakisan utility'leri
 * dogru sekilde override eder (clsx + tailwind-merge). Web + mobile ortak.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
