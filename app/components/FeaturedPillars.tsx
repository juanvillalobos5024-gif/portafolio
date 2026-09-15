"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './FeaturedPillars.module.css';

export default function FeaturedPillars({ data, generalTitle }: { data?: any[], generalTitle?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pillarsData = data || [];

  if (pillarsData.length === 0) return null;

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % pillarsData.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + pillarsData.length) % pillarsData.length);
  };

  return (
    <section className={styles.section} id="pilares">
      <div className={styles.titleContainer}>
        <motion.h2 
          className={styles.mainTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          dangerouslySetInnerHTML={{ __html: generalTitle || 'Tejemos calidad que<br /><span>genera impacto.</span>' }}
        />
      </div>

      <div className={styles.container}>
        {/* Left Side: 3D Stacked Cards */}
        <div className={styles.cardsContainer}>
          <AnimatePresence mode="popLayout">
            {pillarsData.map((pillar, index) => {
              // Calculate relative position based on activeIndex
              let diff = (index - activeIndex + pillarsData.length) % pillarsData.length;
              
              let x = 0;
              let y = 0;
              let scale = 1;
              let zIndex = 10;
              let opacity = 1;
              let rotateY = 0;
              let rotateZ = 0;

              if (diff === 0) {
                x = isMobile ? 0 : 100;
                y = 0;
                scale = 1;
                zIndex = 10;
                opacity = 1;
                rotateY = 0;
                rotateZ = 0;
              } else if (diff === 1) {
                x = isMobile ? -15 : -20;
                y = 20;
                scale = 0.9;
                zIndex = 9;
                opacity = 0.8;
                rotateY = 15;
                rotateZ = -2;
              } else if (diff === 2) {
                x = isMobile ? -50 : -120;
                y = 40;
                scale = 0.8;
                zIndex = 8;
                opacity = 0.6;
                rotateY = 20;
                rotateZ = -4;
              } else if (diff === pillarsData.length - 1) {
                x = isMobile ? -80 : -220;
                y = 60;
                scale = 0.7;
                zIndex = 7;
                opacity = 0.4;
                rotateY = 25;
                rotateZ = -6;
              } else {
                x = isMobile ? -80 : -220;
                y = 60;
                scale = 0.7;
                zIndex = 6;
                opacity = 0;
                rotateY = 25;
                rotateZ = -6;
              }

              return (
                <motion.div
                  key={pillar.id}
                  className={styles.card}
                  onClick={() => setActiveIndex(index)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xPct = (x / rect.width - 0.5) * 2;
                    const yPct = (y / rect.height - 0.5) * 2;
                    e.currentTarget.style.setProperty('--t-x', `${xPct * 15}deg`);
                    e.currentTarget.style.setProperty('--t-y', `${-yPct * 15}deg`);
                    e.currentTarget.style.setProperty('--m-x', `${x}px`);
                    e.currentTarget.style.setProperty('--m-y', `${y}px`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('--t-x', '0deg');
                    e.currentTarget.style.setProperty('--t-y', '0deg');
                  }}
                  initial={false}
                  whileHover={diff !== 0 ? { scale: scale * 1.05, opacity: opacity + 0.2, x: x - (isMobile ? 10 : 20) } : {}}
                  animate={{
                    x: x,
                    y: y,
                    scale: scale,
                    zIndex: zIndex,
                    opacity: opacity,
                    rotateY: rotateY,
                    rotateZ: rotateZ
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: diff === 0 ? `0 30px 60px -15px ${pillar.color}40, inset 0 0 0 1px rgba(255,255,255,0.8)` : "0 10px 30px -10px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.5)",
                    /* border removed to use dynamic shimmer pseudo-border */
                  }}
                >
                  {/* Dynamic Shimmer Border */}
                  {diff === 0 && <div className={styles.cardBorder} />}
                  
                  <div className={styles.cardInner}>
                    {/* Glowing background orbs (Volumetric Depth: Pushed back) */}
                    <div className={styles.cardBg} style={{ background: pillar.color, transform: 'translateZ(-30px)' }}></div>
                    
                    {/* Textures and Shapes (Volumetric Depth: Mid layers) */}
                    <div className={styles.cardPattern} style={{ transform: 'translateZ(-10px)' }}></div>
                    
                    {/* Glass Reflection Slash */}
                    <div className={styles.glassSlash}></div>
                    
                    {/* Huge Number Watermark (Volumetric Depth: Pushed forward) */}
                    <div className={styles.watermark} style={{ transform: 'translateZ(50px)' }}>{pillar.number}</div>
                    
                    {/* Content Container aligned to bottom-left (Volumetric Depth: Floating) */}
                    <div className={styles.cardContent} style={{ transform: 'translateZ(70px)' }}>
                      <div className={styles.cardIconWrapper} style={{ background: `${pillar.color}20`, color: pillar.color }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </div>
                      <h3 className={styles.cardTitle}>{pillar.shortTitle}</h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right Side: Text Content */}
        <div className={styles.textContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
            >
              <motion.div 
                className={styles.subtitle}
                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } } }}
                style={{ color: pillarsData[activeIndex]?.color }}
              >
                {pillarsData[activeIndex]?.subtitle}
              </motion.div>
              
              <motion.h3 
                className={styles.descriptionTitle}
                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, delay: 0.1 } } }}
              >
                {pillarsData[activeIndex]?.title}
              </motion.h3>
              
              <motion.p 
                className={styles.descriptionText}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.2 } } }}
              >
                {pillarsData[activeIndex]?.description}
              </motion.p>
              
              <motion.div 
                className={styles.tagsContainer}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 0.3 } } }}
              >
                {(pillarsData[activeIndex]?.tags || []).map((tag: string, i: number) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </motion.div>

              <div className={styles.controls} style={{ marginTop: '2rem' }}>
                <button className={styles.navButton} onClick={prevCard} aria-label="Anterior"><ChevronLeft size={24} /></button>
                <button className={styles.navButton} onClick={nextCard} aria-label="Siguiente"><ChevronRight size={24} /></button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
