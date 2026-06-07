export * from "./hooks/use-session";

/** Tailwind class'larini guvenle birlestirmek icin (web + mobile ortak). */
export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}
