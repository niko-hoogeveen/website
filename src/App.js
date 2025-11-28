import React from 'react';
import Header from './components/Header';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Experience />
      <Projects />
      <Chatbot />
    </div>
  );
}

export default App;
