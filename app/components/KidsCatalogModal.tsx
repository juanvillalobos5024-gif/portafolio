"use client";
import React, { useEffect, useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './CatalogModal.module.css';
import { playPageTurnSound } from '../utils/audio';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number; isCover?: boolean; isRight?: boolean; isLeft?: boolean }>(
  (props, ref) => {
    return (
      <div 
        className={`${styles.page} ${props.isCover ? styles.cover : ''} ${props.isRight ? styles.pageRight : ''} ${props.isLeft ? styles.pageLeft : ''}`} 
        ref={ref}
        style={props.isCover ? { padding: 0 } : {}}
      >
        <div className={styles.pageContent} style={props.isCover ? { padding: 0 } : {}}>
          {props.children}
        </div>
        {!props.isCover && (
          <>
            <PageOverlay side={props.isLeft ? 'left' : 'right'} />
            <div className={styles.pageNumber}>{props.number}</div>
          </>
        )}
      </div>
    );
  }
);

Page.displayName = 'Page';

const HoverZoomImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc);
      setCurrentSrc(src);
      setIsFading(true);
      
      // Use setTimeout so we don't accidentally cancel it during rapid renders, 
      // but keep it very short so the CSS transition takes over.
      // Actually, a small delay ensures the browser applies the opacity: 0 first.
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [src]); // Only depend on src so we don't re-trigger and cancel on currentSrc change.

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const x = (e.nativeEvent.offsetX / target.offsetWidth) * 100;
    const y = (e.nativeEvent.offsetY / target.offsetHeight) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const imageStyle = {
    transformOrigin: origin,
    transform: zoom ? 'scale(2)' : 'scale(1)',
    transition: zoom ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-in-out',
    cursor: zoom ? 'crosshair' : 'zoom-in',
    willChange: 'transform, opacity'
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Imagen Anterior (Fading out) */}
      <img 
        src={prevSrc} 
        alt={alt}
        className={className}
        style={{ ...imageStyle, position: 'absolute', top: 0, left: 0, opacity: isFading ? 1 : 0 }}
        draggable={false}
      />
      {/* Imagen Actual (Fading in) */}
      <img 
        src={currentSrc} 
        alt={alt}
        className={className}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        style={{ ...imageStyle, position: 'absolute', top: 0, left: 0, opacity: isFading ? 0 : 1 }}
        draggable={false}
      />
    </div>
  );
};

const PageBackground = ({ side, variant = 'hotelera' }: { side: 'left' | 'right', variant?: 'hotelera' | 'kids' }) => {
  // Efecto de iluminación con brillo sutil y caída de luz en los bordes
  const pageLighting = side === 'left'
    ? 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,1) 70%, rgba(235,235,235,1) 100%)'
    : 'radial-gradient(circle at 60% 50%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,1) 70%, rgba(235,235,235,1) 100%)';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: pageLighting, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Ruido visual / textura de papel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        opacity: 0.04,
        mixBlendMode: 'multiply'
      }}></div>
      
      {/* Gran Monograma de Fondo (Estilo Editorial Premium) */}
      {side === 'left' && variant !== 'kids' && (
        <div style={{ 
          position: 'absolute', 
          bottom: '-3.5rem', 
          right: '1.5rem', 
          fontSize: '18rem', 
          fontWeight: 900, 
          color: 'rgba(15, 23, 42, 0.02)', 
          fontFamily: 'var(--font-playfair)', 
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          C.
        </div>
      )}

      {/* Acento sutil para Kids */}
      {variant === 'kids' && (
        <div style={{ position: 'absolute', bottom: '1rem', right: '3rem', fontSize: '12rem', opacity: 0.02, color: 'var(--contex-dark)', pointerEvents: 'none', userSelect: 'none' }}>
          ★
        </div>
      )}
    </div>
  );
};

const PageOverlay = ({ side }: { side: 'left' | 'right' }) => {
  // Sombra del lomo (spine shadow) pronunciada para efecto 3D
  const spineShadow = side === 'left' 
    ? 'linear-gradient(to right, rgba(0,0,0,0) 88%, rgba(0,0,0,0.06) 94%, rgba(0,0,0,0.3) 100%)'
    : 'linear-gradient(to left, rgba(0,0,0,0) 88%, rgba(0,0,0,0.06) 94%, rgba(0,0,0,0.3) 100%)';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Sombra central de encuadernación */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: spineShadow }}></div>
      
      {/* Highlight del lomo para dar curvatura (lado claro) */}
      <div style={{ position: 'absolute', top: 0, left: side === 'left' ? 'auto' : 0, right: side === 'left' ? 0 : 'auto', width: '2%', height: '100%', background: side === 'left' ? 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4))' : 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.4))' }}></div>
      
      {/* Detalle minimalista superior (Línea más contrastante) */}
      <div style={{ position: 'absolute', top: '2.5rem', left: side === 'left' ? '3rem' : 'auto', right: side === 'right' ? '3rem' : 'auto', width: '3rem', height: '2px', backgroundColor: 'var(--contex-green)', opacity: 0.9 }}></div>
    </div>
  );
};

