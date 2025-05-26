"use client"

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RainbowMeshAnimation: React.FC = () => {
  const controls = useAnimation();
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue((prevHue) => (prevHue + 5) % 360);
    }, 100); // Adjust speed of rainbow color change
    return () => clearInterval(interval);
  }, []);

  const handleHoverStart = () => {
    controls.start({
      scale: 1.1,
      boxShadow: `0 0 30px 15px hsla(${hue}, 100%, 70%, 0.7), 0 0 50px 25px hsla(${(hue + 60) % 360}, 100%, 70%, 0.5)`,
      transition: { duration: 0.3 },
    });
  };

  const handleHoverEnd = () => {
    controls.start({
      scale: 1,
      boxShadow: `0 0 20px 10px hsla(${hue}, 100%, 70%, 0.5), 0 0 35px 15px hsla(${(hue + 60) % 360}, 100%, 70%, 0.3)`,
      transition: { duration: 0.3 },
    });
  };

  const handleClick = () => {
    controls.start({
      scale: [1, 1.2, 0.9, 1.05, 1],
      rotate: [0, 10, -10, 5, 0],
      transition: { duration: 0.5, times: [0, 0.2, 0.5, 0.8, 1] },
    });
     // Cycle hue faster on click for a burst effect
    setHue((prevHue) => (prevHue + 60) % 360);
  };

  const meshSize = 20; // Size of each mesh square
  const numCols = 10;
  const numRows = 10;
  const width = meshSize * numCols;
  const height = meshSize * numRows;

  return (
    <motion.div
      animate={controls}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        position: 'relative',
        overflow: 'hidden', // To contain the glow
        borderRadius: '15px',
        cursor: 'pointer',
        boxShadow: `0 0 20px 10px hsla(${hue}, 100%, 70%, 0.5), 0 0 35px 15px hsla(${(hue + 60) % 360}, 100%, 70%, 0.3)`, // Initial glow
      }}
      initial={{
        scale: 1,
        boxShadow: `0 0 20px 10px hsla(${hue}, 100%, 70%, 0.5), 0 0 35px 15px hsla(${(hue + 60) % 360}, 100%, 70%, 0.3)`,
      }}
    >
      {Array.from({ length: numRows * numCols }).map((_, i) => {
        const col = i % numCols;
        const row = Math.floor(i / numCols);
        const cellHue = (hue + (col * 10) + (row * 10)) % 360; // Vary hue across cells
        return (
          <motion.div
            key={i}
            style={{
              backgroundColor: `hsla(${cellHue}, 100%, 70%, 0.6)`,
              border: `1px solid hsla(${(cellHue + 20) % 360}, 100%, 80%, 0.3)`,
            }}
            whileHover={{
              backgroundColor: `hsla(${(cellHue + 30) % 360}, 100%, 80%, 0.9)`,
              transition: { duration: 0.1 }
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px',
          pointerEvents: 'none', // So it doesn't interfere with parent's click
          textShadow: '0 0 5px black, 0 0 10px black',
        }}
      >
        Animation
      </div>
    </motion.div>
  );
};

export default RainbowMeshAnimation;
