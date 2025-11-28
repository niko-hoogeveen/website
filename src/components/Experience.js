// src/components/Experience.js
import React, { useState } from 'react';

function Experience() {
  const experiences = [
    {
      title: 'Job Title #1',
      summary: 'Brief summary of role #1',
      details: 'Detailed description of role #1: what you did, technologies used, etc.',
    },
    {
      title: 'Job Title #2',
      summary: 'Brief summary of role #2',
      details: 'Detailed description of role #2...',
    },
    {
      title: 'Job Title #3',
      summary: 'Brief summary of role #3',
      details: 'Detailed description of role #3...',
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
      <h2>Past Experience</h2>
      {experiences.map((exp, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer', marginBottom: '10px' }}
          onClick={() => toggleDetails(index)}
        >
          <h3>{exp.title}</h3>
          <p>{exp.summary}</p>
          {expandedIndex === index && (
            <p>{exp.details}</p>
          )}
        </div>
      ))}
    </section>
  );
}

export default Experience;
