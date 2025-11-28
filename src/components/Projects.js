// src/components/Projects.js
import React, { useState } from 'react';

function Projects() {
  const projects = [
    {
      title: 'Project #1',
      summary: 'Short summary of project #1',
      details: 'Detailed info about project #1: goals, tech stack, challenges, etc.',
    },
    {
      title: 'Project #2',
      summary: 'Short summary of project #2',
      details: 'Detailed info about project #2...',
    },
    {
      title: 'Project #3',
      summary: 'Short summary of project #3',
      details: 'Detailed info about project #3...',
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleDetails = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <section>
      <h2>Projects</h2>
      {projects.map((project, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer', marginBottom: '10px' }}
          onClick={() => toggleDetails(index)}
        >
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          {expandedIndex === index && (
            <p>{project.details}</p>
          )}
        </div>
      ))}
    </section>
  );
}

export default Projects;
