"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, MessageCircle, Compass, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/learn", icon: BookOpen, label: "Học" },
  { href: "/tutor", icon: Users, label: "Gia sư" },
  { href: "/", icon: MessageCircle, label: "Trò chuyện AI", center: true },
  { href: "/explore", icon: Compass, label: "Khám phá" },
  { href: "/dashboard", icon: TrendingUp, label: "Tiến độ" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-blur">
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 py-2">
        {nav.map(({ href, icon: Icon, label, center }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          if (center) return (
            <Link key={href} href={href} className="flex flex-col items-center -mt-5">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                isActive
                  ? "bg-primary-500 glow-purple scale-110"
                  : "bg-primary-600 hover:bg-primary-500"
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={cn("text-xs mt-1 font-medium", isActive ? "text-primary-400" : "text-gray-500")}>{label}</span>
            </Link>
          );
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-1 px-3">
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary-400" : "text-gray-500")} />
              <span className={cn("text-xs font-medium transition-colors", isActive ? "text-primary-400" : "text-gray-500")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
