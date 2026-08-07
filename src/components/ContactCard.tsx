import React, { useState } from "react";

export default function ContactCard() {
  // Track mouse position for radial highlight
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // When the mouse moves over this card, update local state
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverPos({ x, y });
  };

  // Clear the highlight when the mouse leaves
  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  // If we're hovering, create a small radial gradient around the cursor
  const backgroundStyle = hoverPos
    ? `radial-gradient(circle 100px at ${hoverPos.x}px ${hoverPos.y}px, rgba(148, 163, 184, 0.12), transparent 80%)`
    : "transparent";

  return (
    <div
      // The outer container: transparent + transform scale on hover
      className="w-80 border border-gray-700 rounded-xl bg-transparent
                   transition-all duration-300 ease-out
                   hover:scale-105 hover:shadow-lg cursor-pointer"
      // Inline style for dynamic radial highlight
      style={{
        background: backgroundStyle,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable header */}
      <div className="p-3 flex-row">
        <div>
          <h3 className="text-lg font-bold">Contact Me</h3>
          <p className="text-sm text-gray-400">
            Set up a meeting at your convenience
          </p>
        </div>
      </div>
    </div>
  );
}
