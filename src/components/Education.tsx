import React, { useState } from "react";

interface School {
  title: string;
  shortDescription: string;
}

const schools: School[] = [
  {
    title: "BASc. Major in Computer Engineering",
    shortDescription:
      "Queen's University | Stephen J.R. Smith Faculty of Engineering and Applied Science",
  },
];

export default function Education() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Education</h2>
      <div className="space-y-4">
        {schools.map((exp, idx) => (
          <ProjectCard
            key={idx}
            exp={exp}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  exp,
}: {
  exp: School;
}) {
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
    ? `radial-gradient(circle 400px at ${hoverPos.x}px ${hoverPos.y}px, rgba(200, 200, 200, 0.3), transparent 80%)`
    : "transparent";

  return (
    <div
      // The outer container: transparent + transform scale on hover
      className="border border-gray-700 rounded-lg bg-transparent
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
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{exp.title}</h3>
          <p className="text-sm text-gray-400">{exp.shortDescription}</p>
        </div>
      </div>

      {/* Smoothly animated content */}
      <div
        className={`
          mx-4 mb-4 text-gray-200
          overflow-hidden
          transition-all duration-500 ease-in-out
        `}
      >
      </div>
    </div>
  );
}
