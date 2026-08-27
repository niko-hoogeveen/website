import React from "react";
import {
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaPhp,
  FaGit,
} from "react-icons/fa";
import { TbBrandReactNative } from "react-icons/tb";
import { RiNextjsFill } from "react-icons/ri";
import { DiDocker } from "react-icons/di";

// I want an array of technologies -> each one should have a name and logo

interface Technology {
  name: string;
  logo: React.ReactNode;
}

const size = 48;

const technologies: Technology[] = [
  {
    name: "PHP",
    logo: <FaPhp size={size} color="#777BB4" />,
  },
  {
    name: "JavaScript",
    logo: <FaJs size={size} color="#F0DB4F" />,
  },
  {
    name: "HTML5",
    logo: <FaHtml5 size={size} color="#E34F26" />,
  },
  {
    name: "CSS3",
    logo: <FaCss3Alt size={size} color="#1572B6" />,
  },
  {
    name: "React",
    logo: <FaReact size={size} color="#61DAFB" />,
  },
  {
    name: "React Native",
    logo: <TbBrandReactNative size={size} color="#61DAFB" />,
  },
  {
    name: "Git Project Management",
    logo: <FaGit size={size} color="#F1502F" />,
  },
  {
    name: "Docker",
    logo: <DiDocker size={size} color="1D63ED" />
  }
];

export default function Technologies() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
      {technologies.map((tech, idx) => (
        <TechnologyCard key={idx} tech={tech} />
      ))}
    </div>
  );
}

function TechnologyCard({ tech }: { tech: Technology }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out
                 hover:scale-110 hover:shadow-lg cursor-pointer"
    >
      <div className="mb-2">{tech.logo}</div>
      <p className="text-sm font-medium text-center">{tech.name}</p>
    </div>
  );
}
