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
useEffect(() => {
  const loadTheme = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "active_theme")
      .single();

    if (!error && data?.value && themes.find((t) => t.id === data.value)) {
      setActiveThemeId(data.value);
    }

    setIsHydrated(true);
  };

  void loadTheme();
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

  void supabase
    .from("site_settings")
    .upsert(
      {
        key: "active_theme",
        value: id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      }
    );
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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
