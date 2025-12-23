"use client";

import { X, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Modal açıldığında body scroll'u kilitle
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      // Modal kapandığında scroll'u aç
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={`
          bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-black/20 
          border border-black/5 relative overflow-hidden
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
        `}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#eeebdf] to-transparent opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f24f13]/10 rounded-full blur-2xl"></div>

        <div className="relative p-8 text-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black hover:bg-black/5 rounded-full transition-colors"
          >
            <X width={20} height={20} />
          </button>

          {/* Icon */}
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-black/5 flex items-center justify-center mx-auto mb-6 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#eeebdf] to-white rounded-2xl opacity-50"></div>
            <CreditCard width={32} height={32} className="text-black relative z-10" />
            <div className="absolute -bottom-2 -right-2 bg-[#17a6a6] text-white p-1.5 rounded-full border-2 border-white">
              <ShieldCheck width={14} height={14} />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-black mb-3 tracking-tight">Betaalsysteem</h3>
          
          <div className="space-y-3 text-zinc-600 mb-8">
            <p>
              Dit project draait momenteel in <span className="font-semibold text-[#f24f13]">Demo Modus</span>.
            </p>
            <p className="text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              Er wordt geen echte betaling afgeschreven. Kaartgegevens worden niet gevraagd of opgeslagen.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-black text-white rounded-xl font-medium shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#222]"
            >
              Begrepen <ArrowRight width={16} height={16} />
            </button>
            <button 
              onClick={onClose}
              className="text-sm text-zinc-400 hover:text-black transition-colors py-2"
            >
              Sluiten en Verder Winkelen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
