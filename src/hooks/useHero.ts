"use client";

import { useState, useEffect } from "react";

type CategoryImages = {
  necklaces: string | null;
  bracelets: string | null;
  earrings: string | null;
};

export function useHero() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<CategoryImages>({
    necklaces: null,
    bracelets: null,
    earrings: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchHero() {
      try {
        const res = await fetch("/api/hero", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setHeroImageUrl(data.heroImageUrl ?? null);
          setCategoryImages({
            necklaces: data.categoryImages?.necklaces ?? null,
            bracelets: data.categoryImages?.bracelets ?? null,
            earrings: data.categoryImages?.earrings ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setHeroImageUrl(null);
          setCategoryImages({ necklaces: null, bracelets: null, earrings: null });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHero();
    return () => {
      cancelled = true;
    };
  }, []);

  return { heroImageUrl, categoryImages, loading };
}
