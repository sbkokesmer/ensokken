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
    <div className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft width={16} height={16} />
            </button>
          )}
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-white/35 text-xs mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
