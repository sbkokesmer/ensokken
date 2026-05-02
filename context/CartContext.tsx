"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product, getPrimaryImage, getVariantId } from "@/lib/types";
import { calcShipping } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  variantId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, change: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  notification: { show: boolean; item: CartItem | null };
  closeNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "ensokken_cart";

function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; item: CartItem | null }>({
    show: false,
    item: null,
  });
  const lastUserRef = useRef<string | null>(null);

  useEffect(() => {
    setCart(readLocalCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalCart(cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const currentId = user?.id ?? null;
    if (lastUserRef.current === currentId) return;
    lastUserRef.current = currentId;

    if (!user) return;

    (async () => {
      const localCart = readLocalCart();
      const { data: dbItems } = await supabase
        .from("cart_items")
        .select("id, quantity, variant_id, product_variants(id, color_hex, color_name, size, products(id, name, price, product_images(url, is_primary)))")
        .eq("user_id", user.id);

      const dbCart: CartItem[] = (dbItems ?? []).flatMap((row: any) => {
        const v = row.product_variants;
        const p = v?.products;
        if (!v || !p) return [];
        const img = p.product_images?.find((i: any) => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? "";
        return [{
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: img,
          variantId: v.id,
          selectedSize: v.size,
          selectedColor: v.color_hex,
          quantity: row.quantity,
        }];
      });

      const merged = new Map<string, CartItem>();
      for (const item of dbCart) merged.set(item.variantId, item);
      for (const item of localCart) {
        const existing = merged.get(item.variantId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.set(item.variantId, item);
        }
      }

      const finalCart = Array.from(merged.values());
      setCart(finalCart);

      if (localCart.length) {
        const upserts = finalCart.map((item) => ({
          user_id: user.id,
          variant_id: item.variantId,
          product_id: item.id,
          quantity: item.quantity,
        }));
        await supabase.from("cart_items").upsert(upserts, { onConflict: "user_id,variant_id" });
      }
    })();
  }, [user, hydrated]);

  async function syncRemoveDb(variantId: string) {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("variant_id", variantId);
  }

  async function syncUpsertDb(item: CartItem) {
    if (!user) return;
    await supabase.from("cart_items").upsert(
      { user_id: user.id, variant_id: item.variantId, product_id: item.id, quantity: item.quantity },
      { onConflict: "user_id,variant_id" }
    );
  }

  const addToCart = (product: Product, size: string, color: string) => {
    const variantId = getVariantId(product, color, size) ?? `${product.id}-${size}-${color}`;
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: getPrimaryImage(product),
      variantId,
      selectedSize: size,
      selectedColor: color,
      quantity: 1,
    };

    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) => (i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        next = [...prev, newItem];
      }
      const updated = next.find((i) => i.variantId === variantId)!;
      syncUpsertDb(updated);
      return next;
    });

    setNotification({ show: true, item: newItem });
    setTimeout(() => setNotification((p) => ({ ...p, show: false })), 4000);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
    syncRemoveDb(variantId);
  };

  const updateQuantity = (variantId: string, change: number) => {
    setCart((prev) => {
      const target = prev.find((i) => i.variantId === variantId);
      if (!target) return prev;
      const newQty = target.quantity + change;
      if (newQty <= 0) {
        syncRemoveDb(variantId);
        return prev.filter((i) => i.variantId !== variantId);
      }
      const next = prev.map((i) => (i.variantId === variantId ? { ...i, quantity: newQty } : i));
      const updated = next.find((i) => i.variantId === variantId)!;
      syncUpsertDb(updated);
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  };

  const toggleSearch = () => setIsSearchOpen((v) => !v);
  const closeNotification = () => setNotification((p) => ({ ...p, show: false }));

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCost = calcShipping(subtotal);
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingCost,
        total,
        isSearchOpen,
        toggleSearch,
        notification,
        closeNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
