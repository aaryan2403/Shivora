"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type Product = { 
  id: number; 
  name: string; 
  category: string; 
  collection?: string;
  price: string; 
  image: string;
  isHighJewelry?: boolean;
};
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
  
  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, delta: number) => void;
  toggleWishlist: (product: Product) => void;
  login: (email: string) => void;
  logout: () => void;
  setSearchQuery: (query: string) => void;
  
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

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shivora_cart');
      const savedWishlist = localStorage.getItem('shivora_wishlist');
      const savedUser = localStorage.getItem('shivora_user');
      
      if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
      if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
      if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('shivora_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shivora_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) localStorage.setItem('shivora_user', JSON.stringify(user));
    else localStorage.removeItem('shivora_user');
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

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const login = (email: string) => {
    setUser({ name: email.split('@')[0], email });
    setIsAuthOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <ShopContext.Provider value={{
      cart, wishlist, user,
      isCartOpen, isWishlistOpen, isSearchOpen, isAuthOpen, searchQuery,
      addToCart, removeFromCart, updateCartQuantity, toggleWishlist,
      login, logout, setSearchQuery,
      setIsCartOpen, setIsWishlistOpen, setIsSearchOpen, setIsAuthOpen
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
};
