"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/generations", label: "Generations" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-gray-200 min-h-[calc(100vh-65px)] p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Admin
      </h2>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
