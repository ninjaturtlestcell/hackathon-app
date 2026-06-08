"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import i18n from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Detect and set user's preferred language on client side only
  useEffect(() => {
    const detectLanguage = () => {
      // Check localStorage first
      const stored = localStorage.getItem("i18nextLng");
      if (stored) {
        void i18n.changeLanguage(stored);
        return;
      }

      // Fall back to browser language
      const browserLang = navigator.language.split("-")[0];
      const supportedLngs = i18n.options.supportedLngs as string[];
      if (supportedLngs.includes(browserLang)) {
        void i18n.changeLanguage(browserLang);
      }
    };

    detectLanguage();

    // Save language changes to localStorage
    const handleLanguageChanged = (lng: string) => {
      localStorage.setItem("i18nextLng", lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
