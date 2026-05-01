"use client";

import { motion } from "framer-motion";
import { Palette, Eye, Check, X, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemePanel() {
  const {
    themes,
    activeThemeId,
    previewThemeId,
    activeTheme,
    setPreviewThemeId,
    confirmPreview,
    cancelPreview,
  } = useTheme();

  const isPreviewing = previewThemeId !== null;
  const currentDisplayId = previewThemeId || activeThemeId;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Palette size={14} className="text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg tracking-wide">Theme Studio</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ash">
              Preview and apply global color themes
            </p>
          </div>
        </div>

        {isPreviewing && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
              <Sparkles size={12} />
              Previewing {themes.find((t) => t.id === previewThemeId)?.name}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirmPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-500/30 transition-colors"
            >
              <Check size={11} />
              Apply
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] uppercase tracking-[0.15em] hover:bg-red-500/30 transition-colors"
            >
              <X size={11} />
              Cancel
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {themes.map((theme) => {
          const isActive = activeThemeId === theme.id && !isPreviewing;
          const isCurrent = currentDisplayId === theme.id;

          return (
            <motion.div
              key={theme.id}
              whileHover={{ y: -2 }}
              className={`relative border rounded-sm overflow-hidden transition-colors duration-300 cursor-pointer ${
                isCurrent
                  ? "border-primary shadow-[0_0_0_1px_rgba(227,179,136,0.3)]"
                  : "border-ash/10 hover:border-ash/30"
              }`}
              onClick={() => setPreviewThemeId(theme.id)}
            >
              {/* Color Strip */}
              <div className="flex h-16">
                <div className="flex-1" style={{ backgroundColor: theme.colors.background }} />
                <div className="flex-1" style={{ backgroundColor: theme.colors.primary }} />
                <div className="flex-1" style={{ backgroundColor: theme.colors.creme }} />
                <div className="flex-1" style={{ backgroundColor: theme.colors.ash }} />
                <div className="flex-1" style={{ backgroundColor: theme.colors.pearl }} />
              </div>

              <div className="p-4 bg-obsidian/30">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-serif text-sm">{theme.name}</h3>
                  {isActive && (
                    <span className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5">
                      Active
                    </span>
                  )}
                  {isPreviewing && isCurrent && !isActive && (
                    <span className="text-[9px] uppercase tracking-wider text-amber-300 bg-amber-500/10 px-1.5 py-0.5">
                      Preview
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-ash leading-relaxed">{theme.description}</p>
              </div>

              {/* Hover overlay with preview button */}
              <div className="absolute inset-0 bg-obsidian/80 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-creme">
                  <Eye size={14} />
                  <span>Preview Theme</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mini preview info */}
      <div className="mt-6 p-5 border border-ash/10 bg-obsidian/20 rounded-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={13} className="text-primary" />
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-primary">Current Palette</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(activeTheme.colors).map(([key, value]) => {
            const labelMap: Record<string, { label: string; hint: string }> = {
              background: { label: "Page Background", hint: "Main page backdrop" },
              foreground: { label: "Body Text", hint: "Default paragraph text" },
              obsidian: { label: "Surface / Cards", hint: "Panels, cards, navbars" },
              ash: { label: "Borders / Muted", hint: "Dividers, secondary text" },
              creme: { label: "Headings / Buttons", hint: "Titles, primary actions" },
              pearl: { label: "Deep Text", hint: "Strong emphasis text" },
              primary: { label: "Accent / CTA", hint: "Highlights, call-to-action" },
              secondary: { label: "Soft Accent", hint: "Subtle highlights" },
            };
            const info = labelMap[key] || { label: key, hint: "" };
            const textColor =
              key === "background" || key === "obsidian"
                ? activeTheme.colors.creme
                : key === "primary" || key === "secondary"
                ? activeTheme.colors.pearl
                : activeTheme.colors.background;

            return (
              <div
                key={key}
                className="rounded-sm overflow-hidden border border-white/5 shadow-sm"
              >
                <div
                  className="h-14 w-full flex items-end justify-end p-2"
                  style={{ backgroundColor: value }}
                >
                  <span
                    className="text-[9px] font-mono opacity-70"
                    style={{ color: textColor }}
                  >
                    {value}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian/40">
                  <p className="text-[10px] font-medium text-creme leading-tight">{info.label}</p>
                  <p className="text-[9px] text-ash/60 mt-0.5 leading-tight">{info.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
