"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  product_count?: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data: cats } = await supabase.from("categories").select("id, name, slug, created_at").order("name");
    if (!cats) { setLoading(false); return; }

    const withCounts = await Promise.all(
      cats.map(async (c) => {
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", c.id);
        return { ...c, product_count: count ?? 0 };
      })
    );
    setCategories(withCounts);
    setLoading(false);
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    const slug = newSlug || slugify(newName);
    await supabase.from("categories").insert({ name: newName.trim(), slug });
    setNewName("");
    setNewSlug("");
    setShowAdd(false);
    setSaving(false);
    fetchCategories();
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    const slug = editSlug || slugify(editName);
    await supabase.from("categories").update({ name: editName.trim(), slug }).eq("id", id);
    setEditingId(null);
    setSaving(false);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("Categorie verwijderen? Producten worden niet verwijderd.")) return;
    setDeleting(id);
    await supabase.from("categories").delete().eq("id", id);
    setDeleting(null);
    fetchCategories();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  const inputCls = "w-full h-10 px-3 text-sm focus:outline-none transition-colors rounded-xl";

  return (
    <div>
      <AdminHeader
        title="Categorieën"
        subtitle={`${categories.length} categorieën`}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--at-btn-primary-bg)", color: "var(--at-btn-primary-text)" }}
          >
            <Plus width={15} height={15} />
            Nieuwe categorie
          </button>
        }
      />

      <div className="p-8 flex flex-col gap-5">
        {showAdd && (
          <div className="rounded-2xl p-5" style={{ background: "var(--at-surface)", border: "1px solid var(--at-border-strong)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--at-text)" }}>Nieuwe categorie</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--at-text-dim)" }}>Naam *</label>
                <input
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  placeholder="Heren"
                  className={inputCls}
                  style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--at-text-dim)" }}>Slug</label>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="heren"
                  className={`${inputCls} font-mono`}
                  style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm transition-colors"
                style={{ background: "var(--at-btn-secondary-bg)", color: "var(--at-btn-secondary-text)" }}
              >
                <X width={14} height={14} /> Annuleren
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: "var(--at-btn-primary-bg)", color: "var(--at-btn-primary-text)" }}
              >
                {saving ? <Loader2 width={14} height={14} className="animate-spin" /> : <Check width={14} height={14} />}
                Toevoegen
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)" }}>
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--at-text-muted)" }}>
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: "var(--at-text-muted)" }}>Geen categorieën</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--at-border)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Naam</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Slug</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Producten</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Aangemaakt</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="transition-colors" style={{ borderBottom: "1px solid var(--at-border)" }}>
                    <td className="px-5 py-3">
                      {editingId === c.id ? (
                        <input
                          value={editName}
                          onChange={(e) => { setEditName(e.target.value); setEditSlug(slugify(e.target.value)); }}
                          className="h-8 px-3 text-sm focus:outline-none rounded-lg w-36"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-focus)", color: "var(--at-text)" }}
                        />
                      ) : (
                        <span className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{c.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editingId === c.id ? (
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="h-8 px-3 text-sm font-mono focus:outline-none rounded-lg w-36"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-focus)", color: "var(--at-text)" }}
                        />
                      ) : (
                        <span className="text-xs font-mono" style={{ color: "var(--at-text-dim)" }}>{c.slug}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--at-text-secondary)" }}>{c.product_count}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--at-text-dim)" }}>{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {editingId === c.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(c.id)}
                              disabled={saving}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-green-400 bg-green-400/10 hover:bg-green-400/20"
                            >
                              {saving ? <Loader2 width={13} height={13} className="animate-spin" /> : <Check width={13} height={13} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                              style={{ color: "var(--at-text-muted)" }}
                            >
                              <X width={13} height={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(c.id); setEditName(c.name); setEditSlug(c.slug); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                              style={{ color: "var(--at-text-muted)" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                                (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "var(--at-text-muted)";
                              }}
                            >
                              <Pencil width={13} height={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deleting === c.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:text-red-400 hover:bg-red-400/10"
                              style={{ color: "var(--at-text-muted)" }}
                            >
                              {deleting === c.id ? <Loader2 width={13} height={13} className="animate-spin" /> : <Trash2 width={13} height={13} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
