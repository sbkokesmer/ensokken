"use client";

import { useState } from "react";
import { products } from "@/lib/data";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function CollectionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Aanbevolen");
  
  const { isFavorite, toggleFavorite } = useFavorites();

  // Pagination Logic
  const itemsPerPage = 20;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                  <SlidersHorizontal width={16} height={16} /> Filters
                </h2>
                <button className="text-xs text-zinc-500 hover:text-black underline">Wissen</button>
            </div>
            
            {/* Categories */}
            <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer group">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Categorie</p>
                    <ChevronDown width={14} height={14} className="text-zinc-400 group-hover:text-black transition-colors" />
                </div>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                            <Check className="hidden peer-checked:block text-white" width={10} height={10} />
                        </div>
                        <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">Alle Sokken</span>
                        <span className="ml-auto text-xs text-zinc-400">40</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                            <Check className="hidden peer-checked:block text-white" width={10} height={10} />
                        </div>
                        <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">Heren</span>
                        <span className="ml-auto text-xs text-zinc-400">18</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                            <Check className="hidden peer-checked:block text-white" width={10} height={10} />
                        </div>
                        <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">Dames</span>
                        <span className="ml-auto text-xs text-zinc-400">22</span>
                    </label>
                </div>
            </div>

            {/* Colors Filter */}
            <div className="space-y-4 pt-4 border-t border-black/5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kleur</p>
                <div className="flex flex-wrap gap-3">
                    <button className="w-6 h-6 rounded-full bg-black border border-black/10 ring-2 ring-transparent hover:ring-black/20 focus:ring-black/40 transition-all" title="Zwart"></button>
                    <button className="w-6 h-6 rounded-full bg-white border border-zinc-200 ring-2 ring-transparent hover:ring-black/20 focus:ring-black/40 transition-all" title="Wit"></button>
                    <button className="w-6 h-6 rounded-full bg-[#f24f13] border border-black/5 ring-2 ring-transparent hover:ring-black/20 focus:ring-black/40 transition-all" title="Oranje"></button>
                    <button className="w-6 h-6 rounded-full bg-[#17a6a6] border border-black/5 ring-2 ring-transparent hover:ring-black/20 focus:ring-black/40 transition-all" title="Turkoois"></button>
                    <button className="w-6 h-6 rounded-full bg-zinc-500 border border-black/5 ring-2 ring-transparent hover:ring-black/20 focus:ring-black/40 transition-all" title="Grijs"></button>
                </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-4 pt-4 border-t border-black/5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Maat</p>
                <div className="grid grid-cols-3 gap-2">
                    <button className="px-2 py-1.5 rounded-lg border border-black/5 bg-white text-xs font-medium hover:border-black transition-colors">36-39</button>
                    <button className="px-2 py-1.5 rounded-lg border border-black/5 bg-white text-xs font-medium hover:border-black transition-colors">40-43</button>
                    <button className="px-2 py-1.5 rounded-lg border border-black/5 bg-white text-xs font-medium hover:border-black transition-colors">44-46</button>
                </div>
            </div>

             {/* Price Filter */}
             <div className="space-y-4 pt-4 border-t border-black/5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Prijs</p>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                            <Check className="hidden peer-checked:block text-white" width={10} height={10} />
                        </div>
                        <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">€0 - €20</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                            <Check className="hidden peer-checked:block text-white" width={10} height={10} />
                        </div>
                        <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">€20+</span>
                    </label>
                </div>
            </div>
        </aside>

        {/* Main Grid Area */}
        <div className="flex-1">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-black/5 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-black tracking-tight">Collectie</h1>
                    <span className="text-sm text-zinc-500 mt-1 block">Totaal {products.length} Producten</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500">Sorteren:</span>
                    <div className="relative z-20">
                        <button 
                          onClick={() => setSortOpen(!sortOpen)} 
                          onBlur={() => setTimeout(() => setSortOpen(false), 200)}
                          className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-black/5 hover:border-black/20 transition-colors shadow-sm focus:outline-none focus:border-black/30 w-48 justify-between"
                        >
                            <span>{currentSort}</span> 
                            <ChevronDown width={14} height={14} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {sortOpen && (
                          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-black/5 shadow-xl p-1.5 flex flex-col gap-0.5 z-30 animate-in fade-in zoom-in-95 duration-200">
                              {['Aanbevolen', 'Nieuwste', 'Prijs: Laag naar Hoog', 'Prijs: Hoog naar Laag'].map((sort) => (
                                <button 
                                  key={sort}
                                  onClick={() => { setCurrentSort(sort); setSortOpen(false); }}
                                  className="text-left px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                                >
                                  {sort}
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
                {currentProducts.map((product) => {
                  const isFav = isFavorite(product.id);
                  return (
                    <div key={product.id} className="group flex flex-col h-full relative">
                      {/* Favorite Button Overlay */}
                      <button 
                        onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                          <Heart width={16} height={16} className={isFav ? "fill-[#f24f13] text-[#f24f13]" : "text-zinc-400"} />
                      </button>

                      <Link href={`/product/${product.id}`} className="cursor-pointer flex flex-col h-full">
                        <div className="aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-black/5 relative mb-3 hover:border-black/20 transition-all duration-300">
                          {product.badge && (
                            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase tracking-wide">
                              {product.badge}
                            </span>
                          )}
                          <img 
                            src={product.image} 
                            alt={product.name}
                            loading="lazy" 
                            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1.5 mt-2">
                            {product.colors.map((c, i) => (
                              <span 
                                key={i} 
                                className={`w-3 h-3 rounded-full border border-black/10 ${i === 0 ? 'ring-1 ring-offset-1 ring-black/20' : ''}`} 
                                style={{ backgroundColor: c }}
                              ></span>
                            ))}
                          </div>
                          <h3 className="font-medium text-black text-sm mt-1">{product.name}</h3>
                          <span className="text-zinc-500 font-semibold text-sm">{product.price}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex items-center justify-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-black/5 bg-white text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-black/20 transition-colors"
                >
                    <ChevronLeft width={16} height={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium text-sm transition-colors ${
                      currentPage === page 
                        ? 'border-black bg-black text-white' 
                        : 'border-black/5 bg-white text-zinc-600 hover:border-black/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-black/5 bg-white text-zinc-600 hover:border-black/20 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight width={16} height={16} />
                </button>
            </div>
             <div className="text-center mt-4 text-xs text-zinc-400">
                 <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, products.length)}</span> / {products.length} producten getoond
            </div>
        </div>
      </div>
    </div>
  );
}
