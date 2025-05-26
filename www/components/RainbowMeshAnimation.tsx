"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RainbowMeshAnimation: React.FC = () => {
  const controls = useAnimation();
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoverStart = () => {
    if (isHolding) return;
    controls.start({
      scale: 1.05,
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
    if (isHolding) return;
    controls.start({
      scale: [1, 1.15, 0.95, 1.08, 1],
      rotate: [0, 5, -5, 2, 0],
      transition: { duration: 0.4, times: [0, 0.2, 0.5, 0.8, 1] },
    });
  };

  const handleTapStart = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      controls.start({
        scale: 1.1,
        transition: { duration: 0.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
      });
    }, 200);
  };

  const handleTapEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
      controls.start({
        scale: 1,
        transition: { duration: 0.3 }
      });
    }
  };

  const containerWidth = 264;
  const containerHeight = 264;

  return (
    <>
      <motion.div
        className="animated-mesh-glow"
        animate={controls}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onClick={handleClick}
        onTapStart={handleTapStart}
        onTapCancel={handleTapEnd}
        onTap={handleTapEnd}
        style={{
          width: containerWidth,
          height: containerHeight,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          cursor: 'pointer',
          background: `radial-gradient(circle at 20% 30%, #ff00cc 0%, transparent 60%),
                      radial-gradient(circle at 80% 20%, #ffcc00 0%, transparent 60%),
                      radial-gradient(circle at 60% 80%, #00ff99 0%, transparent 60%),
                      radial-gradient(circle at 30% 70%, #00ccff 0%, transparent 60%),
                      radial-gradient(circle at 70% 60%, #ff0066 0%, transparent 60%)`,
          backgroundColor: '#222',
        }}
        initial={{
          scale: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
            pointerEvents: 'none',
            textShadow: '0 0 8px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.5)',
          }}
        >
          Animation
        </div>
      </motion.div>
    </>
  );
};

export default RainbowMeshAnimation;
