"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';

// Types
export type Product = {
  id: number;
  name: string;
  category: string;
  collection?: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  isHighJewelry?: boolean;
  stock?: number;
  color?: string;
};

export const ADMIN_EMAIL = "shivoraadmin@gmail.com";
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
  
  // UI Toggles
  setIsCartOpen: (v: boolean) => void;
  setIsWishlistOpen: (v: boolean) => void;
  setIsSearchOpen: (v: boolean) => void;
  setIsAuthOpen: (v: boolean) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

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

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shivora_cart');
      const savedWishlist = localStorage.getItem('shivora_wishlist');
      const savedUser = localStorage.getItem('shivora_user');
      
      if (savedCart) { try { const parsed = JSON.parse(savedCart); setCart(parsed); } catch (e) { console.error(e); } }
      if (savedWishlist) { try { const parsed = JSON.parse(savedWishlist); setWishlist(parsed); } catch (e) { console.error(e); } }
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          if (parsed.email === ADMIN_EMAIL) {
            fetch("/api/admin/verify-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: parsed.email }),
            }).catch(() => {});
          }
        } catch (e) { console.error(e); }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shivora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('shivora_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('shivora_user', JSON.stringify(user));
      else localStorage.removeItem('shivora_user');
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }, [user]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const login = async (email: string) => {
    setUser({ name: email.split('@')[0], email });
    setIsAuthOpen(false);
    if (email === ADMIN_EMAIL) {
      try {
        await fetch("/api/admin/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch {
        // silently fail — admin cookie not critical for client-side
      }
    }
  };

  const logout = async () => {
    setUser(null);
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

  const closeProductTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeProduct = () => {
    setIsProductModalOpen(false);
    if (closeProductTimeoutRef.current) clearTimeout(closeProductTimeoutRef.current);
    closeProductTimeoutRef.current = setTimeout(() => setSelectedProduct(null), 300); // wait for animation
  };

  const value = useMemo(() => ({
    cart, wishlist, user,
    isCartOpen, isWishlistOpen, isSearchOpen, isAuthOpen, searchQuery,
    selectedProduct, isProductModalOpen,
    addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist,
    login, logout, setSearchQuery, openProduct, closeProduct,
    setIsCartOpen, setIsWishlistOpen, setIsSearchOpen, setIsAuthOpen
  }), [cart, wishlist, user, isCartOpen, isWishlistOpen, isSearchOpen, isAuthOpen, searchQuery, selectedProduct, isProductModalOpen]);

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
};
