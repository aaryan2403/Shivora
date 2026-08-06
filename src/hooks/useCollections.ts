"use client";

import { useCallback, useEffect, useState } from "react";

export type Collection = {
  id: number;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections", { cache: "no-store" });
      const data = await res.json();
      setCollections(Array.isArray(data?.collections) ? data.collections : []);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { collections, loading, refetch: load };
}
