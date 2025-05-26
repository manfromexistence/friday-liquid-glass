"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RainbowMeshAnimation: React.FC = () => {
  const controls = useAnimation();
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gradientStyle, setGradientStyle] = useState<number>(0);
  
  // Handle gradient cycling
  useEffect(() => {
    // Rotate between the three gradient styles you provided
    const intervalId = setInterval(() => {
      setGradientStyle(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Sparkle/sprinkle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container, not window
    canvas.width = containerWidth; 
    canvas.height = containerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacityChange: number;
    }> = [];
    
    const createParticles = () => {
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1 - 0.5,
          opacity: Math.random() * 0.5,
          opacityChange: Math.random() * 0.01
        });
      }
    };
    
    createParticles();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityChange;
        
        if (p.opacity > 0.8 || p.opacity < 0.1) {
          p.opacityChange = -p.opacityChange;
        }
        
        // Reset particle within canvas bounds
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          particles[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5,
            opacityChange: Math.random() * 0.01
          };
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [containerWidth, containerHeight]); // Add dependencies

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

  // Define gradient styles based on the images you provided
  const gradientStyles = [
    // First image - multicolor rainbow mix
    `linear-gradient(135deg, #ff00cc, #ffcc00, #00ff99, #00ccff, #ff0066)`,
    
    // Second image - blue-green gradient
    `linear-gradient(135deg, #00ffe1, #00ff9d, #66ff33)`,
    
    // Third image - blue-purple gradient
    `linear-gradient(135deg, #00ccff, #0066ff, #6600ff, #cc00ff, #ff0099)`
  ];

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
          overflow: 'hidden', // Important for keeping canvas and overlays contained
          borderRadius: '20px',
          cursor: 'pointer',
          background: gradientStyles[gradientStyle], // Dynamic gradient
          // Glassmorphism base styles (applied to the main div)
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
        initial={{
          scale: 1,
        }}
      >
        {/* Glassmorphism overlay - creates the blurred background effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lighten for glass effect
            backdropFilter: 'blur(5px)', // Adjust blur amount as needed
            WebkitBackdropFilter: 'blur(5px)', // Safari support
            borderRadius: '20px', // Match parent
            pointerEvents: 'none', // Allow interaction with elements below
            zIndex: 1, // Ensure it's above the background but below content
          }}
        />

        {/* Canvas overlay for sparkle effect */}
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', // Make canvas fill the container
            height: '100%',// Make canvas fill the container
            pointerEvents: 'none',
            borderRadius: '20px', // Match parent
            zIndex: 2, // Sparkles on top of glassmorphism
          }}
        />
        
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
            zIndex: 3, // Text on top of everything
          }}
        >
          Animation
        </div>
      </motion.div>
    </>
  );
};

export default RainbowMeshAnimation;
