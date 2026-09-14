"use client";
import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import styles from './ProductGallery.module.css';
import CatalogModal from './CatalogModal';
import KidsCatalogModal from './KidsCatalogModal';

export default function ProductGallery() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isKidsCatalogOpen, setIsKidsCatalogOpen] = useState(false);

  const products = [
    { id: 1, name: "Hamacas", label: "Línea Hotelera Premium", image: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Toallas", label: "Alta Resistencia", image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Telary Kids", label: "Licencias Disney y Nickelodeon", image: "https://images.unsplash.com/photo-1560067174-c5a3a8f37060?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 4, name: "Edredones", label: "Diseño y Durabilidad", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  ];

  const reduce = useReducedMotion();

  const handleOpenCatalog = (e: React.MouseEvent, productName: string) => {
    e.preventDefault(); // Evitar que el link cambie la URL
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
          
          <div className={styles.grid}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <a 
                  href="#" 
                  className={styles.galleryItem}
                  aria-label={`Ver colección de ${product.name}`}
                  onClick={(e) => handleOpenCatalog(e, product.name)}
                >
                  <Image 
                    src={product.image}
                    alt={`Colección de ${product.name}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemName}>{product.name}</h3>
                    <p className={styles.itemLabel}>{product.label} &rarr;</p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL DEL CATÁLOGO (LIBRO 3D) */}
      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      <KidsCatalogModal isOpen={isKidsCatalogOpen} onClose={() => setIsKidsCatalogOpen(false)} />
    </>
  );
}
