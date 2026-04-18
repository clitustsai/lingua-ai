"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, LayoutDashboard, BookOpen, GraduationCap, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Home" },
  { href: "/",           icon: MessageCircle,   label: "Chat" },
  { href: "/study-sets", icon: BookOpen,        label: "Bộ học tập" },
  { href: "/lessons",    icon: GraduationCap,   label: "Learn" },
  { href: "/minigame",   icon: Gamepad2,        label: "Games" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bottom-nav-blur safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all",
                active ? "bg-primary-600/20" : "")}>
              <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary-400" : "text-gray-500")} />
              <span className={cn("text-xs font-medium transition-colors", active ? "text-primary-400" : "text-gray-600")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
