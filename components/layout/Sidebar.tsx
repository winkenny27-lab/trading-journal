"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  CheckSquare,
  Settings,
  TrendingUp,
  BarChart2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/trades", label: "Trade Log", icon: BookOpen },
  { href: "/trades/new", label: "New Trade", icon: PlusCircle },
  { href: "/checklists", label: "Checklists", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40 flex flex-col",
          "bg-[var(--card)] border-r border-[var(--card-border)]",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--card-border)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="text-brand-green" size={22} />
            <span className="font-bold text-lg tracking-tight">TradeLog</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-brand-green/10 text-brand-green"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="px-6 py-4 border-t border-[var(--card-border)]">
          <p className="text-xs text-[var(--muted)]">TradeLog v1.0</p>
          <p className="text-xs text-[var(--muted)]">Trade smarter. Journal better.</p>
        </div>
      </aside>
    </>
  );
}
