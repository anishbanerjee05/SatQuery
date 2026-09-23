"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  MessageSquare, 
  Trophy, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, targetId: "hero" },
  { id: "chat", label: "Query", icon: MessageSquare, targetId: "command-center" },
  { id: "pipeline", label: "Pipeline", icon: TrendingUp, targetId: "pipeline" },
  { id: "about", label: "Architecture", icon: User, targetId: "about" },
  { id: "applications", label: "Missions", icon: Trophy, targetId: "applications" },
  { id: "specs", label: "Sensors", icon: CreditCard, targetId: "specs" },
];

export function FloatingNavbar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<string>("home");

  // Scroll spy to update active item based on viewport position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.targetId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveTab(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleItemClick = (item: NavItem) => {
    setActiveTab(item.id);
    const element = document.getElementById(item.targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        className
      )}
    >
      <nav
        aria-label="Main Navigation"
        className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#141416]/95 border border-[#27272a] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center transition-all duration-200 cursor-pointer rounded-full select-none",
                isActive
                  ? "bg-[#28282b] text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-sm"
                  : "text-neutral-400 hover:text-white p-2.5 hover:bg-neutral-800/40"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {isActive && (
                <span className="ml-2 whitespace-nowrap tracking-tight font-medium text-xs sm:text-sm">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default FloatingNavbar;
