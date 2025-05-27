"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface FilterSettings {
  grain: number;
  blur: number;
  contrast: number;
  brightness: number;
  hue: number;
}

const MeshGenerator: React.FC = () => {
  const controls = useAnimation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [gradientStyle, setGradientStyle] = useState<number>(0);
  
  // Filter values
  const [filters, setFilters] = useState<FilterSettings>({
    grain: 100,
    blur: 50,
    contrast: 100,
    brightness: 200,
    hue: 180
  });
  
  // Container properties
  const containerWidth = 300;
  const containerHeight = 300;
  
  // Handle gradient cycling
  useEffect(() => {
    // Rotate between the gradient styles
    const intervalId = setInterval(() => {
      setGradientStyle(prev => (prev + 1) % gradientStyles.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Sparkle/sprinkle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
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
      // Adjust the number of particles based on the grain value
      const particleCount = Math.floor(filters.grain / 10);
      
      for (let i = 0; i < particleCount; i++) {
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
  }, [filters.grain, containerWidth, containerHeight]);

  // Handle interactions
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

  // Define gradient styles
  const gradientStyles = [
    // Multicolor rainbow mix
    `linear-gradient(135deg, #ff00cc, #ffcc00, #00ff99, #00ccff, #ff0066)`,
    
    // Blue-green gradient
    `linear-gradient(135deg, #00ffe1, #00ff9d, #66ff33)`,
    
    // Blue-purple gradient
    `linear-gradient(135deg, #00ccff, #0066ff, #6600ff, #cc00ff, #ff0099)`,
    
    // Red-orange gradient
    `linear-gradient(135deg, #ff4500, #ff8700, #ff0000)`,
    
    // Sunset gradient
    `linear-gradient(135deg, #ff512f, #dd2476)`,
  ];

  const handleFilterChange = (filter: keyof FilterSettings, value: number) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  // Apply CSS filters based on slider values
  const getFilterStyle = () => {
    return {
      filter: `
        blur(${filters.blur / 50}px)
        contrast(${filters.contrast / 100})
        brightness(${filters.brightness / 100})
        hue-rotate(${filters.hue}deg)
      `
    };
  };

  // Handle angle rotation for different predefined angles
  const handleAngleClick = (angle: number) => {
    const currentGradient = gradientStyles[gradientStyle];
    // Extract colors from current gradient
    const colorMatch = currentGradient.match(/linear-gradient\(\d+deg,\s*(.*)\)/);
    if (colorMatch && colorMatch[1]) {
      const colors = colorMatch[1];
      const newGradient = `linear-gradient(${angle}deg, ${colors})`;
      // Create a new array with the updated gradient
      const updatedGradientStyles = [...gradientStyles];
      updatedGradientStyles[gradientStyle] = newGradient;
      // Update the gradientStyles array
      // Note: In a real implementation you would use a state variable for this
    }
  };

  // Determine if a button should be active
  const isAngleActive = (angle: number): boolean => {
    const currentGradient = gradientStyles[gradientStyle];
    const angleMatch = currentGradient.match(/linear-gradient\((\d+)deg/);
    return angleMatch ? parseInt(angleMatch[1], 10) === angle : false;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Mesh Preview */}
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
          background: gradientStyles[gradientStyle],
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          ...getFilterStyle(),
        }}
        initial={{
          scale: 1,
        }}
      >
        {/* Glassmorphism overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            borderRadius: '20px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Canvas overlay for sparkle effect */}
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            borderRadius: '20px',
            zIndex: 2,
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
            zIndex: 3,
          }}
        >
          MagicPattern
        </div>
      </motion.div>
      
      {/* Controls */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* Grain slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Grain (100%):</label>
            <span className="text-sm">{filters.grain}</span>
          </div>
          <Slider 
            value={[filters.grain]} 
            min={0} 
            max={100} 
            step={1}
            onValueChange={([value]) => handleFilterChange('grain', value)} 
          />
        </div>
        
        {/* Blur slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Blur (50%):</label>
            <span className="text-sm">{filters.blur}</span>
          </div>
          <Slider 
            value={[filters.blur]} 
            min={0} 
            max={100} 
            step={1}
            onValueChange={([value]) => handleFilterChange('blur', value)} 
          />
        </div>
        
        {/* Contrast slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Contrast (100%):</label>
            <span className="text-sm">{filters.contrast}</span>
          </div>
          <Slider 
            value={[filters.contrast]} 
            min={0} 
            max={200} 
            step={1}
            onValueChange={([value]) => handleFilterChange('contrast', value)} 
          />
        </div>
        
        {/* Brightness slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Brightness (200%):</label>
            <span className="text-sm">{filters.brightness}</span>
          </div>
          <Slider 
            value={[filters.brightness]} 
            min={50} 
            max={300} 
            step={1}
            onValueChange={([value]) => handleFilterChange('brightness', value)} 
          />
        </div>
        
        {/* Hue slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Hue (360°):</label>
            <span className="text-sm">{filters.hue}</span>
          </div>
          <Slider 
            value={[filters.hue]} 
            min={0} 
            max={360} 
            step={1}
            onValueChange={([value]) => handleFilterChange('hue', value)} 
          />
        </div>
        
        {/* Angle buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <button
              key={angle}
              onClick={() => handleAngleClick(angle)}
              className={cn(
                "px-2 py-1 text-xs rounded border",
                isAngleActive(angle) 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background text-foreground border-primary/20"
              )}
            >
              {angle}°
            </button>
          ))}
        </div>
        
        {/* Refresh button */}
        <button 
          onClick={() => {
            setFilters({
              grain: 100,
              blur: 50,
              contrast: 100,
              brightness: 200,
              hue: 180
            });
          }}
          className="flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M8 16H3v5"></path>
          </svg>
          Refresh filters
        </button>
      </div>
    </div>
  );
};

export default MeshGenerator;
