"use client";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
      <div>
        <h1 className="text-white font-semibold text-lg tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
