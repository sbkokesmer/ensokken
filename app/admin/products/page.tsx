"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Pencil, Trash2, Search, Loader2, X, ChevronDown } from "lucide-react";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  badge: string;
  is_active: boolean;
  category_id: string | null;
  description: string;
  created_at: string;
  categories?: { name: string } | null;
  product_images?: { url: string; is_primary: boolean }[];
}

const emptyForm = {
  sku: "", name: "", description: "", price: "", badge: "", category_id: "", is_active: true,
  images: ["", "", ""],
  variants: [
    { color_hex: "#f0f0f0", color_name: "Crème", size: "36-39", stock_quantity: 0 },
    { color_hex: "#f0f0f0", color_name: "Crème", size: "40-43", stock_quantity: 0 },
    { color_hex: "#f0f0f0", color_name: "Crème", size: "44-46", stock_quantity: 0 },
  ],
};

type FormState = typeof emptyForm;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*, categories(name), product_images(url, is_primary)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setProducts(prods ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setFormError(null);
    const imgs = p.product_images?.map((i) => i.url) ?? [];
    while (imgs.length < 3) imgs.push("");
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: String(p.price),
      badge: p.badge,
      category_id: p.category_id ?? "",
      is_active: p.is_active,
      images: imgs.slice(0, 3),
      variants: emptyForm.variants,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Dit product verwijderen?")) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    fetchAll();
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.sku.trim()) {
      setFormError("Vul alle verplichte velden in (SKU, naam, prijs).");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description,
      price: parseFloat(form.price),
      badge: form.badge,
      category_id: form.category_id || null,
      is_active: form.is_active,
    };

    let productId = editId;

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) { setFormError(error.message); setSaving(false); return; }
      await supabase.from("product_images").delete().eq("product_id", editId);
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      productId = data.id;
    }

    const imgInserts = form.images
      .filter((url) => url.trim())
      .map((url, i) => ({ product_id: productId!, url: url.trim(), is_primary: i === 0, sort_order: i }));
    if (imgInserts.length) await supabase.from("product_images").insert(imgInserts);

    if (!editId && form.variants.some((v) => v.color_hex)) {
      const varInserts = form.variants.map((v) => ({ ...v, product_id: productId! }));
      await supabase.from("product_variants").upsert(varInserts, { onConflict: "product_id,color_hex,size" });
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const primaryImg = (p: Product) => p.product_images?.find((i) => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? "";

  return (
    <div>
      <AdminHeader
        title="Producten"
        subtitle={`${products.length} producten`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 bg-[#f24f13] text-white rounded-xl text-sm font-medium hover:bg-[#e04410] transition-colors"
          >
            <Plus width={15} height={15} />
            Nieuw product
          </button>
        }
      />

      <div className="p-8 flex flex-col gap-5">
        <div className="relative">
          <Search width={14} height={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Zoeken op naam of SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#1a1a1a] border border-white/5 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/15 transition-colors"
          />
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/30 text-sm flex items-center justify-center gap-2">
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-sm">Geen producten gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Product</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">SKU</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Categorie</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Prijs</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {primaryImg(p) ? (
                          <img src={primaryImg(p)} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-white/5" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/20 text-xs">?</div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          {p.badge && <span className="text-[10px] text-[#f24f13] font-medium">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs font-mono">{p.sku}</td>
                    <td className="px-5 py-3 text-white/60 text-sm">{p.categories?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-white text-sm font-medium">€{Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${p.is_active ? "text-green-400 bg-green-400/10" : "text-zinc-400 bg-zinc-400/10"}`}>
                        {p.is_active ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                          <Pencil width={13} height={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-colors"
                        >
                          {deleting === p.id ? <Loader2 width={13} height={13} className="animate-spin" /> : <Trash2 width={13} height={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-white font-semibold text-base">{editId ? "Product bewerken" : "Nieuw product"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                <X width={16} height={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">SKU *</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="ENS-WHITE-001"
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Naam *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Essential White"
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Prijs (€) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="26.00"
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Badge</label>
                  <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Best Seller / Nieuw"
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Categorie</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-white/15 transition-colors appearance-none">
                    <option value="">Geen categorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Status</label>
                  <select value={form.is_active ? "true" : "false"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
                    className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-white/15 transition-colors appearance-none">
                    <option value="true">Actief</option>
                    <option value="false">Inactief</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Beschrijving</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Productbeschrijving..."
                  className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-2">Afbeeldingen (URL)</label>
                <div className="flex flex-col gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-white/25 text-xs w-5 text-center">{i + 1}</span>
                      <input value={url} onChange={(e) => {
                        const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs });
                      }}
                        placeholder={i === 0 ? "Hoofdafbeelding URL" : `Afbeelding ${i + 1} URL`}
                        className="flex-1 h-9 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
                      {url && <img src={url} className="w-9 h-9 rounded-lg object-cover bg-white/5" onError={(e) => (e.currentTarget.style.display = "none")} />}
                    </div>
                  ))}
                </div>
              </div>

              {!editId && (
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2">Varianten (kleur + maat)</label>
                  <div className="flex flex-col gap-2">
                    {form.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 items-center">
                        <input value={v.color_hex} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], color_hex: e.target.value }; setForm({ ...form, variants: vs });
                        }} placeholder="#f0f0f0" className="h-8 px-2 bg-[#0f0f0f] border border-white/5 rounded-lg text-white text-xs placeholder:text-white/20 focus:outline-none font-mono" />
                        <input value={v.color_name} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], color_name: e.target.value }; setForm({ ...form, variants: vs });
                        }} placeholder="Crème" className="h-8 px-2 bg-[#0f0f0f] border border-white/5 rounded-lg text-white text-xs placeholder:text-white/20 focus:outline-none" />
                        <select value={v.size} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], size: e.target.value }; setForm({ ...form, variants: vs });
                        }} className="h-8 px-2 bg-[#0f0f0f] border border-white/5 rounded-lg text-white text-xs focus:outline-none appearance-none">
                          <option>36-39</option><option>40-43</option><option>44-46</option>
                        </select>
                        <input type="number" min="0" value={v.stock_quantity} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], stock_quantity: parseInt(e.target.value) || 0 }; setForm({ ...form, variants: vs });
                        }} placeholder="Voorraad" className="h-8 px-2 bg-[#0f0f0f] border border-white/5 rounded-lg text-white text-xs placeholder:text-white/20 focus:outline-none" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { color_hex: "#f0f0f0", color_name: "Crème", size: "40-43", stock_quantity: 0 }] })}
                      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mt-1">
                      <Plus width={12} height={12} /> Variant toevoegen
                    </button>
                  </div>
                </div>
              )}

              {formError && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 hover:text-white transition-colors">
                  Annuleren
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-[#f24f13] text-white rounded-xl text-sm font-medium hover:bg-[#e04410] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving && <Loader2 width={14} height={14} className="animate-spin" />}
                  {editId ? "Bijwerken" : "Toevoegen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
