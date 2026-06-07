/**
 * Platformdan bagimsiz tasarim token'lari.
 * Hem web (Tailwind) hem mobile (NativeWind) bu tek kaynagi tuketir.
 * Renkler HSL kanal degerleri olarak tutulur ki shadcn'in `hsl(var(--x))`
 * yaklasimi ile birebir uyumlu olsun.
 */

export const palette = {
  light: {
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    card: "0 0% 100%",
    cardForeground: "240 10% 3.9%",
    primary: "240 5.9% 10%",
    primaryForeground: "0 0% 98%",
    secondary: "240 4.8% 95.9%",
    secondaryForeground: "240 5.9% 10%",
    muted: "240 4.8% 95.9%",
    mutedForeground: "240 3.8% 46.1%",
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 98%",
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "240 5.9% 10%",
  },
  dark: {
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",
    card: "240 10% 3.9%",
    cardForeground: "0 0% 98%",
    primary: "0 0% 98%",
    primaryForeground: "240 5.9% 10%",
    secondary: "240 3.7% 15.9%",
    secondaryForeground: "0 0% 98%",
    muted: "240 3.7% 15.9%",
    mutedForeground: "240 5% 64.9%",
    accent: "240 3.7% 15.9%",
    accentForeground: "0 0% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "0 0% 98%",
    border: "240 3.7% 15.9%",
    input: "240 3.7% 15.9%",
    ring: "240 4.9% 83.9%",
  },
} as const;

export const radius = {
  sm: "0.3rem",
  md: "0.5rem",
  lg: "0.75rem",
} as const;

/** Tailwind config'lerinde `colors` altinda kullanilacak HSL referans haritasi. */
export const tailwindColors = {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
} as const;
