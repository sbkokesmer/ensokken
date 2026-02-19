"use client";

import { useCart } from "@/context/CartContext";
import { Check, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartNotification() {
  const { notification, closeNotification } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification.show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!notification.show && !isVisible) return null;

  const { item } = notification;
  if (!item) return null;

  // Renk isimlerini Felemenkçeye çeviren yardımcı fonksiyon
  const getDutchColorName = (color: string) => {
    const map: Record<string, string> = {
      'siyah': 'Zwart',
      'beyaz': 'Wit',
      'gri': 'Grijs',
      'bej': 'Beige',
      'haki': 'Kaki',
      'lacivert': 'Marineblauw',
      'kiremit': 'Terracotta',
      'yesil': 'Groen'
    };
    return map[color.toLowerCase()] || color;
  };

  return (
    <div 
      className={`
        fixed z-[100] 
        /* Mobile Positioning: Top center with padding */
        top-4 left-4 right-4 
        /* Desktop Positioning: Top right specific */
        md:top-24 md:right-6 md:left-auto md:w-full md:max-w-sm
        transform transition-all duration-500 ease-out
        ${notification.show 
          ? "translate-y-0 opacity-100" 
          : "-translate-y-4 opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-black/5 overflow-hidden backdrop-blur-xl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-[#f24f13] font-medium text-sm">
              <div className="w-5 h-5 rounded-full bg-[#f24f13]/10 flex items-center justify-center">
                <Check width={12} height={12} />
              </div>
              Toegevoegd aan Winkelwagen
            </div>
            <button 
              onClick={closeNotification}
              className="text-zinc-400 hover:text-black transition-colors p-1 -mr-1"
            >
              <X width={18} height={18} />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex gap-4">
            <div className="w-16 h-20 bg-[#f9f9f9] rounded-lg border border-black/5 flex-shrink-0 p-1">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-medium text-black text-sm truncate pr-2">{item.name}</h4>
              <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
                <span>{item.selectedSize}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                <span className="font-medium text-zinc-700">{getDutchColorName(item.selectedColor)}</span>
              </p>
              <p className="text-black font-medium text-sm mt-1.5">€{item.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
              onClick={closeNotification}
              className="w-full py-3 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
            >
              Verder Winkelen
            </button>
            <Link 
              href="/cart"
              onClick={closeNotification}
              className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-[#222] active:bg-[#333] transition-colors flex items-center justify-center gap-2"
            >
              Naar Winkelwagen <ShoppingBag width={14} height={14} />
            </Link>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-100">
            <div 
              className={`h-full bg-[#f24f13] transition-all duration-[4000ms] ease-linear ${notification.show ? 'w-0' : 'w-full'}`} 
              style={{ width: notification.show ? '0%' : '100%' }}
            ></div>
        </div>
      </div>
    </div>
  );
}
