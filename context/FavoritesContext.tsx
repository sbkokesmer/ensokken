"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoriteCount: number;
  favoriteProducts: Product[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "ensokken_favorites";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const lastUserRef = useRef<string | null>(null);

  useEffect(() => {
    setFavorites(readLocal());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocal(favorites);
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const currentId = user?.id ?? null;
    if (lastUserRef.current === currentId) return;
    lastUserRef.current = currentId;

    if (!user) return;

    (async () => {
      const local = readLocal();
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      const dbIds = (data ?? []).map((r: any) => r.product_id as string);
      const merged = Array.from(new Set([...dbIds, ...local]));
      setFavorites(merged);

      const toInsert = local.filter((id) => !dbIds.includes(id));
      if (toInsert.length) {
        await supabase.from("favorites").upsert(
          toInsert.map((product_id) => ({ user_id: user.id, product_id })),
          { onConflict: "user_id,product_id" }
        );
      }
    })();
  }, [user, hydrated]);

  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }
    supabase
      .from("products")
      .select("*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)")
      .in("id", favorites)
      .then(({ data }) => setFavoriteProducts(data ?? []));
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const isAdding = !prev.includes(productId);
      const next = isAdding ? [...prev, productId] : prev.filter((id) => id !== productId);
      if (user) {
        if (isAdding) {
          supabase.from("favorites").upsert(
            { user_id: user.id, product_id: productId },
            { onConflict: "user_id,product_id" }
          ).then(() => {});
        } else {
          supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId).then(() => {});
        }
      }
      return next;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.length,
        favoriteProducts,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
