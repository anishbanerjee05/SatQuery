"use client";

import React, { useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const COLOR_CONFIGS = {
  blue: {
    border: "rgba(59, 130, 246, 0.6)",
    bg: "rgba(59, 130, 246, 0.12)",
    accent: "rgba(147, 197, 253, 0.35)",
  },
  purple: {
    border: "rgba(168, 85, 247, 0.6)",
    bg: "rgba(168, 85, 247, 0.12)",
    accent: "rgba(216, 180, 254, 0.35)",
  },
  green: {
    border: "rgba(34, 197, 94, 0.6)",
    bg: "rgba(34, 197, 94, 0.12)",
    accent: "rgba(134, 239, 172, 0.35)",
  },
  red: {
    border: "rgba(239, 68, 68, 0.6)",
    bg: "rgba(239, 68, 68, 0.12)",
    accent: "rgba(252, 165, 165, 0.35)",
  },
  orange: {
    border: "rgba(249, 115, 22, 0.6)",
    bg: "rgba(249, 115, 22, 0.12)",
    accent: "rgba(253, 186, 116, 0.35)",
  },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const config = COLOR_CONFIGS[glowColor] || COLOR_CONFIGS.blue;

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size];
  };

  const inlineStyles: React.CSSProperties = {
    ...(width !== undefined && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === "number" ? `${height}px` : height }),
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={inlineStyles}
      className={cn(
        "group relative rounded-2xl border border-neutral-800 bg-[#0a0a0c]/80 backdrop-blur-md overflow-hidden transition-all duration-300",
        getSizeClasses(),
        className
      )}
    >
      {/* Dynamic Cursor Spotlight Background Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${config.bg}, transparent 60%)`,
        }}
      />

      {/* Dynamic Cursor Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl border transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          borderColor: config.border,
          maskImage: `radial-gradient(280px circle at ${position.x}px ${position.y}px, black, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(280px circle at ${position.x}px ${position.y}px, black, transparent 70%)`,
          boxShadow: `inset 0 0 20px ${config.accent}`,
        }}
      />

      {/* Static Resting Border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.04] transition-colors group-hover:border-white/[0.12]" />

      {/* Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default GlowCard;
