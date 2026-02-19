"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import { Users, ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  user_email?: string;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10",
  confirmed: "text-sky-400 bg-sky-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  shipped: "text-cyan-400 bg-cyan-400/10",
  delivered: "text-emerald-400 bg-emerald-400/10",
  cancelled: "text-red-400 bg-red-400/10",
  refunded: "text-zinc-400 bg-zinc-400/10",
};

const statusLabels: Record<string, string> = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  processing: "Verwerking",
  shipped: "Verzonden",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
  refunded: "Terugbetaald",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [
      { count: totalProducts },
      { count: totalUsers },
      { count: totalOrders },
      { data: revenueData },
      { count: pendingOrders },
      { count: deliveredOrders },
      { count: cancelledOrders },
      { data: recentOrders },
      { data: recentUsers },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("payment_status", "paid"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("orders").select("id, order_number, total, status, created_at, user_id").order("created_at", { ascending: false }).limit(8),
      supabase.from("profiles").select("id, email, full_name, created_at").eq("is_admin", false).order("created_at", { ascending: false }).limit(5),
    ]);

    const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

    setStats({
      totalProducts: totalProducts ?? 0,
      totalUsers: totalUsers ?? 0,
      totalOrders: totalOrders ?? 0,
      totalRevenue,
      pendingOrders: pendingOrders ?? 0,
      deliveredOrders: deliveredOrders ?? 0,
      cancelledOrders: cancelledOrders ?? 0,
      recentOrders: recentOrders ?? [],
      recentUsers: recentUsers ?? [],
    });
    setLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Overzicht van de winkelactiviteiten" />

      <div className="p-8 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Totale omzet" value={`€${(stats?.totalRevenue ?? 0).toFixed(2)}`} sub="Betaalde bestellingen" accent />
          <StatCard label="Bestellingen" value={stats?.totalOrders ?? "—"} sub={`${stats?.pendingOrders ?? 0} in afwachting`} />
          <StatCard label="Gebruikers" value={stats?.totalUsers ?? "—"} sub="Geregistreerde klanten" />
          <StatCard label="Producten" value={stats?.totalProducts ?? "—"} sub="Actieve producten" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <Clock width={18} height={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{stats?.pendingOrders ?? "—"}</p>
              <p className="text-white/35 text-xs">In afwachting</p>
            </div>
          </div>
          <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <CheckCircle width={18} height={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{stats?.deliveredOrders ?? "—"}</p>
              <p className="text-white/35 text-xs">Bezorgd</p>
            </div>
          </div>
          <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
              <XCircle width={18} height={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{stats?.cancelledOrders ?? "—"}</p>
              <p className="text-white/35 text-xs">Geannuleerd</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <ShoppingCart width={14} height={14} className="text-white/40" />
              <h3 className="text-white/70 text-sm font-medium">Recente bestellingen</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-white/20 text-sm">Laden...</div>
            ) : stats?.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-white/20 text-sm">Nog geen bestellingen</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-5 py-3 text-white/25 text-xs font-medium">Bestelling</th>
                    <th className="text-left px-5 py-3 text-white/25 text-xs font-medium">Bedrag</th>
                    <th className="text-left px-5 py-3 text-white/25 text-xs font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-white/25 text-xs font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white text-sm font-medium">{order.order_number}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">€{Number(order.total).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[order.status] || "text-white/40 bg-white/5"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/30 text-xs">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <Users width={14} height={14} className="text-white/40" />
              <h3 className="text-white/70 text-sm font-medium">Nieuwe gebruikers</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-white/20 text-sm">Laden...</div>
            ) : stats?.recentUsers.length === 0 ? (
              <div className="p-8 text-center text-white/20 text-sm">Nog geen gebruikers</div>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-white/40 text-xs font-semibold uppercase">
                        {u.email?.[0] ?? "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.full_name || "—"}</p>
                      <p className="text-white/25 text-xs truncate">{u.email}</p>
                    </div>
                    <p className="text-white/20 text-[10px] ml-auto shrink-0">{formatDate(u.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
