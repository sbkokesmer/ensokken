"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2, Eye, X, Heart, ShoppingCart } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product_variants: { color_name: string; size: string; product_id: string } | null;
  products: { name: string; price: number } | null;
}

interface Favorite {
  id: string;
  products: { name: string; price: number } | null;
}

interface UserDetail {
  profile: Profile;
  cartItems: CartItem[];
  favorites: Favorite[];
  orderCount: number;
  totalSpent: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_admin", false)
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function viewUser(profile: Profile) {
    setDetailLoading(true);
    const [
      { data: cartItems },
      { data: favorites },
      { data: orders },
    ] = await Promise.all([
      supabase.from("cart_items")
        .select("id, quantity, product_variants(color_name, size, product_id), products(name, price)")
        .eq("user_id", profile.id),
      supabase.from("favorites")
        .select("id, products(name, price)")
        .eq("user_id", profile.id),
      supabase.from("orders")
        .select("total, payment_status")
        .eq("user_id", profile.id),
    ]);

    const totalSpent = (orders ?? []).filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0);

    setSelected({
      profile,
      cartItems: (cartItems as CartItem[]) ?? [],
      favorites: (favorites as Favorite[]) ?? [],
      orderCount: orders?.length ?? 0,
      totalSpent,
    });
    setDetailLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminHeader title="Gebruikers" subtitle={`${users.length} geregistreerde klanten`} />

      <div className="p-8">
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)" }}>
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--at-text-muted)" }}>
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: "var(--at-text-muted)" }}>Geen gebruikers gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--at-border)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Gebruiker</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>E-mail</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Telefoon</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Geregistreerd</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors" style={{ borderBottom: "1px solid var(--at-border)" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--at-hover-btn)" }}>
                          <span className="text-xs font-semibold uppercase" style={{ color: "var(--at-text-dim)" }}>{u.email?.[0] ?? "?"}</span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{u.full_name || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--at-text-secondary)" }}>{u.email}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--at-text-dim)" }}>{u.phone || "—"}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--at-text-dim)" }}>{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => viewUser(u)}
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
                        <Eye width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="relative rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            style={{ background: "var(--at-surface)", border: "1px solid var(--at-border-strong)" }}
          >
            {detailLoading ? (
              <div className="p-16 flex items-center justify-center gap-2" style={{ color: "var(--at-text-muted)" }}>
                <Loader2 width={20} height={20} className="animate-spin" />
              </div>
            ) : selected ? (
              <>
                <div
                  className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
                  style={{ background: "var(--at-surface-2)", borderBottom: "1px solid var(--at-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--at-hover-btn)" }}>
                      <span className="text-sm font-semibold uppercase" style={{ color: "var(--at-text-dim)" }}>{selected.profile.email?.[0] ?? "?"}</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm" style={{ color: "var(--at-text)" }}>{selected.profile.full_name || "Naamloos"}</h2>
                      <p className="text-xs" style={{ color: "var(--at-text-faint)" }}>{selected.profile.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: "var(--at-text-dim)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                      (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--at-text-dim)";
                    }}
                  >
                    <X width={16} height={16} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Bestellingen", value: selected.orderCount },
                      { label: "Uitgegeven", value: `€${selected.totalSpent.toFixed(2)}` },
                      { label: "Favorieten", value: selected.favorites.length },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--at-surface-input)" }}>
                        <p className="text-lg font-semibold" style={{ color: "var(--at-text)" }}>{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--at-text-muted)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart width={14} height={14} style={{ color: "var(--at-text)" }} />
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--at-text-secondary)" }}>Winkelwagen ({selected.cartItems.length})</p>
                    </div>
                    {selected.cartItems.length === 0 ? (
                      <p className="text-sm text-center py-4" style={{ color: "var(--at-text-placeholder)" }}>Lege winkelwagen</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selected.cartItems.map((item) => (
                          <div key={item.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "var(--at-surface-input)" }}>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{item.products?.name ?? "—"}</p>
                              <p className="text-xs" style={{ color: "var(--at-text-dim)" }}>{item.product_variants?.color_name ?? "—"} · {item.product_variants?.size ?? "—"} · ×{item.quantity}</p>
                            </div>
                            <p className="text-sm" style={{ color: "var(--at-text-secondary)" }}>€{((item.products?.price ?? 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Heart width={14} height={14} style={{ color: "var(--at-text)" }} />
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--at-text-secondary)" }}>Favorieten ({selected.favorites.length})</p>
                    </div>
                    {selected.favorites.length === 0 ? (
                      <p className="text-sm text-center py-4" style={{ color: "var(--at-text-placeholder)" }}>Geen favorieten</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selected.favorites.map((fav) => (
                          <div key={fav.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "var(--at-surface-input)" }}>
                            <p className="text-sm" style={{ color: "var(--at-text)" }}>{fav.products?.name ?? "—"}</p>
                            <p className="text-sm" style={{ color: "var(--at-text-dim)" }}>€{Number(fav.products?.price ?? 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
