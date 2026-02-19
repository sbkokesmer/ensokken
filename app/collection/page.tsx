"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

const ITEMS_PER_PAGE = 20;

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Aanbevolen");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    setCategories(data ?? []);
  }

  function primaryImage(p: Product) {
    return (
      p.product_images?.find(i => i.is_primary)?.url ??
      p.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))?.[0]?.url ??
      'https://images.pexels.com/photos/4495705/pexels-photo-4495705.jpeg?auto=compress&cs=tinysrgb&w=800'
    );
  }

  function uniqueColors(p: Product) {
    const seen = new Set<string>();
    return (p.product_variants ?? []).filter(v => {
      if (seen.has(v.color_hex)) return false;
      seen.add(v.color_hex);
      return true;
    });
  }

  function sortProducts(list: Product[]) {
    switch (currentSort) {
      case 'Prijs: Laag naar Hoog': return [...list].sort((a, b) => a.price - b.price);
      case 'Prijs: Hoog naar Laag': return [...list].sort((a, b) => b.price - a.price);
      default: return list;
    }
  }

  let filtered = products;
  if (selectedCategory) filtered = filtered.filter(p => p.category_id === selectedCategory);
  if (selectedColors.length > 0) {
    filtered = filtered.filter(p => p.product_variants?.some(v => selectedColors.includes(v.color_hex)));
  }
  if (selectedSizes.length > 0) {
    filtered = filtered.filter(p => p.product_variants?.some(v => selectedSizes.includes(v.size)));
  }
  const sorted = sortProducts(filtered);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const allColors = Array.from(
    new Map(products.flatMap(p => p.product_variants ?? []).map(v => [v.color_hex, v.color_name])).entries()
  ).map(([hex, name]) => ({ hex, name }));

  const allSizes = Array.from(
    new Set(products.flatMap(p => p.product_variants ?? []).map(v => v.size))
  ).sort();

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
              <SlidersHorizontal width={16} height={16} /> Filters
            </h2>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedColors([]); setSelectedSizes([]); setCurrentPage(1); }}
              className="text-xs text-zinc-500 hover:text-black underline"
            >
              Wissen
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Categorie</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="category" checked={selectedCategory === null} onChange={() => { setSelectedCategory(null); setCurrentPage(1); }} className="sr-only peer" />
                <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                  {selectedCategory === null && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">Alle Sokken</span>
                <span className="ml-auto text-xs text-zinc-400">{products.length}</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => { setSelectedCategory(cat.id); setCurrentPage(1); }} className="sr-only peer" />
                  <div className="w-4 h-4 rounded border border-zinc-300 bg-white flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-all">
                    {selectedCategory === cat.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">{cat.name}</span>
                  <span className="ml-auto text-xs text-zinc-400">{products.filter(p => p.category_id === cat.id).length}</span>
                </label>
              ))}
            </div>
          </div>

          {allColors.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-black/5">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kleur</p>
              <div className="flex flex-wrap gap-3">
                {allColors.map(({ hex, name }) => (
                  <button
                    key={hex}
                    onClick={() => setSelectedColors(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex])}
                    className={`w-6 h-6 rounded-full border transition-all ${selectedColors.includes(hex) ? 'ring-2 ring-black ring-offset-1' : 'ring-2 ring-transparent hover:ring-black/20'}`}
                    style={{ backgroundColor: hex, borderColor: 'rgba(0,0,0,0.1)' }}
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}

          {allSizes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-black/5">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Maat</p>
              <div className="grid grid-cols-3 gap-2">
                {allSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-black/5 bg-white hover:border-black'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1">
          <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-black/5 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight">Collectie</h1>
              <span className="text-sm text-zinc-500 mt-1 block">Totaal {filtered.length} Producten</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Sorteren:</span>
              <div className="relative z-20">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 200)}
                  className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-black/5 hover:border-black/20 transition-colors shadow-sm focus:outline-none w-48 justify-between"
                >
                  <span>{currentSort}</span>
                  <ChevronDown width={14} height={14} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-black/5 shadow-xl p-1.5 flex flex-col gap-0.5 z-30 animate-in fade-in zoom-in-95 duration-200">
                    {['Aanbevolen', 'Nieuwste', 'Prijs: Laag naar Hoog', 'Prijs: Hoog naar Laag'].map(sort => (
                      <button
                        key={sort}
                        onClick={() => { setCurrentSort(sort); setSortOpen(false); setCurrentPage(1); }}
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

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 width={32} height={32} className="animate-spin text-zinc-300" />
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-24 text-zinc-400">Geen producten gevonden</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
              {currentProducts.map(product => {
                const isFav = isFavorite(product.id);
                const colors = uniqueColors(product);
                return (
                  <div key={product.id} className="group flex flex-col h-full relative">
                    <button
                      onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <Heart width={16} height={16} className={isFav ? "fill-black text-black" : "text-zinc-400"} />
                    </button>
                    <Link href={`/product/${product.id}`} className="cursor-pointer flex flex-col h-full">
                      <div className="aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-black/5 relative mb-3 hover:border-black/20 transition-all duration-300">
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase tracking-wide">
                            {product.badge}
                          </span>
                        )}
                        <img
                          src={primaryImage(product)}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        {colors.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {colors.slice(0, 4).map((v, i) => (
                              <span
                                key={v.color_hex}
                                className={`w-3 h-3 rounded-full border border-black/10 ${i === 0 ? 'ring-1 ring-offset-1 ring-black/20' : ''}`}
                                style={{ backgroundColor: v.color_hex }}
                              />
                            ))}
                          </div>
                        )}
                        <h3 className="font-medium text-black text-sm mt-1">{product.name}</h3>
                        <span className="text-zinc-500 font-semibold text-sm">€{Number(product.price).toFixed(2)}</span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <>
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-black/5 bg-white text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-black/20 transition-colors"
                >
                  <ChevronLeft width={16} height={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium text-sm transition-colors ${currentPage === page ? 'border-black bg-black text-white' : 'border-black/5 bg-white text-zinc-600 hover:border-black/20'}`}
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
                <span>{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sorted.length)}</span> / {sorted.length} producten getoond
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
