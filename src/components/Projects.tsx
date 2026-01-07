import React, { useState } from "react";

interface Project {
  title: string;
  shortDescription: string;
  longDescription: React.ReactNode;
}

const projects: Project[] = [
  {
    title: "Cactus Loyalty App",
    shortDescription:
      "Custom loyalty and rewards platform for small-to-medium sized businesses",
    longDescription: (
      <>
        <strong>
          Skills: React Native, Laravel (PHP), REST APIs, PostgreSQL, Mobile
          Development, CI/CD
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Led development of a full-stack loyalty rewards platform consisting
            of separate customer and business-facing mobile applications.
          </li>
          <li>
            Built core features including QR-based point collection, rewards
            management, user authentication, and role-based access controls.
          </li>
          <li>
            Designed and implemented backend services and APIs using Laravel,
            supporting analytics and business reporting.
          </li>
          <li>
            Managed deployments, production stability, and CI/CD workflows to
            support ongoing feature development.
          </li>
          <li>
            Successfully exited the company for monetary investment after 12
            months
          </li>
        </ul>
        <div className="mt-3">
          <a
            href="https://cactusapp.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            Learn More About Cactus
          </a>
        </div>
      </>
    ),
  },
  {
    title: "Calorie Prediction Network",
    shortDescription:
      "Machine learning model for calorie expenditure estimation",
    longDescription: (
      <>
        <strong>
          Skills: Python, TensorFlow, Machine Learning, Data Science, Computer
          Vision
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Collaborated on a capstone project using a convolutional neural
            network (CNN) to classify exercise activities from image data.
          </li>
          <li>
            Used model outputs to infer exercise type and duration, enabling
            downstream calorie expenditure estimation.
          </li>
          <li>
            Trained, evaluated, and iterated on model performance using labeled
            datasets and validation metrics.
          </li>
          <li>
            Contributed to project documentation, experimentation, and final
            presentation of results.
          </li>
        </ul>
        <div className="mt-3">
          <a
            href="https://github.com/niko-hoogeveen/capstoneWebsite"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            Website Repository
          </a>
          {" | "}
          <a
            href="https://github.com/niko-hoogeveen/498-Capstone-Project"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            Image Classification Model Repository
          </a>
        </div>
      </>
    ),
  },
  {
    title: "Equity Research & Market Dashboard",
    shortDescription:
      "Interactive dashboard for tracking earnings, valuation, and market performance of technology stocks",
    longDescription: (
      <>
        <strong>
          Skills: Python, Financial Analysis, Data Visualization, Next.js,
          GitHub Actions
        </strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            Built a personal equity research dashboard to better understand how
            earnings results, valuation, and market expectations interact over
            time.
          </li>
          <li>
            Implemented interactive stock price charts with earnings date
            overlays, enabling analysis of post-earnings price behavior.
          </li>
          <li>
            Visualized EPS and revenue estimates versus actuals, including
            percentage surprises across recent quarters.
          </li>
          <li>
            Added valuation snapshots (P/E, forward P/E, EV/EBITDA, FCF
            multiples) to contextualize price movements against fundamentals.
          </li>
          <li>
            Automated data updates using scheduled GitHub Actions, with outputs
            stored as static JSON files for a fully static deployment.
          </li>
        </ul>
        <div className="mt-3">
          <a
            href="https://www.nikohoogeveen.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-300"
          >
            View the Equity Research Dashboard
          </a>
        </div>
      </>
    ),
  },
];

export default function Projects() {
  const [expanded, setExpanded] = useState<boolean[]>(
    projects.map(() => false)
  );

  const handleToggle = (index: number) => {
    setExpanded((prev) =>
      prev.map((isExpanded, i) => (i === index ? !isExpanded : isExpanded))
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="space-y-4">
        {projects.map((exp, idx) => (
          <ProjectCard
            key={idx}
            exp={exp}
            isExpanded={expanded[idx]}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  exp,
  isExpanded,
  onToggle,
}: {
  exp: Project;
  isExpanded: boolean;
  onToggle: () => void;
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
      <div className="p-4 flex justify-between items-center" onClick={onToggle}>
        <div>
          <h3 className="text-lg font-bold">{exp.title}</h3>
          <p className="text-sm text-gray-400">{exp.shortDescription}</p>
        </div>
        <span className="text-blue-500 size-4">{isExpanded ? "-" : "+"}</span>
      </div>

      {/* Smoothly animated content */}
      <div
        className={`
          mx-4 mb-4 text-gray-200
          overflow-hidden
          transition-all duration-500 ease-in-out
          ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div>{exp.longDescription}</div>
      </div>
    </div>
  );
}
