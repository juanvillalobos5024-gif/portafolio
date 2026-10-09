"use client";
import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import styles from './ProductGallery.module.css';
import CatalogModal from './CatalogModal';
import KidsCatalogModal from './KidsCatalogModal';

interface ProductItem {
  id: string | number;
  name: string;
  label: string;
  image: string;
  alt?: string;
}

export default function ProductGallery({ data }: { data?: any }) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isKidsCatalogOpen, setIsKidsCatalogOpen] = useState(false);

  const defaultProducts = [
    { id: 1, name: "Hamacas", label: "Línea Hotelera Premium", image: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Toallas", label: "Alta Resistencia", image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Telary Kids", label: "Licencias Disney y Nickelodeon", image: "https://images.unsplash.com/photo-1560067174-c5a3a8f37060?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 4, name: "Edredones", label: "Diseño y Durabilidad", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  ];

  const products: ProductItem[] = data?.items && data.items.length > 0 ? data.items : defaultProducts;


  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleOpenCatalog = (e: React.MouseEvent, productName: string) => {
    e.preventDefault();
    if (productName === "Telary Kids") {
      setIsKidsCatalogOpen(true);
    } else {
      setIsCatalogOpen(true);
    }
  };

  return (
    <>
      <section id="productos" className={styles.container}>
        <div className={styles.inner}>
          <h2 className={styles.title}>Muestra de Productos</h2>
          <p className={styles.subtitle}>Un vistazo a nuestras colecciones más destacadas antes de explorar el catálogo.</p>
          
          <div className={styles.carouselContainer}>
            <button className={styles.navButton} onClick={prevSlide} aria-label="Anterior">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            
            <div className={styles.carousel}>
              {products.map((product, index) => {
                const isActive = index === activeIndex;
                let offset = index - activeIndex;
                
                if (offset > Math.floor(products.length / 2)) offset -= products.length;
                if (offset < -Math.floor(products.length / 2)) offset += products.length;
                
                const absOffset = Math.abs(offset);
                const isHidden = absOffset > 2;

                const translateX = offset * 260; // Distance between items
                const scale = isActive ? 1 : Math.max(0.7, 1 - absOffset * 0.15);
                const rotateY = isActive ? 0 : offset > 0 ? -15 : 15;
                const zIndex = isActive ? 10 : 5 - absOffset;
                const opacity = isHidden ? 0 : (isActive ? 1 : Math.max(0, 0.8 - absOffset * 0.3));

                return (
                  <motion.div
                    key={product.id}
                    className={styles.carouselItem}
                    onClick={() => setActiveIndex(index)}
                    initial={false}
                    animate={{
                      x: translateX,
                      scale: scale,
                      rotateY: rotateY,
                      zIndex: zIndex,
                      opacity: opacity,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                    style={{
                      pointerEvents: isHidden ? 'none' : 'auto'
                    }}
                  >
                    <a 
                      href="#" 
                      className={styles.galleryItem}
                      aria-label={`Ver colección de ${product.name}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Image 
                        src={product.image}
                        alt={`Colección de ${product.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className={styles.image}
                        loading="lazy"
                      />
                      <div className={styles.itemContent}>
                        <h3 className={styles.itemName}>{product.name}</h3>
                        <p className={styles.itemLabel}>{product.label}</p>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </div>

            <button className={styles.navButton} onClick={nextSlide} aria-label="Siguiente">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DEL CATÁLOGO (LIBRO 3D) */}
      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      <KidsCatalogModal isOpen={isKidsCatalogOpen} onClose={() => setIsKidsCatalogOpen(false)} />
    </>
  );
}
