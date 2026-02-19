"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/data';

export interface CartItem extends Product {
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
  cartCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  // Notification State
  notification: { show: boolean; item: CartItem | null };
  closeNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; item: CartItem | null }>({
    show: false,
    item: null
  });

  const addToCart = (product: Product, size: string, color: string) => {
    const variantId = `${product.id}-${size}-${color}`;
    
    const newItem: CartItem = { 
      ...product, 
      variantId, 
      selectedSize: size, 
      selectedColor: color, 
      quantity: 1 
    };

    setCart(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item => 
          item.variantId === variantId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });

    // Trigger Notification
    setNotification({ show: true, item: newItem });
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.priceValue * item.quantity), 0);
  
  // Shipping Logic: Free above 1000 TL
  const shippingCost = subtotal >= 1000 || subtotal === 0 ? 0 : 49.90;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartCount,
      subtotal,
      shippingCost,
      total,
      isSearchOpen,
      toggleSearch,
      notification,
      closeNotification
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
