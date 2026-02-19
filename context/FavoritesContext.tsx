"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoriteCount: number;
  favoriteProducts: Product[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ensokken_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('ensokken_favorites', JSON.stringify(favorites));

    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)')
        .in('id', favorites)
        .eq('is_active', true);
      setFavoriteProducts((data as Product[]) ?? []);
    })();
  }, [favorites, isLoaded]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, favoriteCount: favorites.length, favoriteProducts }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
