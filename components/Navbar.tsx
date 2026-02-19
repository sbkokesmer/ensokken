"use client";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Menu, X, ChevronRight, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { cartCount, toggleSearch } = useCart();
  const { favoriteCount } = useFavorites();
  const { user, openAuth, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Menü açıldığında scroll'u kilitle
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  // Sayfa değiştiğinde menüyü kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Collectie", href: "/collection" },
    { name: "Ons Verhaal", href: "/hikayemiz" },
    { name: "Contact", href: "/iletisim" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 border-b border-black/5 backdrop-blur-xl bg-[#eeebdf]/80 transition-all duration-300">
          <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 items-center justify-between">
              {/* 1. Logo (Sol) */}
              <Link href="/" className="flex items-center gap-2 group cursor-pointer focus:outline-none rounded-lg z-50 relative">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:bg-[#f24f13] transition-colors duration-300">
                      <span className="font-semibold text-[#eeebdf] tracking-tighter">E</span>
                  </div>
                  <span className="font-semibold text-lg tracking-tight text-black">Ensokken.</span>
              </Link>

              {/* 2. Orta Menü (Desktop - Mobilde Gizli) */}
              <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                  {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                          <Link 
                              key={link.name} 
                              href={link.href}
                              className={`text-sm font-medium transition-colors relative group py-2 ${isActive ? 'text-black' : 'text-zinc-600 hover:text-black'}`}
                          >
                              {link.name}
                              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-black transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                          </Link>
                      );
                  })}
              </nav>

              {/* 3. Sağ İkonlar ve Hamburger Menü */}
              <div className="flex items-center gap-1 sm:gap-3 z-50">
                  {/* Arama Butonu */}
                  <button onClick={toggleSearch} aria-label="Zoeken" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-600 hover:text-black">
                      <Search width={18} height={18} strokeWidth={2} />
                  </button>
                  
                  {/* Favoriler İkonu (Desktop) */}
                  <Link href="/favorites" className="relative group cursor-pointer hidden sm:block">
                      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-600 hover:text-black">
                          <Heart width={18} height={18} strokeWidth={2} />
                      </button>
                      <span className={`absolute top-0 right-0 w-3.5 h-3.5 bg-black rounded-full text-[9px] flex items-center justify-center text-white transition-opacity font-bold ${favoriteCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                          {favoriteCount}
                      </span>
                  </Link>

                  {/* Kullanıcı İkonu (Desktop) */}
                  <div className="relative hidden sm:block">
                    {user ? (
                      <>
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-600 hover:text-black"
                          aria-label="Account"
                        >
                          <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                            <span className="text-[#eeebdf] text-[10px] font-semibold uppercase">
                              {user.email?.[0] ?? "U"}
                            </span>
                          </div>
                        </button>
                        {userMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#eeebdf] border border-black/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                              <div className="px-4 py-3 border-b border-black/5">
                                <p className="text-xs font-medium text-black truncate">{user.email}</p>
                              </div>
                              <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-black/5 hover:text-black transition-colors">
                                <User width={14} height={14} />
                                Mijn account
                              </Link>
                              <button onClick={() => { setUserMenuOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-black/5 hover:text-black transition-colors border-t border-black/5">
                                <X width={14} height={14} />
                                Uitloggen
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => openAuth("login")}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-600 hover:text-black"
                        aria-label="Inloggen"
                      >
                        <User width={18} height={18} strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  {/* Sepet İkonu */}
                  <Link href="/cart" className="relative group cursor-pointer mr-1 sm:mr-0">
                      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-600 hover:text-black">
                          <ShoppingBag width={18} height={18} strokeWidth={2} />
                      </button>
                      <span className={`absolute top-0 right-0 w-3.5 h-3.5 bg-[#f24f13] rounded-full text-[9px] flex items-center justify-center text-white transition-opacity font-bold ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                          {cartCount}
                      </span>
                  </Link>

                  {/* Hamburger Menü Butonu (Sadece Mobilde Görünür) */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-md border border-black/10 hover:border-black/30 hover:bg-white transition-all text-black ml-1 active:scale-95"
                    aria-label="Menu openen"
                  >
                    <Menu width={16} height={16} strokeWidth={1.5} />
                  </button>
              </div>
          </div>
      </header>

      {/* Mobil Menü Backdrop (Arka Plan Karartma) */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobil Menü Drawer (Yan Panel) */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#eeebdf] z-[70] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden flex flex-col border-l border-black/5 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5">
            <span className="font-semibold text-base tracking-tight text-black">Ensokken.</span>
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-black/10 hover:bg-white transition-all text-black active:scale-95"
                aria-label="Menu sluiten"
            >
                <X width={16} height={16} strokeWidth={1.5} />
            </button>
        </div>

        {/* Menü Linkleri */}
        <nav className="flex flex-col p-6 gap-3 overflow-y-auto">
          {navLinks.map((link, index) => (
            <Link 
              key={link.name}
              href={link.href}
              className="flex items-center justify-between text-sm font-medium text-zinc-800 py-2 group"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.name}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#f24f13] group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
            </Link>
          ))}
          
          <div className="h-px bg-black/5 my-2"></div>

          {/* Auth (Mobil) */}
          {user ? (
            <div className="flex flex-col gap-2 py-2">
              <Link href="/account" className="flex items-center justify-between text-sm font-medium text-zinc-800 py-2 group">
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <span className="text-[#eeebdf] text-[10px] font-semibold uppercase">{user.email?.[0] ?? "U"}</span>
                  </div>
                  Mijn account
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#f24f13] group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
              </Link>
              <button onClick={() => signOut()} className="flex items-center justify-between text-sm font-medium text-zinc-500 py-2 hover:text-black transition-colors w-full">
                Uitloggen
                <X width={14} height={14} className="text-zinc-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsMobileMenuOpen(false); openAuth("login"); }}
              className="flex items-center justify-between text-sm font-medium text-zinc-800 py-2 group w-full mt-1"
            >
              <span className="flex items-center gap-2">
                <User width={15} height={15} className="text-zinc-500" />
                Inloggen / Registreren
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#f24f13] group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
            </button>
          )}

          <div className="h-px bg-black/5 my-2"></div>

          {/* Favoriler İkonu (Sadece İkon) */}
          <div className="py-2">
            <Link
                href="/favorites"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-black/5 text-zinc-600 hover:text-[#f24f13] hover:border-[#f24f13]/20 transition-all"
                aria-label="Favorieten"
              >
                <Heart width={18} height={18} strokeWidth={1.5} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full border-2 border-[#eeebdf]">
                    {favoriteCount}
                  </span>
                )}
            </Link>
          </div>
        </nav>

        {/* Alt Bilgi */}
        <div className="mt-auto p-6 bg-black/5">
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-4 font-bold">Sociale Media</p>
          <div className="flex gap-2 flex-wrap">
            {['Instagram', 'Twitter', 'Youtube'].map((social) => (
                <div key={social} className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[10px] font-medium text-zinc-600 hover:bg-black hover:text-white hover:border-black transition-colors cursor-pointer shadow-sm">
                    {social}
                </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
