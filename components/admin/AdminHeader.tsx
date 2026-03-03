"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export default function AdminHeader({ title, subtitle, action, showBack }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="sticky top-0 z-10 backdrop-blur-sm"
      style={{ background: "var(--at-header-bg)", borderBottom: "1px solid var(--at-border)" }}
    >
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
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
              <ArrowLeft width={16} height={16} />
            </button>
          )}
          <div>
            <h1 className="font-semibold text-base tracking-tight leading-none" style={{ color: "var(--at-text)" }}>{title}</h1>
            {subtitle && <p className="text-xs mt-1" style={{ color: "var(--at-text-muted)" }}>{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
