"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NavCardProps {
  href: string;
  title: string;
  description: string;
  className?: string;
}

export default function NavCard({
  href,
  title,
  description,
  className = "",
}: NavCardProps) {
  // Track mouse position for radial highlight
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const backgroundStyle = hoverPos
    ? `radial-gradient(circle 100px at ${hoverPos.x}px ${hoverPos.y}px, rgba(148, 163, 184, 0.12), transparent 80%)`
    : "transparent";

  return (
    <Link
      href={href}
      className={`block h-full py-4 pr-2 text-center border border-gray-700 rounded-xl bg-transparent
                 transition-all duration-300 ease-out
                 hover:scale-105 hover:shadow-lg cursor-pointer ${className}`}
      style={{ background: backgroundStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}
