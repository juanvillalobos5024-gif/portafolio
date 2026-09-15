"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './FeaturedPillars.module.css';

export default function FeaturedPillars({ data }: { data?: any[] }) {
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
        >
          Tejemos calidad que<br /><span>genera impacto.</span>
        </motion.h2>
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
                  initial={false}
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
                    background: "white",
                    boxShadow: diff === 0 ? `0 20px 40px ${pillar.color}20` : "0 4px 12px rgba(0,0,0,0.05)",
                    border: diff === 0 ? `1px solid ${pillar.color}40` : "1px solid #e2e8f0"
                  }}
                >
                  <div className={styles.cardBg} style={{ background: pillar.color }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
                    <div className={styles.watermark}>{pillar.number}</div>
                    <h3 className={styles.cardTitle}>{pillar.shortTitle}</h3>
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
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {pillarsData[activeIndex]?.subtitle}
              </motion.div>
              
              <motion.h3 
                className={styles.descriptionTitle}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {pillarsData[activeIndex]?.title}
              </motion.h3>
              
              <motion.p 
                className={styles.descriptionText}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {pillarsData[activeIndex]?.description}
              </motion.p>
              
              <motion.div 
                className={styles.tagsContainer}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {(pillarsData[activeIndex]?.tags || []).map((tag: string, i: number) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <div className={styles.controls}>
            <button className={styles.navButton} onClick={prevCard} aria-label="Anterior"><ChevronLeft size={24} /></button>
            <button className={styles.navButton} onClick={nextCard} aria-label="Siguiente"><ChevronRight size={24} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
