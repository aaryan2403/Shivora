"use client";

import { useEffect } from "react";
import { useShop } from "@/context/ShopContext";

/**
 * Empties the cart once payment is confirmed.
 *
 * The success page itself is a server component, so it can't touch the
 * localStorage-backed cart. This mounts inside it and does the cleanup.
 *
 * We remove the persisted key *as well as* calling clearCart(): the provider
 * hydrates the cart from localStorage in its own mount effect, and child
 * effects run before parent effects, so clearing state alone would be undone
 * by that restore. Dropping the key first makes the outcome independent of
 * effect ordering.
 */
export default function ClearCartOnSuccess({ paid }: { paid: boolean }) {
  const { clearCart } = useShop();

  useEffect(() => {
    if (!paid) return;
    try {
      localStorage.removeItem("shivora_cart");
    } catch {
      // Private-mode / storage-disabled browsers — clearing state still works.
    }
    clearCart();
  }, [paid, clearCart]);

  return null;
}
