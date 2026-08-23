"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

// Types
export type Product = {
  id: number;
  name: string;
  category: string;
  collection?: string;
  material?: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  isHighJewelry?: boolean;
  stock?: number;
};

export const ADMIN_EMAIL = "shivorahelp06@gmail.com";
export type CartItem = Product & { quantity: number };

type User = {
  name: string;
  email: string;
};

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isAuthOpen: boolean;
  searchQuery: string;
  selectedProduct: Product | null;
  isProductModalOpen: boolean;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  login: (email: string) => void;
  logout: () => void;
  setSearchQuery: (query: string) => void;
  openProduct: (product: Product) => void;
  closeProduct: () => void;

  // Auth flow
  requestAuth: (redirectTo?: string) => void;

  // UI Toggles
  setIsCartOpen: (v: boolean) => void;
  setIsWishlistOpen: (v: boolean) => void;
  setIsSearchOpen: (v: boolean) => void;
  setIsAuthOpen: (v: boolean) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const AUTH_REDIRECT_KEY = "shivora_auth_redirect";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Product View State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Open auth and remember where the customer should go after a successful sign-in.
 const requestAuth = useCallback((redirectTo?: string) => {
  if (typeof window !== "undefined") {
    if (redirectTo) {
      sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectTo);
    } else {
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    }
  }

  setIsAuthOpen(true);
}, []);
  // After authentication succeeds, continue to the page that originally required login.
  const continueAfterAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const redirectTo = sessionStorage.getItem(AUTH_REDIRECT_KEY);

    if (redirectTo) {
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      setIsAuthOpen(false);
      window.location.assign(redirectTo);
    }
  }, []);

  // Load cart/wishlist from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shivora_cart");
      const savedWishlist = localStorage.getItem("shivora_wishlist");

      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      }

      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Sync user state with Supabase auth
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) {
        const name =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email?.split("@")[0] ||
          "User";

        const email = sbUser.email ?? "";

        setUser({ name, email });

        if (email === ADMIN_EMAIL) {
          fetch("/api/admin/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch(() => {});
        }

        continueAfterAuth();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;

        const name =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email?.split("@")[0] ||
          "User";

        const email = sbUser.email ?? "";

        setUser({ name, email });

        if (email === ADMIN_EMAIL) {
          fetch("/api/admin/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch(() => {});
        }

        continueAfterAuth();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [continueAfterAuth]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("shivora_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("shivora_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist]);

  const addToCart = (product: Product) => {
    if ((product.stock ?? 0) <= 0) {
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      // Product is already in cart — don't automatically increase it.
      if (exists) {
        return prev;
      }

      // New product always starts at quantity 1.
      return [...prev, { ...product, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = item.stock ?? 1;

          return {
            ...item,
            quantity: Math.min(maxStock, Math.max(1, item.quantity + delta)),
          };
        }

        return item;
      })
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [...prev, product];
    });
  };

  // Kept for compatibility with existing components.
  const login = async (_email: string) => {
    setIsAuthOpen(false);
  };

  const logout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();
    setUser(null);

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    }

    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      // ignore
    }
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeProduct = () => {
    setIsProductModalOpen(false);

    if (closeProductTimeoutRef.current) {
      clearTimeout(closeProductTimeoutRef.current);
    }

    closeProductTimeoutRef.current = setTimeout(
      () => setSelectedProduct(null),
      300
    );
  };

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      user,
      isCartOpen,
      isWishlistOpen,
      isSearchOpen,
      isAuthOpen,
      searchQuery,
      selectedProduct,
      isProductModalOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      login,
      logout,
      setSearchQuery,
      openProduct,
      closeProduct,
      requestAuth,
      setIsCartOpen,
      setIsWishlistOpen,
      setIsSearchOpen,
      setIsAuthOpen,
    }),
    [
      cart,
      wishlist,
      user,
      isCartOpen,
      isWishlistOpen,
      isSearchOpen,
      isAuthOpen,
      searchQuery,
      selectedProduct,
      isProductModalOpen,
      clearCart,
      requestAuth,
    ]
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }

  return context;
};
