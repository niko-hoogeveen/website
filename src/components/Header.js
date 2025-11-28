import React from "react";

function Header() {
  return (
    <header className="p-4 bg-gray-800 text-white flex flex-col items-center">
      <h1>Niko Hoogeveen</h1>
      <h2>Software Engineer</h2>
      <nav>
        <a
          href="https://www.linkedin.com/in/niko-hoogeveen-52b7a9205/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="mailto:niko.hoogeveen@gmail.com">Email</a>
        <a
          href="https://github.com/niko-hoogeveen"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

const style = {
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default Header;