const DesignSwatch = ({ viewKey, label, imageUrl, selected, onClick, compact = false }: { viewKey: string, label: string, imageUrl: string, selected: boolean, onClick: (e: any) => void, compact?: boolean }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        cursor: 'pointer',
        opacity: selected ? 1 : 0.7,
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        width: compact ? '50px' : '65px',
      }}
    >
      <div style={{
        width: compact ? '44px' : '60px',
        height: compact ? '30px' : '40px',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        borderRadius: '6px',
        border: selected ? '2px solid var(--contex-dark)' : '1px solid #e2e8f0',
        boxShadow: selected ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '0.3rem'
      }}></div>
      <span style={{ 
        fontSize: compact ? '0.55rem' : '0.65rem', 
        textAlign: 'center', 
        color: selected ? 'var(--contex-dark)' : '#64748b',
        fontWeight: selected ? '600' : '400',
        lineHeight: '1.2'
      }}>
        {label}
      </span>
    </div>
  );
};

const DesignPaletteContainer = ({ children, compact = false }: { children: React.ReactNode, compact?: boolean }) => (
  <div style={{ 
    border: '1px solid #f0e6d2', 
    borderRadius: compact ? '8px' : '12px', 
    padding: compact ? '0.5rem' : '1rem', 
    backgroundColor: '#fff', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: compact ? '0.5rem' : '1rem',
    marginTop: '0.5rem',
    position: 'relative',
    zIndex: 100
  }}>
    {children}
  </div>
);

