"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    obsidian: string;
    ash: string;
    creme: string;
    pearl: string;
    primary: string;
    secondary: string;
  };
}

const themes: Theme[] = [
  {
    id: "classic-gold",
    name: "Classic Gold",
    description: "Warm creme and gold tones — the signature Shivora look.",
    colors: {
      background: "#F5F0E6",
      foreground: "#4b3c1e",
      obsidian: "#F5F0E6",
      ash: "#5b300b",
      creme: "#5f3612",
      pearl: "#2e260f",
      primary: "#e3b388",
      secondary: "#c1a97a",
    },
  },
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    description: "Deep, dark elegance with subtle gold accents.",
    colors: {
      background: "#0a0a0a",
      foreground: "#e8e8e8",
      obsidian: "#0a0a0a",
      ash: "#9a9a9a",
      creme: "#f0f0f0",
      pearl: "#d4d4d4",
      primary: "#c9a96e",
      secondary: "#8a7a5a",
    },
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    description: "Soft blush and rose-gold warmth for a romantic feel.",
    colors: {
      background: "#faf0ee",
      foreground: "#5c3a3a",
      obsidian: "#faf0ee",
      ash: "#8b5a5a",
      creme: "#6e4040",
      pearl: "#4a2a2a",
      primary: "#d4a5a5",
      secondary: "#c99585",
    },
  },
  {
    id: "silver-frost",
    name: "Silver Frost",
    description: "Cool platinum and silver for a modern, icy luxury.",
    colors: {
      background: "#f5f7fa",
      foreground: "#2c3e50",
      obsidian: "#f5f7fa",
      ash: "#5d6d7e",
      creme: "#34495e",
      pearl: "#1a252f",
      primary: "#a8c8dc",
      secondary: "#85929e",
    },
  },
  {
    id: "emerald-luxe",
    name: "Emerald Luxe",
    description: "Rich emerald greens paired with antique gold.",
    colors: {
      background: "#f0f4f0",
      foreground: "#1e3a2f",
      obsidian: "#f0f4f0",
      ash: "#4a7c59",
      creme: "#2d5a3d",
      pearl: "#1a3a28",
      primary: "#c9b896",
      secondary: "#8faa8f",
    },
  },
  {
    id: "royal-plum",
    name: "Royal Plum",
    description: "Deep purple and champagne for regal opulence.",
    colors: {
      background: "#f5f0f5",
      foreground: "#3a1e3a",
      obsidian: "#f5f0f5",
      ash: "#6b4c6b",
      creme: "#4a2a4a",
      pearl: "#2e1e2e",
      primary: "#c9a8c9",
      secondary: "#a080a0",
    },
  },
];

interface ThemeContextType {
  themes: Theme[];
  activeThemeId: string;
  previewThemeId: string | null;
  activeTheme: Theme;
  setPreviewThemeId: (id: string | null) => void;
  applyTheme: (id: string) => void;
  confirmPreview: () => void;
  cancelPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const supabase = createClient();

function applyCssVariables(colors: Theme["colors"]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--color-obsidian", colors.obsidian);
  root.style.setProperty("--color-ash", colors.ash);
  root.style.setProperty("--color-creme", colors.creme);
  root.style.setProperty("--color-pearl", colors.pearl);
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-secondary", colors.secondary);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState<string>(themes[0].id);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

// Load the global theme from Supabase
// Load and keep the global theme synced across all devices
useEffect(() => {
  const loadTheme = async (showInitialLoader = false) => {
  const startTime = Date.now();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "active_theme")
    .single();

  if (error) {
    console.error("Failed to load global theme:", error);
  }

  if (data?.value && themes.some((theme) => theme.id === data.value)) {
    setActiveThemeId(data.value);
  }

  if (showInitialLoader) {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 2000 - elapsed);

    window.setTimeout(() => {
      setIsHydrated(true);
    }, remainingTime);
  }
};

// Load immediately — loading screen stays for minimum 2 seconds
void loadTheme(true);
  // Check Supabase every 5 seconds for a theme change
  const interval = window.setInterval(() => {
    void loadTheme();
  }, 5000);

  // Also refresh immediately when someone returns to the tab
  const handleFocus = () => {
    void loadTheme();
  };

  window.addEventListener("focus", handleFocus);

  return () => {
    window.clearInterval(interval);
    window.removeEventListener("focus", handleFocus);
  };
}, []);

  const activeTheme = useMemo(
    () => themes.find((t) => t.id === activeThemeId) || themes[0],
    [activeThemeId]
  );

  const previewTheme = useMemo(
    () => (previewThemeId ? themes.find((t) => t.id === previewThemeId) || null : null),
    [previewThemeId]
  );

  // Apply CSS variables whenever active or preview changes
  useEffect(() => {
    if (!isHydrated) return;
    const themeToApply = previewTheme || activeTheme;
    applyCssVariables(themeToApply.colors);
  }, [activeTheme, previewTheme, isHydrated]);

const applyTheme = useCallback((id: string) => {
  setActiveThemeId(id);
  setPreviewThemeId(null);

  const saveTheme = async () => {
    const { error } = await supabase
      .from("site_settings")
      .update({
        value: id,
      })
      .eq("key", "active_theme");

    if (error) {
      console.error("Failed to save global theme:", error);
    } else {
      console.log("Global theme saved:", id);
    }
  };

  void saveTheme();
}, []);
  const confirmPreview = useCallback(() => {
    if (previewThemeId) {
      applyTheme(previewThemeId);
    }
  }, [previewThemeId, applyTheme]);

  const cancelPreview = useCallback(() => {
    setPreviewThemeId(null);
  }, []);

  const value = useMemo(
    () => ({
      themes,
      activeThemeId,
      previewThemeId,
      activeTheme,
      setPreviewThemeId,
      applyTheme,
      confirmPreview,
      cancelPreview,
    }),
    [activeThemeId, previewThemeId, activeTheme, applyTheme, confirmPreview, cancelPreview]
  );

 if (!isHydrated) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(180deg, #F8F1E7 0%, #F3E6D6 100%)",
      }}
    >
      <div className="flex flex-col items-center text-center">

        <div
          className="mb-5 text-3xl animate-pulse"
          style={{ color: "#C89B5B" }}
        >
          ✦
        </div>

        <h1
          className="font-serif text-4xl md:text-5xl tracking-[0.28em]"
          style={{ color: "#5A3215" }}
        >
          SHIVORA
        </h1>

        <p
          className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.35em]"
          style={{ color: "#8A6242" }}
        >
          Grace in Every Detail
        </p>

        <div className="mt-8 w-40 h-[2px] overflow-hidden bg-[#DCC8B3]">
          <div
            className="h-full w-1/2 shivora-loading-bar"
            style={{ backgroundColor: "#C89B5B" }}
          />
        </div>

      </div>
    </div>
  );
}

return (
  <ThemeContext.Provider value={value}>
    {children}
  </ThemeContext.Provider>
);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
