"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Tag,
  Store,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Producten", href: "/admin/products", icon: Package },
  { label: "Bestellingen", href: "/admin/orders", icon: ShoppingCart },
  { label: "Gebruikers", href: "/admin/users", icon: Users },
  { label: "Categorieën", href: "/admin/categories", icon: Tag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <aside
      className="w-56 shrink-0 flex flex-col min-h-screen sticky top-0"
      style={{
        background: "var(--at-sidebar)",
        borderRight: "1px solid var(--at-border)",
      }}
    >
      <div className="p-5" style={{ borderBottom: "1px solid var(--at-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--at-text)" }}
          >
            <span
              className="font-bold text-sm tracking-tighter"
              style={{ color: "var(--at-bg)" }}
            >
              E
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm tracking-tight leading-none" style={{ color: "var(--at-text)" }}>
              Ensokken
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--at-text-faint)" }}>Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5 mt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                isActive
                  ? { background: "var(--at-text)", color: "var(--at-bg)" }
                  : { color: "var(--at-text-dim)" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-text-dim)";
                }
              }}
            >
              <Icon width={15} height={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid var(--at-border)" }}>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5"
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
          <Store width={15} height={15} />
          Winkel bekijken
        </Link>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5"
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
          {theme === "dark" ? <Sun width={15} height={15} /> : <Moon width={15} height={15} />}
          {theme === "dark" ? "Licht modus" : "Donker modus"}
        </button>

        <div className="px-3 py-2 mb-1 mt-1">
          <p className="text-xs font-medium truncate" style={{ color: "var(--at-text-secondary)" }}>
            {profile?.full_name || profile?.email || "admin"}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--at-text-faint)" }}>Beheerder</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
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
          <LogOut width={15} height={15} />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
