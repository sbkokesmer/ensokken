"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, products } from '@/lib/data';

interface FavoritesContextType {
  favorites: number[]; // Store Product IDs
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  favoriteCount: number;
  favoriteProducts: Product[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ensokken_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Favoriler yüklenirken hata oluştu", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ensokken_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite, 
      favoriteCount: favorites.length,
      favoriteProducts
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
