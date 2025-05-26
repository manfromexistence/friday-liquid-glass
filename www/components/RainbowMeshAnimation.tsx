\
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

const RainbowMeshAnimation: React.FC = () => {
  const controls = useAnimation();
  const [hue, setHue] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue((prevHue) => (prevHue + 2) % 360); // Slower base hue rotation
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Effect for the continuous glow animation
  useEffect(() => {
    controls.start({
      boxShadow: [
        `0 0 25px 10px hsla(${hue}, 100%, 75%, 0.6), 0 0 45px 20px hsla(${(hue + 45) % 360}, 100%, 75%, 0.4), 0 0 70px 35px hsla(${(hue + 90) % 360}, 100%, 75%, 0.2)`,
        `0 0 30px 12px hsla(${(hue + 30) % 360}, 100%, 75%, 0.7), 0 0 50px 22px hsla(${(hue + 75) % 360}, 100%, 75%, 0.5), 0 0 80px 40px hsla(${(hue + 120) % 360}, 100%, 75%, 0.3)`,
        `0 0 25px 10px hsla(${(hue + 60) % 360}, 100%, 75%, 0.6), 0 0 45px 20px hsla(${(hue + 105) % 360}, 100%, 75%, 0.4), 0 0 70px 35px hsla(${(hue + 150) % 360}, 100%, 75%, 0.2)`,
      ],
      transition: {
        duration: 2, // Duration for one cycle of boxShadow animation
        repeat: Infinity,
        ease: "linear"
      }
    });
  }, [hue, controls]);


  const handleHoverStart = () => {
    if (isHolding) return;
    controls.start({
      scale: 1.05, // Subtle scale on hover
      transition: { duration: 0.2 },
    });
  };

  const handleHoverEnd = () => {
    if (isHolding) return;
    controls.start({
      scale: 1,
      transition: { duration: 0.2 },
    });
  };

  const handleClick = () => {
    if (isHolding) return; // Don't trigger click if it was a hold release
    controls.start({
      scale: [1, 1.15, 0.95, 1.08, 1],
      rotate: [0, 5, -5, 2, 0],
      transition: { duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1] },
    });
    setHue((prevHue) => (prevHue + 45) % 360); // Faster hue burst on click
  };

  const handleTapStart = () => {
    // Start a timer to detect a "hold"
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      controls.start({
        scale: 1.1, // Scale up more during hold
        transition: { duration: 0.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } // Pulsing scale
      });
      // Optionally, make glow pulse more intensely during hold
      // This would require a separate animation control or state for boxShadow during hold
    }, 200); // 200ms to consider it a hold
  };

  const handleTapEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
      controls.start({ // Return to normal hover state or base state
        scale: 1,
        // Reset boxShadow to the continuous animation if it was changed for hold
        transition: { duration: 0.3 }
      });
      // Re-apply continuous glow if it was overridden by hold
       controls.start({
        boxShadow: [
          `0 0 25px 10px hsla(${hue}, 100%, 75%, 0.6), 0 0 45px 20px hsla(${(hue + 45) % 360}, 100%, 75%, 0.4), 0 0 70px 35px hsla(${(hue + 90) % 360}, 100%, 75%, 0.2)`,
          `0 0 30px 12px hsla(${(hue + 30) % 360}, 100%, 75%, 0.7), 0 0 50px 22px hsla(${(hue + 75) % 360}, 100%, 75%, 0.5), 0 0 80px 40px hsla(${(hue + 120) % 360}, 100%, 75%, 0.3)`,
          `0 0 25px 10px hsla(${(hue + 60) % 360}, 100%, 75%, 0.6), 0 0 45px 20px hsla(${(hue + 105) % 360}, 100%, 75%, 0.4), 0 0 70px 35px hsla(${(hue + 150) % 360}, 100%, 75%, 0.2)`,
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }
      });
    }
  };


  const meshSize = 22; // Slightly larger cells
  const numCols = 12;
  const numRows = 12;
  const width = meshSize * numCols;
  const height = meshSize * numRows;

  return (
    <motion.div
      animate={controls}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      onTapStart={handleTapStart}
      onTapCancel={handleTapEnd} // onTapCancel for when tap is interrupted (e.g. by scrolling)
      onTap={handleTapEnd} // onTap for when tap is completed
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        position: 'relative',
        overflow: 'visible', // Allow glow to spread
        borderRadius: '20px', // Softer rounding
        cursor: 'pointer',
        // Initial boxShadow is now handled by the useEffect animation
      }}
      initial={{
        scale: 1,
      }}
    >
      {Array.from({ length: numRows * numCols }).map((_, i) => {
        const col = i % numCols;
        const row = Math.floor(i / numCols);
        // Enhanced cell hue calculation for more vibrant rainbow mesh
        const cellHue = (hue + (col * 15) + (row * 15) + (col * row * 1.5)) % 360;
        const cellSaturation = 90 + (Math.sin(col + row + hue / 30) * 10); // Vary saturation slightly
        const cellLightness = 65 + (Math.cos(row - col + hue / 20) * 5); // Vary lightness slightly

        return (
          <motion.div
            key={i}
            style={{
              backgroundColor: `hsla(${cellHue}, ${cellSaturation}%, ${cellLightness}%, 0.75)`,
              // Border color also part of the rainbow
              border: `1.5px solid hsla(${(cellHue + 25) % 360}, ${cellSaturation - 10}%, ${cellLightness + 10}%, 0.5)`,
              borderRadius: '2px', // Slightly rounded cells
            }}
            whileHover={{ // Cell-specific hover, subtle
              backgroundColor: `hsla(${(cellHue + 20) % 360}, 100%, 75%, 0.9)`,
              scale: 1.1,
              zIndex: 1,
              transition: { duration: 0.15 }
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
          fontSize: '24px', // Slightly larger text
          pointerEvents: 'none',
          textShadow: '0 0 8px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.5)', // Softer text shadow
        }}
      >
        Animation
      </div>
    </motion.div>
  );
};

export default RainbowMeshAnimation;
