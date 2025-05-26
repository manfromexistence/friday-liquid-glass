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
      <style jsx global>{`
        @property --c-0 { syntax: '<color>'; inherits: false; initial-value: hsla(267,52%,83%,1); }
        @property --s-start-0 { syntax: '<percentage>'; inherits: false; initial-value: 9%; }
        @property --s-end-0 { syntax: '<percentage>'; inherits: false; initial-value: 55%; }
        @property --x-0 { syntax: '<percentage>'; inherits: false; initial-value: 85%; }
        @property --y-0 { syntax: '<percentage>'; inherits: false; initial-value: 80%; }
        @property --c-1 { syntax: '<color>'; inherits: false; initial-value: hsla(336,100%,82%,1); }
        @property --s-start-1 { syntax: '<percentage>'; inherits: false; initial-value: 5%; }
        @property --s-end-1 { syntax: '<percentage>'; inherits: false; initial-value: 72%; }
        @property --x-1 { syntax: '<percentage>'; inherits: false; initial-value: 60%; }
        @property --y-1 { syntax: '<percentage>'; inherits: false; initial-value: 24%; }
        @property --c-2 { syntax: '<color>'; inherits: false; initial-value: hsla(54,100%,65%,0.49); }
        @property --s-start-2 { syntax: '<percentage>'; inherits: false; initial-value: 5%; }
        @property --s-end-2 { syntax: '<percentage>'; inherits: false; initial-value: 52%; }
        @property --x-2 { syntax: '<percentage>'; inherits: false; initial-value: 13%; }
        @property --y-2 { syntax: '<percentage>'; inherits: false; initial-value: 82%; }
        @property --c-3 { syntax: '<color>'; inherits: false; initial-value: hsla(299,72%,68%,1); }
        @property --s-start-3 { syntax: '<percentage>'; inherits: false; initial-value: 13%; }
        @property --s-end-3 { syntax: '<percentage>'; inherits: false; initial-value: 68%; }
        @property --x-3 { syntax: '<percentage>'; inherits: false; initial-value: 24%; }
        @property --y-3 { syntax: '<percentage>'; inherits: false; initial-value: 7%; }

        @keyframes hero-gradient-animation {
          0% {
            --c-0: hsla(267,52%,83%,1); --s-start-0:9%; --s-end-0:55%; --x-0:85%; --y-0:80%;
            --s-start-1:5%; --s-end-1:72%; --x-1:60%; --c-1:hsla(336,100%,82%,1); --y-1:24%;
            --x-2:13%; --y-2:82%; --s-start-2:5%; --s-end-2:52%; --c-2:hsla(54,100%,65%,0.49);
            --x-3:24%; --c-3:hsla(299,72%,68%,1); --y-3:7%; --s-start-3:13%; --s-end-3:68%;
          }
          100% {
            --c-0: hsla(267,52%,83%,1); --s-start-0:9%; --s-end-0:55%; --x-0:31%; --y-0:94%;
            --s-start-1:5%; --s-end-1:72%; --x-1:2%; --c-1:hsla(337,82%,95%,1); --y-1:25%;
            --x-2:98%; --y-2:20%; --s-start-2:5%; --s-end-2:52%; --c-2:hsla(54,100%,65%,0.49);
            --x-3:95%; --c-3:hsla(299,72%,68%,1); --y-3:92%; --s-start-3:13%; --s-end-3:68%;
          }
        }

        .hero-gradient-animated-mesh {
          background-color: hsla(0,0%,0%,0.05);
          background-image:
            radial-gradient(circle at var(--x-0) var(--y-0), var(--c-0) var(--s-start-0), transparent var(--s-end-0)),
            radial-gradient(circle at var(--x-1) var(--y-1), var(--c-1) var(--s-start-1), transparent var(--s-end-1)),
            radial-gradient(circle at var(--x-2) var(--y-2), var(--c-2) var(--s-start-2), transparent var(--s-end-2)),
            radial-gradient(circle at var(--x-3) var(--y-3), var(--c-3) var(--s-start-3), transparent var(--s-end-3));
          animation: hero-gradient-animation 10s linear infinite alternate;
        }
      `}</style>
      <motion.div
        className="hero-gradient-animated-mesh"
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
