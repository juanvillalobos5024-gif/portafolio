"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export default function LoomDivider() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // El dibujo se completa en los primeros 400px de scroll
  const drawLine = useTransform(scrollY, [0, 400], [0, 1]);

  // Diseño estructurado y minimalista: 9 hilos que forman una torsión/reloj de arena en el centro
  // M 0,start Y C 300,start Y 500,70 600,70 C 700,70 900,end Y 1200,end Y
  const threads = [
    { id: 1, startY: 10,  endY: 130, color: 'rgba(255, 255, 255, 0.1)', width: 1,   opacity: 0.5 },
    { id: 2, startY: 25,  endY: 115, color: 'var(--contex-green)',      width: 2.5, opacity: 0.9 },
    { id: 3, startY: 40,  endY: 100, color: 'rgba(255, 255, 255, 0.2)', width: 1.5, opacity: 0.6 },
    { id: 4, startY: 55,  endY: 85,  color: 'var(--contex-beige)',      width: 2,   opacity: 0.8 },
    { id: 5, startY: 70,  endY: 70,  color: 'var(--contex-green)',      width: 4,   opacity: 1 }, // Hilo central directo
    { id: 6, startY: 85,  endY: 55,  color: 'rgba(255, 255, 255, 0.1)', width: 1,   opacity: 0.5 },
    { id: 7, startY: 100, endY: 40,  color: 'var(--contex-beige)',      width: 2,   opacity: 0.7 },
    { id: 8, startY: 115, endY: 25,  color: 'rgba(255, 255, 255, 0.3)', width: 1.5, opacity: 0.8 },
    { id: 9, startY: 130, endY: 10,  color: 'rgba(209, 230, 22, 0.4)',  width: 2,   opacity: 0.6 },
  ];

  return (
    <div 
      style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        height: '140px', 
        zIndex: 10, 
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <svg 
        viewBox="0 0 1200 140" 
        preserveAspectRatio="none" 
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {threads.map(thread => {
          // Curva Bézier simétrica perfecta que se cruza en X=600, Y=70
          const d = thread.startY === 70 
            ? `M0,70 L1200,70` // Línea recta central
            : `M0,${thread.startY} C300,${thread.startY} 500,70 600,70 C700,70 900,${thread.endY} 1200,${thread.endY}`;
          
          return (
            <motion.path
              key={thread.id}
              d={d}
              fill="none"
              stroke={thread.color}
              strokeWidth={thread.width}
              strokeLinecap="round"
              style={{ 
                pathLength: reduce ? 1 : drawLine, 
                opacity: thread.opacity 
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
