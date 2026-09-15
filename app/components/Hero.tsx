"use client";
import { useState } from 'react';
import Image from 'next/image';
import FabricWaveDivider from './FabricWaveDivider';
import styles from './Hero.module.css';
import CatalogModal from './CatalogModal';
import KidsCatalogModal from './KidsCatalogModal';
import ContactTicker from './ContactTicker';

export default function Hero({ data }: { data?: any }) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isKidsCatalogOpen, setIsKidsCatalogOpen] = useState(false);

  return (
    <section id="inicio" className={styles.heroContainer}>
      {/* Imagen de fondo (Optimizada por Next.js) */}
      <Image
        src={data?.bgImage || "/hero.contex.jpg"}
        alt={data?.alt || "Proceso de fabricación textil Contex"}
        fill
        className={styles.backgroundImage}
        priority
      />
      
      {/* Capa oscura para dar contraste al texto */}
      <div className={styles.overlay}></div>
      
      {/* Contenido principal */}
      <div className={styles.content}>
        <div className={styles.heroLogoWrapper}>
          <Image
            src="/logo-contex.png"
            alt="Logotipo principal de CONTEX Compañía Nacional de Textiles S.A.S."
            width={600}
            height={180}
            className={styles.heroLogo}
            priority
          />
        </div>
        <div className={styles.textContent}>
          <h2 className={styles.heroSubHeading}>{data?.title || "Innovación y excelencia textil."}</h2>
          {data?.subtitle ? (
            <div className={styles.subtitle} dangerouslySetInnerHTML={{ __html: data.subtitle }} />
          ) : (
            <p className={styles.subtitle}>Descubre nuestros catálogos de alta calidad para la industria hotelera.</p>
          )}
        </div>
        
        <div className={styles.buttonContainer}>
          <button onClick={() => setIsCatalogOpen(true)} className={styles.btnPrimary}>Catálogo Principal</button>
          <button onClick={() => setIsKidsCatalogOpen(true)} className={styles.btnSecondary}>Catálogo Infantil</button>
        </div>

        {/* Break out of container to be full width, but keep natural flow margin */}
        <div style={{ marginTop: '3rem', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
          <ContactTicker />
        </div>
      </div>
      
      {/* Divisor suave estilo tela (Pliegues superpuestos) */}
      {/* Divisor suave estilo tela (Pliegues superpuestos) */}
      <FabricWaveDivider />

      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      <KidsCatalogModal isOpen={isKidsCatalogOpen} onClose={() => setIsKidsCatalogOpen(false)} />
    </section>
  );
}
