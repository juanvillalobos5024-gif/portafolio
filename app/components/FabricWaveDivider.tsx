"use client";

export default function FabricWaveDivider() {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        bottom: -2, 
        left: 0, 
        width: '100%', 
        overflow: 'hidden', 
        lineHeight: 0, 
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        style={{ display: 'block', width: '100%', height: '122px' }}
      >
        {/* Pliegue de tela trasero (Beige de la marca) */}
        <path 
          d="M0,20 C400,120 800,0 1200,50 L1200,122 L0,122 Z" 
          fill="rgba(192, 168, 127, 0.4)" /* Equivalente a var(--contex-beige) con opacidad */
        />
        
        {/* Pliegue de tela intermedio (Verde Limón de la marca) */}
        <path 
          d="M0,50 C300,0 900,120 1200,30 L1200,122 L0,122 Z" 
          fill="rgba(209, 230, 22, 0.3)" /* Equivalente a var(--contex-green) con opacidad */
        />
        
        {/* Pliegue principal (Conecta perfectamente con el fondo oscuro de la página) */}
        <path 
          d="M0,80 C400,130 800,20 1200,70 L1200,122 L0,122 Z" 
          fill="var(--background)" 
        />
      </svg>
    </div>
  );
}
