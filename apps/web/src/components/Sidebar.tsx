"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, BookOpen, Settings, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", icon: MessageCircle, label: "Chat" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-16 md:w-56 h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2 md:px-4 fixed left-0 top-0 z-10">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Brain className="text-primary-500 w-7 h-7 shrink-0" />
        <span className="hidden md:block font-bold text-lg text-white">LinguaAI</span>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors",
              pathname === href
                ? "bg-primary-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden md:block text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
