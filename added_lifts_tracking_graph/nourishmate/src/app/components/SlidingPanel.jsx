"use client";
import React, { useState, useEffect } from 'react';
import '../globals.css';

function SlidingPanel() {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Manage visibility
  const panels = [
    {
      title: 'Panel 1',
      content: 'This is the content of panel 1',
      image: 'https://via.placeholder.com/300?text=Panel+1',
    },
    {
      title: 'Panel 2',
      content: 'This is the content of panel 2',
      image: 'https://via.placeholder.com/300?text=Panel+2',
    },
    {
      title: 'Panel 3',
      content: 'This is the content of panel 3',
      image: 'https://via.placeholder.com/300?text=Panel+3',
    },
  ];

  // Define a ref to hold the interval ID
  const intervalRef = React.useRef();

  useEffect(() => {
    startInterval(); // Start the interval when the component mounts

    return () => clearInterval(intervalRef.current); // Clear interval on unmount
  }, []);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      handleNextPanel();
    }, 3000); // Change panel every 3 seconds
  };

  const handleNextPanel = () => {
    setIsAnimating(true);
    setIsVisible(false); // Hide content before changing panel

    setTimeout(() => {
      setCurrentPanel((prevPanel) => (prevPanel + 1) % panels.length);
      setIsVisible(true); // Show content after changing panel
    }, 500); // Delay matches the fade out duration
  };

  const goToNextPanel = () => {
    clearInterval(intervalRef.current); // Clear the existing interval
    handleNextPanel(); // Transition to the next panel immediately
    startInterval(); // Start a new interval
  };

  const goToPreviousPanel = () => {
    clearInterval(intervalRef.current); // Clear the existing interval
    setIsAnimating(true);
    setIsVisible(false); // Hide content before changing panel

    setTimeout(() => {
      setCurrentPanel((prevPanel) => (prevPanel - 1 + panels.length) % panels.length);
      setIsVisible(true); // Show content after changing panel
    }, 500); // Delay matches the fade out duration

    startInterval(); // Start a new interval after navigating
  };

  return (
    <div className="sliding-panel">
      <button className="panel-button" onClick={goToPreviousPanel}>Previous</button>
      <div
        className={`main-panel ${isAnimating ? 'fade' : ''}`}
        style={{ opacity: isVisible ? 1 : 0 }} // Control visibility via inline style
      >
        <h2>{panels[currentPanel].title}</h2>
        <img src={panels[currentPanel].image} alt={panels[currentPanel].title} />
        <p>{panels[currentPanel].content}</p>
      </div>
      <button className="panel-button" onClick={goToNextPanel}>Next</button>
    </div>
  );
}

export default SlidingPanel;
