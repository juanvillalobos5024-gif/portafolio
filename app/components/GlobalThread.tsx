"use client";
import { useState, useEffect } from 'react';
import { motion, useScroll, useReducedMotion } from "motion/react";

export default function GlobalThread() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        style={{ width: '100%', height: '100%', display: 'block', position: 'absolute' }}
      >
        <motion.path 
          d="M 20,0 C 80,25 10,45 60,70 C 110,95 20,95 10,100" 
          fill="none" 
          stroke="var(--contex-green)" 
          strokeWidth="2.5" 
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? 1 : scrollYProgress, opacity: 0.8 }} 
        />
        
        <motion.path 
          d="M 80,0 C 20,20 100,50 30,75 C -20,100 80,90 90,100" 
          fill="none" 
          stroke="var(--contex-beige)" 
          strokeWidth="1.5" 
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? 1 : scrollYProgress, opacity: 0.5 }} 
        />

        <motion.path 
          d="M 50,0 C -10,30 110,60 50,85 C -10,110 50,100 50,100" 
          fill="none" 
          stroke="rgba(255,255,255,0.15)" 
          strokeWidth="1" 
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? 1 : scrollYProgress }} 
        />
      </svg>
    </div>
  );
}
