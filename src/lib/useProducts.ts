"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/context/ShopContext";

type ProductsResponse = {
  products: Product[];
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load products (${res.status})`);
      }

      const data = (await res.json()) as ProductsResponse;
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, loading, error, refetch: load };
}
