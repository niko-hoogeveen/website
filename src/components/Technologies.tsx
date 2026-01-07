import React from "react";
import { FaNodeJs, /*FaHtml5, FaPython, FaCss3,*/ FaPhp, FaGit } from "react-icons/fa";
//import { IoLogoJavascript } from "react-icons/io";
import { RiNextjsFill } from "react-icons/ri";

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
    name: "Git Project Management",
    logo: <FaGit size={size} color="#F1502F" />,
  },
  {
    name: "NextJS",
    logo: <RiNextjsFill size={size} color="#FFFFFF" />,
  },
  // {
  //   name: "Javascript",
  //   logo: <IoLogoJavascript size={size} color="#F0DB4F" />,
  // },
  {
    name: "NodeJS",
    logo: <FaNodeJs size={size} color="#68A063" />,
  },
  // {
  //   name: "HTML5",
  //   logo: <FaHtml5 size={size} color="#E34F26" />,
  // },
  // {
  //   name: "CSS3",
  //   logo: <FaCss3 size={size} color="#1572B6" />,
  // },
  // {
  //   name:"Python",
  //   logo: <FaPython size={size} color="#4B8BBE" />
  // }
];

export default function Technologies() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap- justify-items-center">
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
      <p className="text-sm font-medium">{tech.name}</p>
    </div>
  );
}