export default function KidsCatalogModal({ isOpen, onClose }: CatalogModalProps) {
  const [mounted, setMounted] = useState(false);
  const [characterViews, setCharacterViews] = useState<Record<string, string>>({});
  const bookRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [catalogData, setCatalogData] = useState<any>({});
  const [catalogSettings, setCatalogSettings] = useState<any>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.kidsCatalog) {
          setCatalogData(data.kidsCatalog);
        }
        if (data.kidsCatalogSettings) {
          setCatalogSettings(data.kidsCatalogSettings);
        }
        setDataLoaded(true);
      })
      .catch(console.error);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowSwipeHint(window.innerWidth <= 768);
    } else {
      document.body.style.overflow = 'auto';
    }

    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const isPortrait = window.innerHeight > window.innerWidth;
        const mobile = window.innerWidth <= 768 || (isPortrait && window.innerHeight <= 768);
        setIsMobile(mobile);
        
        let availableWidth = window.innerWidth;
        let availableHeight = window.innerHeight;
        
        if (mobile && isPortrait) {
          availableWidth = window.innerHeight;
          availableHeight = window.innerWidth;
        }

        const scaleX = (availableWidth * (mobile ? 0.95 : 0.85)) / 1000;
        const scaleY = (availableHeight * 0.95) / 650;
        setScale(Math.min(scaleX, scaleY, 1.2));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);

    return () => { 
      document.body.style.overflow = 'auto'; 
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const baseKidsLicensesData: Record<string, any> = {
    chase: {
      license: "Nickelodeon",
      name: "Chase (Paw Patrol)",
       views: {
        frontal: "/catalogo/infantil/chase/TOALLACHASE1.webp",
        detalle1: "/catalogo/infantil/chase/TOALLACHASE2.webp",
        detalle2: "/catalogo/infantil/chase/TOALLACHASE3.webp"
      }
    },
    skye: {
      license: "Nickelodeon",
      name: "Skye (Paw Patrol)",
      views: {
        frontal: "/catalogo/infantil/skye/TOALLA_SKYE_1.webp",
        detalle1: "/catalogo/infantil/skye/TOALLASKYE2.webp",
        detalle2: "/catalogo/infantil/skye/TOALLASKYE3.webp"
      }
    },
    cars: {
      license: "Disney",
      name: "Cars",
      views: {
        frontal: "/catalogo/infantil/cars/TOALLACARS1.webp",
        detalle1: "/catalogo/infantil/cars/TOALLACARS2.webp",
        detalle2: "/catalogo/infantil/cars/TOALLACARS3.webp"
      }
    },
    marie: {
      license: "Disney",
      name: "Marie (Aristogatos)",
      views: {
        frontal: "/catalogo/infantil/marie/TOALLAMARIE1.webp",
        detalle1: "/catalogo/infantil/marie/TOALLAMARIE2.webp",
        detalle2: "/catalogo/infantil/marie/TOALLAMARIE3.webp"
      }
    },
    mickey: {
      license: "Disney",
      name: "Mickey Mouse",
      views: {
        frontal: "/catalogo/infantil/mickey/TOALLAMICKEY1.webp",
        detalle1: "/catalogo/infantil/mickey/TOALLAMICKEY2.webp",
        detalle2: "/catalogo/infantil/mickey/TOALLAMICKEY3.webp"
      }
    },
    minnie: {
      license: "Disney",
      name: "Minnie Mouse",
      views: {
        frontal: "/catalogo/infantil/minnie/TOALLAMINNIE1.webp",
        detalle1: "/catalogo/infantil/minnie/TOALLAMINNIE2.webp",
        detalle2: "/catalogo/infantil/minnie/TOALLAMINNIE3.webp"
      }
    },
    stitch_nino: {
      license: "Disney",
      name: "Stitch (Azul)",
      views: {
        frontal: "/catalogo/infantil/stitch_nino/TOALLASTITCHNINO1.webp",
        detalle1: "/catalogo/infantil/stitch_nino/TOALLASTITCHNINO2.webp",
        detalle2: "/catalogo/infantil/stitch_nino/TOALLASTITCHNINO3.webp"
      }
    },
    stitch_nina: {
      license: "Disney",
      name: "Angel (Rosa)",
      views: {
        frontal: "/catalogo/infantil/stitch_nina/TOALLASTITCHNINA1.webp",
        detalle1: "/catalogo/infantil/stitch_nina/TOALLASTITCHNINA2.webp"
      }
    },
    spiderman: {
      license: "Marvel",
      name: "Spider-Man",
      views: {
        frontal: "/catalogo/infantil/marvel/TOALLASPIDERMAN1.webp",
        detalle1: "/catalogo/infantil/marvel/TOALLASPIDERMAN2.webp",
        detalle2: "/catalogo/infantil/marvel/TOALLASPIDERMAN3.webp"
      }
    },
    spidey: {
      license: "Marvel",
      name: "Spidey",
      views: {
        frontal: "/catalogo/infantil/marvel/TOALLASPIDEY1.webp",
        detalle1: "/catalogo/infantil/marvel/TOALLASPIDEY2.webp",
        detalle2: "/catalogo/infantil/marvel/TOALLASPIDEY3.webp"
      }
    },
    capitan_america: {
      license: "Marvel",
      name: "Capitán América",
      views: {
        frontal: "/catalogo/infantil/marvel/CAPITANAMERICA.webp"
      }
    },
    hulk: {
      license: "Marvel",
      name: "Hulk",
      views: {
        frontal: "/catalogo/infantil/marvel/HULK.webp"
      }
    },
    thor: {
      license: "Marvel",
      name: "Thor",
      views: {
        frontal: "/catalogo/infantil/marvel/THOR.webp"
      }
    },
    ironman_hulk: {
      license: "Marvel",
      name: "Iron Man y Hulk",
      views: {
        frontal: "/catalogo/infantil/marvel/IRONMAN_HULK.webp"
      }
    }
  };

  const kidsLicensesData: Record<string, any> = { ...baseKidsLicensesData };
  Object.keys(catalogData || {}).forEach(key => {
    if (!kidsLicensesData[key]) {
      kidsLicensesData[key] = {
        name: catalogData[key]?.title || key,
        license: "Nueva Colección",
        views: {
          frontal: catalogData[key]?.mainImage || "/catalogo/portada_kids.jpg"
        }
      };
    } else if (catalogData[key]?.mainImage) {
      kidsLicensesData[key].views.frontal = catalogData[key].mainImage;
    }
  });

  const hasIndex = !!catalogSettings?.indexHtml;
  const indexOffset = hasIndex ? 2 : 0;
  const totalPages = 4 + indexOffset + (Object.keys(kidsLicensesData).length * 2);

  return (
    <>
      <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div className={styles.forceLandscape} onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}>
          {isMobile && (
            <div className={`${styles.swipeHintOverlay} ${!showSwipeHint ? styles.hidden : ''}`}>
              <div className={styles.swipeHand}></div>
            </div>
          )}
        <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', display: 'flex', gap: '0.8rem', zIndex: 10000, background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '40px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <a 
            href="/catalogo.pdf" 
            download 
            className={styles.toolButton} 
            aria-label="Descargar PDF"
            style={{ textDecoration: 'none' }}
          >
            📄
          </a>

          <button className={styles.toolButton} onClick={onClose} aria-label="Cerrar catálogo">
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <div 
            className={styles.bookContainer}
            style={!isMobile ? { 
              width: '1000px', 
              height: '650px', 
              transform: `scale(${scale})`, 
              transformOrigin: 'center',
              flexShrink: 0,
              padding: 0,
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
            } : {
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
            }}
          >

          <>
              {/* Botón Prev Visible */}
              <button 
                onClick={(e) => { e.stopPropagation(); bookRef.current?.pageFlip().flipPrev(); }} 
                style={{ position: 'fixed', left: isMobile ? '5px' : '20px', top: '50%', transform: 'translateY(-50%)', width: isMobile ? '36px' : '50px', height: isMobile ? '36px' : '50px', zIndex: 10500, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'background 0.2s', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                aria-label="Página anterior"
              >
                <svg width={isMobile ? '20' : '28'} height={isMobile ? '20' : '28'} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              {/* Botón Next Visible */}
              <button 
                onClick={(e) => { e.stopPropagation(); bookRef.current?.pageFlip().flipNext(); }} 
                style={{ position: 'fixed', right: isMobile ? '5px' : '20px', top: '50%', transform: 'translateY(-50%)', width: isMobile ? '36px' : '50px', height: isMobile ? '36px' : '50px', zIndex: 10500, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'background 0.2s', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                aria-label="Página siguiente"
              >
                <svg width={isMobile ? '20' : '28'} height={isMobile ? '20' : '28'} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              {/* @ts-ignore */}
              <HTMLFlipBook 
                ref={bookRef}
                width={450} 
                height={600} 
                size="stretch"
                minWidth={315}
                maxWidth={600}
                minHeight={420}
                maxHeight={800}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                useMouseEvents={false}
                usePortrait={false}
                className="demo-book"
                onFlip={(e: any) => {
                  setCurrentPage(e.data);
                  setShowSwipeHint(false);
                }}
              >
              {(() => {
                const pages = [];
                // PÁGINA 1 - PORTADA
                pages.push(
                  <Page key="cover" number={1} isCover={true}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${catalogSettings?.coverImage || '/catalogo/portada_kids.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, filter: 'brightness(0.7)' }}></div>
                  </Page>
                );

                if (hasIndex) {
                  pages.push(
                    <Page key="index-left" number={2} isLeft={true}>
                      <PageBackground side="left" variant="kids" />
                    </Page>
                  );
                  pages.push(
                    <Page key="index-right" number={3} isRight={true}>
                      <PageBackground side="right" variant="kids" />
                      <div style={{ position: 'relative', zIndex: 2, padding: '1rem 2rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', color: 'var(--contex-dark)', marginBottom: '1.5rem', borderBottom: '2px solid var(--contex-green)', paddingBottom: '0.5rem', display: 'inline-block' }}>Índice</h2>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#4a5568' }} dangerouslySetInnerHTML={{ __html: catalogSettings.indexHtml }} />
                      </div>
                    </Page>
                  );
                }

                // PÁGINAS DE PERSONAJES
                Object.entries(kidsLicensesData).forEach(([key, data], index) => {
                  const pageIndexOffset = 2 + indexOffset + (index * 2);
                  const currentViewOptions = Object.keys(data.views);
                  const activeView = characterViews[key] || currentViewOptions[0];
                  const imageSrc = data.views[activeView];

                  pages.push(
                    <Page key={`${key}-left`} number={pageIndexOffset} isLeft={true}>
                      <PageBackground side="left" variant="kids" />
                      <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
                        <h2 className={styles.pageTitle}>{data.name}</h2>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '0.4rem', borderRadius: '6px', marginBottom: '0.6rem', marginTop: '0.4rem' }}>
                          <h3 style={{color: 'var(--contex-green)', fontWeight: 'bold', fontSize: '1rem'}}>★ Licencia Oficial: {data.license}</h3>
                        </div>

                        <div className={styles.specsGrid} style={{ marginTop: '0.8rem', marginBottom: '0.8rem' }}>
                          {(catalogData[key]?.features || []).map((feature: any) => (
                            <div className={styles.specCard} key={feature.id}>
                              <span className={styles.specTitle}>{feature.label}</span>
                              <span className={styles.specValue}>{feature.value}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ marginTop: 'auto' }}>
                          <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.4rem' }}>Vistas disponibles:</h3>
                          <DesignPaletteContainer>
                            {currentViewOptions.map(viewKey => (
                               <DesignSwatch 
                                 key={viewKey}
                                 viewKey={viewKey}
                                 label={viewKey === 'frontal' ? 'Diseño 1' : viewKey === 'detalle1' ? 'Diseño 2' : viewKey === 'detalle2' ? 'Diseño 3' : viewKey}
                                 imageUrl={data.views[viewKey as keyof typeof data.views]}
                                 selected={activeView === viewKey}
                                 onClick={(e: any) => { e.stopPropagation(); setCharacterViews(prev => ({...prev, [key]: viewKey})); }}
                               />
                            ))}
                          </DesignPaletteContainer>
                        </div>
                      </div>
                    </Page>
                  );

                  pages.push(
                    <Page key={`${key}-right`} number={pageIndexOffset + 1} isRight={true}>
                      <HoverZoomImage 
                        src={imageSrc} 
                        alt={data.name}
                        className={styles.pageImage}
                      />
                      <PageBackground side="right" variant="kids" />
                      <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'var(--contex-dark)', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px'}}>
                        {data.name}
                      </div>
                    </Page>
                  );
                });

                // CONTRAPORTADA
                const totalRealPages = 2 + indexOffset + (Object.keys(kidsLicensesData).length * 2);
                pages.push(
                  <Page key="backcover" number={totalRealPages} isCover={true}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${catalogSettings?.backCoverImage || '/catalogo/contraportada_kids.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, filter: 'brightness(0.8)' }}></div>
                    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <img src="/logo-contex.png" alt="Contex" style={{ width: '120px', filter: 'brightness(0) invert(1)', marginBottom: '1.5rem', opacity: 0.9 }} />
                      <p style={{ color: 'white', fontSize: '0.85rem', maxWidth: '200px', margin: '0 auto', opacity: 0.8 }}>
                        Diseños mágicos para sueños increíbles
                      </p>
                    </div>
                  </Page>
                );

                return pages;
              })()}
            </HTMLFlipBook>

              {/* Stacked pages - left side (pages already read) */}
              {(() => {
                const currentTotalPages = 2 + indexOffset + (Object.keys(kidsLicensesData).length * 2);
                return (
                  <>
                    {currentPage > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '1%',
                        width: `${Math.min(currentPage * 2.5, 20)}px`,
                        height: '98%',
                        zIndex: -1,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'row',
                        background: 'linear-gradient(to left, #e8e4df, #c9c5c0)',
                        borderTopLeftRadius: '4px',
                        borderBottomLeftRadius: '4px',
                        boxShadow: '-3px 0 10px rgba(0,0,0,0.15), inset -2px 0 5px rgba(0,0,0,0.05)',
                        transform: 'translateX(-95%)'
                      }}>
                        {/* Líneas simulando hojas */}
                        {Array.from({ length: Math.min(currentPage, 8) }).map((_, i) => (
                          <div key={`left-${i}`} style={{
                            position: 'absolute',
                            right: `${i * 2.5}px`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: 'rgba(255,255,255,0.4)',
                          }} />
                        ))}
                      </div>
                    )}

                    {currentPage < currentTotalPages - 2 && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '1%',
                        width: `${Math.min((totalPages - currentPage) * 2.5, 20)}px`,
                        height: '98%',
                        zIndex: -1,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'row',
                        background: 'linear-gradient(to right, #e8e4df, #c9c5c0)',
                        borderTopRightRadius: '4px',
                        borderBottomRightRadius: '4px',
                        boxShadow: '3px 0 10px rgba(0,0,0,0.15), inset 2px 0 5px rgba(0,0,0,0.05)',
                        transform: 'translateX(95%)'
                      }}>
                        {/* Líneas simulando hojas */}
                        {Array.from({ length: Math.min((currentTotalPages - currentPage), 8) }).map((_, i) => (
                          <div key={`right-${i}`} style={{
                            position: 'absolute',
                            left: `${i * 2.5}px`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: 'rgba(255,255,255,0.4)',
                          }} />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
          </>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
