"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Tag,
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

  return (
    <aside className="w-56 shrink-0 bg-[#141414] border-r border-white/5 flex flex-col min-h-screen sticky top-0">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#f24f13] rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-sm tracking-tighter">E</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-tight leading-none">Ensokken</p>
            <p className="text-white/30 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon width={15} height={15} className={isActive ? "text-[#f24f13]" : "group-hover:text-white/70"} />
              {item.label}
              {isActive && <ChevronRight width={12} height={12} className="ml-auto text-white/20" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 mb-1">
          <p className="text-white/60 text-xs font-medium truncate">{profile?.email || "admin@ensokken.nl"}</p>
          <p className="text-white/25 text-[10px] mt-0.5">Beheerder</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <LogOut width={15} height={15} />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
