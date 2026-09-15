"use client";
import React, { useEffect, useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './CatalogModal.module.css';
import { playPageTurnSound } from '../utils/audio';
import WhatsAppButton from './WhatsAppButton';

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
  const safeSrc = src || '/catalogo/portada_editorial.jpg';
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const [currentSrc, setCurrentSrc] = useState(safeSrc);
  const [prevSrc, setPrevSrc] = useState(safeSrc);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (safeSrc !== currentSrc) {
      setPrevSrc(currentSrc);
      setCurrentSrc(safeSrc);
      setIsFading(true);
      
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [safeSrc]);

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
  const pageLighting = side === 'left'
    ? 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,1) 70%, rgba(235,235,235,1) 100%)'
    : 'radial-gradient(circle at 60% 50%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,1) 70%, rgba(235,235,235,1) 100%)';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: pageLighting, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        opacity: 0.04,
        mixBlendMode: 'multiply'
      }}></div>
      
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

      {variant === 'kids' && (
        <div style={{ position: 'absolute', bottom: '1rem', right: '3rem', fontSize: '12rem', opacity: 0.02, color: 'var(--contex-dark)', pointerEvents: 'none', userSelect: 'none' }}>
          ★
        </div>
      )}
    </div>
  );
};

const PageOverlay = ({ side }: { side: 'left' | 'right' }) => {
  const spineShadow = side === 'left' 
    ? 'linear-gradient(to right, rgba(0,0,0,0) 88%, rgba(0,0,0,0.06) 94%, rgba(0,0,0,0.3) 100%)'
    : 'linear-gradient(to left, rgba(0,0,0,0) 88%, rgba(0,0,0,0.06) 94%, rgba(0,0,0,0.3) 100%)';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: spineShadow }}></div>
      <div style={{ position: 'absolute', top: 0, left: side === 'left' ? 'auto' : 0, right: side === 'left' ? 0 : 'auto', width: '2%', height: '100%', background: side === 'left' ? 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4))' : 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.4))' }}></div>
      <div style={{ position: 'absolute', top: '2.5rem', left: side === 'left' ? '3rem' : 'auto', right: side === 'right' ? '3rem' : 'auto', width: '3rem', height: '2px', backgroundColor: 'var(--contex-green)', opacity: 0.9 }}></div>
    </div>
  );
};

const ColorPaletteContainer = ({ children, compact = false }: { children: React.ReactNode, compact?: boolean }) => (
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

export default function CatalogModal({ isOpen, onClose }: CatalogModalProps) {
  const [mounted, setMounted] = useState(false);

  const bookRef = useRef<any>(null);

  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [currentPage, setCurrentPage] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [catalogData, setCatalogData] = useState<any>({});
  const [catalogSettings, setCatalogSettings] = useState<any>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({
    romana: 'general', royal: 'general', toscana: 'general', home: 'general',
    sonata: 'general', tropical: 'general', zafiro: 'general', hotelera: 'general'
  });
  const hardcodedKeys = ['romana', 'royal', 'toscana', 'home', 'sonata', 'tropical', 'zafiro'];
  const extraKeys = Object.keys(catalogData || {}).filter(key => !hardcodedKeys.includes(key));
  const totalPages = 20 + (extraKeys.length * 2);

  // Helper: get selected color for a collection
  const getSelectedColor = (key: string) => selectedColors[key] || 'general';
  const setSelectedColor = (key: string, colorId: string) => {
    setSelectedColors(prev => ({ ...prev, [key]: colorId }));
  };

  // Helper: build image map from dynamic colors (with fallback to hardcoded)
  const getColorImage = (collectionKey: string, colorId: string, fallbackImages: Record<string, string>) => {
    const dynamicColors = catalogData[collectionKey]?.colors;
    const mainImg = catalogData[collectionKey]?.mainImage;

    // 1. If a specific color is selected (not 'general')
    if (colorId && colorId !== 'general') {
      if (dynamicColors && dynamicColors.length > 0) {
        const found = dynamicColors.find((c: any) => c.id === colorId);
        if (found && found.image) return found.image;
      }
      if (fallbackImages && fallbackImages[colorId]) {
        return fallbackImages[colorId];
      }
    }

    // 2. Default view: prefer the collection's mainImage if uploaded
    if (mainImg) return mainImg;

    // 3. If no mainImage, pick the first dynamic color that has an image
    if (dynamicColors && dynamicColors.length > 0) {
      const firstWithImage = dynamicColors.find((c: any) => c.image);
      if (firstWithImage) return firstWithImage.image;
    }

    // 4. Hardcoded fallback
    return (fallbackImages && (fallbackImages[colorId] || fallbackImages['general'])) || '/catalogo/portada_editorial.jpg';
  };

  // Helper: get color name for display
  const getColorName = (collectionKey: string, colorId: string, fallbackName: string) => {
    if (colorId === 'general') {
      return catalogData[collectionKey]?.mainColorName || catalogData[collectionKey]?.title || fallbackName;
    }
    const dynamicColors = catalogData[collectionKey]?.colors;
    if (dynamicColors && dynamicColors.length > 0) {
      if (colorId && colorId !== 'general') {
        const found = dynamicColors.find((c: any) => c.id === colorId);
        if (found && found.name) return found.name;
      }
    }
    return fallbackName;
  };

  // Helper: render unified color palette with Main Image Card always at the head of the queue
  const renderCollectionPalette = (collectionKey: string) => {
    const colData = catalogData[collectionKey] || {};
    const mainName = colData.mainColorName || 'Ver Colección';
    const mainHex = colData.mainColorHex || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    const colors = (colData.colors || []).filter((c: any) => c.name || c.image);
    const selected = getSelectedColor(collectionKey);

    return (
      <ColorPaletteContainer>
        {/* 1. Tarjeta Principal (siempre al inicio en la cabecera de la cola) */}
        <div 
          onClick={() => setSelectedColor(collectionKey, 'general')}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            cursor: 'pointer', 
            opacity: selected === 'general' ? 1 : 0.7, 
            transition: 'all 0.2s ease', 
            transform: selected === 'general' ? 'scale(1.05)' : 'scale(1)', 
            width: '65px' 
          }}
          title="Imagen Principal"
        >
          <div style={{ 
            width: '60px', 
            height: '40px', 
            background: mainHex, 
            borderRadius: '6px', 
            border: selected === 'general' ? '2px solid var(--contex-dark)' : '1px solid #e2e8f0', 
            boxShadow: selected === 'general' ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)', 
            marginBottom: '0.3rem' 
          }}></div>
          <span style={{ 
            fontSize: '0.65rem', 
            textAlign: 'center', 
            color: selected === 'general' ? 'var(--contex-dark)' : '#64748b', 
            fontWeight: selected === 'general' ? '600' : '400', 
            lineHeight: '1.2' 
          }}>
            {mainName}
          </span>
        </div>

        {/* 2. Variantes de color siguientes en la cola */}
        {colors.map((c: any) => (
          <div 
            key={c.id} 
            onClick={() => setSelectedColor(collectionKey, selected === c.id ? 'general' : c.id)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              cursor: 'pointer', 
              opacity: selected === c.id ? 1 : 0.7, 
              transition: 'all 0.2s ease', 
              transform: selected === c.id ? 'scale(1.05)' : 'scale(1)', 
              width: '65px' 
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '40px', 
              background: c.hex || '#cccccc', 
              borderRadius: '6px', 
              border: selected === c.id ? '2px solid var(--contex-dark)' : '1px solid #e2e8f0', 
              boxShadow: selected === c.id ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)', 
              marginBottom: '0.3rem' 
            }}></div>
            <span style={{ 
              fontSize: '0.65rem', 
              textAlign: 'center', 
              color: selected === c.id ? 'var(--contex-dark)' : '#64748b', 
              fontWeight: selected === c.id ? '600' : '400', 
              lineHeight: '1.2' 
            }}>
              {c.name || 'Color'}
            </span>
          </div>
        ))}
      </ColorPaletteContainer>
    );
  };

  useEffect(() => {
    setMounted(true);
    
    // Fetch data
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.mainCatalog) {
          setCatalogData(data.mainCatalog);
        }
        if (data.mainCatalogSettings) {
          setCatalogSettings(data.mainCatalogSettings);
        }
        setDataLoaded(true);
      })
      .catch(console.error);
    setMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowSwipeHint(window.innerWidth <= 768);
    } else {
      document.body.style.overflow = 'auto';
    }

    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (mobile) {
          setScale(1);
        } else {
          const scaleX = (window.innerWidth * 0.85) / 1000;
          const scaleY = (window.innerHeight * 0.95) / 650;
          setScale(Math.min(scaleX, scaleY, 1.2));
        }
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen]);

  const towelImages: Record<string, string> = {
    general: '/catalogo/romana/general.webp',
    ocre: '/catalogo/romana/ocre%20tierra.webp',
    champagne: '/catalogo/romana/oro%20champagne.webp',
    radiante: '/catalogo/romana/oro%20radiante.webp',
    marron: '/catalogo/romana/marron%20imperial.webp',
  };

  const royalImages: Record<string, string> = {
    general: '/catalogo/royal/general.webp',
    aguamarina: '/catalogo/royal/aguamarina.webp',
    almendra: '/catalogo/royal/alemendra.webp',
    azulBebe: '/catalogo/royal/azul%20bebe.webp',
    blanco: '/catalogo/royal/blanco.webp',
    gris: '/catalogo/royal/gris.webp',
  };

  const toscanaImages: Record<string, string> = {
    general: '/catalogo/toscana/general.webp',
    azulBebe: '/catalogo/toscana/azul%20bebe.webp',
    beige: '/catalogo/toscana/beige.webp',
    latte: '/catalogo/toscana/latte.webp',
    oliva: '/catalogo/toscana/oliva.webp',
  };

  const homeImages: Record<string, string> = {
    general: '/catalogo/home/general.webp',
    azulNoche: '/catalogo/home/azul%20noche.webp',
    beige: '/catalogo/home/beige.webp',
    blanco: '/catalogo/home/blanco.webp',
    gris: '/catalogo/home/gris.webp',
    mochaMousse: '/catalogo/home/mocha%20mousse.webp',
  };

  const sonataImages: Record<string, string> = {
    general: '/catalogo/sonata/general.webp',
    azulCobalto: '/catalogo/sonata/azul%20cobalto.webp',
    flamingo: '/catalogo/sonata/flamingo.webp',
    gris: '/catalogo/sonata/gris.webp',
    oliva: '/catalogo/sonata/oliva.webp',
  };

  const tropicalImages: Record<string, string> = {
    general: '/catalogo/tropical/general.webp',
  };

  const zafiroImages: Record<string, string> = {
    general: '/catalogo/zafiro/general.webp',
    canela: '/catalogo/zafiro/canela.webp',
    celeste: '/catalogo/zafiro/celeste.webp',
    verdePistacho: '/catalogo/zafiro/verde%20pistacho.webp',
  };

  const hoteleraImages: Record<string, string> = {
    general: '/catalogo/hotelera/general.webp',
    blanco: '/catalogo/hotelera/blanco.webp',
  };

  return (
    <>
      <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`}>
        <div className={styles.forceLandscape} onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.8rem', zIndex: 10000, background: 'rgba(0,0,0,0.15)', padding: '0.4rem 1rem', borderRadius: '40px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <a 
              href="/catalogo.pdf" 
              download 
              className={styles.toolButton} 
              aria-label="Descargar PDF"
              style={{ textDecoration: 'none', width: '35px', height: '35px', fontSize: '1.2rem' }}
            >
              📄
            </a>

            <button className={styles.toolButton} onClick={onClose} aria-label="Cerrar catálogo" title="Cerrar catálogo" style={{ width: '35px', height: '35px', fontSize: '1.2rem' }}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {isMobile && (
            <div className={`${styles.swipeHintOverlay} ${!showSwipeHint ? styles.hidden : ''}`}>
              <div className={styles.swipeHand}></div>
            </div>
          )}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
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
          {isOpen && dataLoaded && (
            <>
              {/* Botón Prev Visible */}
              <button 
                onClick={(e) => { e.stopPropagation(); bookRef.current?.pageFlip().flipPrev(); }} 
                style={{ position: 'fixed', left: isMobile ? '5px' : '20px', top: '50%', transform: 'translateY(-50%)', width: isMobile ? '36px' : '50px', height: isMobile ? '36px' : '50px', zIndex: 10500, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'background 0.2s', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                aria-label="Página anterior"
                title="Página anterior"
              >
                <span aria-hidden="true">
                  <svg width={isMobile ? '20' : '28'} height={isMobile ? '20' : '28'} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </span>
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
                width={isMobile ? 270 : 500} 
                height={isMobile ? 370 : 650} 
                size="stretch"
                minWidth={250}
                maxWidth={600}
                minHeight={350}
                maxHeight={800}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                useMouseEvents={false}
                className="demo-book"
                onFlip={(e: any) => {
                  setCurrentPage(e.data);
                  setShowSwipeHint(false);
                }}
              >
              {/* PORTADA EDITORIAL */}
              <Page number={1} isCover={true}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${catalogSettings?.coverImage || '/catalogo/portada_editorial.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>
              </Page>

              {/* === INTRODUCCIÓN === */}
              <Page number={2} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--contex-dark)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Nuestra<br/>Historia
                  </h2>
                  {catalogSettings?.historyHtml ? (
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#4a5568', flex: 1 }} dangerouslySetInnerHTML={{ __html: catalogSettings.historyHtml }} />
                  ) : (
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#4a5568', textAlign: 'justify', flex: 1 }}>
                      <p style={{ marginBottom: '1rem' }}>
                        <strong>COMPAÑÍA NACIONAL DE TEXTILES</strong> ha forjado una destacada trayectoria en el sector, consolidándose como referente gracias a su compromiso con la calidad, innovación y sostenibilidad.
                      </p>
                      <p style={{ marginBottom: '1rem' }}>
                        Desde sus inicios, ha tejido un camino de éxito, adaptándose a las tendencias del mercado y destacando por su capacidad para ofrecer productos textiles como hamacas, toallas, almohadas, sábanas, edredones, para el hogar y el sector hotelero.
                      </p>
                      <p style={{ marginBottom: '1.5rem' }}>
                        Somos una empresa en constante avance y, nuestro compromiso con la sostenibilidad se refleja en la producción de hilo reciclado para la elaboración de los productos textiles, abriendo paso hacia una industria más responsable, marcando así el rumbo hacia un futuro textil más ecoamigable.
                      </p>
                      
                      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(212, 233, 12, 0.1)', borderLeft: '4px solid var(--contex-green)', borderRadius: '0 8px 8px 0', marginTop: '2rem' }}>
                        <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: 'var(--contex-dark)', margin: 0, textAlign: 'center' }}>
                          "Convertimos fibras textiles en productos que le dan vida a tus sueños."
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Page>

              {/* === ÍNDICE === */}
              <Page number={3} isRight={true}>
                <PageBackground side="right" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, padding: '1rem 2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', color: 'var(--contex-dark)', marginBottom: '1.5rem', borderBottom: '2px solid var(--contex-green)', paddingBottom: '0.5rem', display: 'inline-block' }}>
                    Índice
                  </h2>
                  
                  {catalogSettings?.indexHtml ? (
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#4a5568' }} dangerouslySetInnerHTML={{ __html: catalogSettings.indexHtml }} />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', fontSize: '0.75rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--contex-green)', fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Toallas</h3>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>
                          Valencia • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(16)}>Zafiro</span> • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(14)}>Tropical</span> • Fuzzy* • Atenas • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(8)}>Toscana</span> • Doble Rizo • Tapete Clasic • Primax* • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(4)}>Romana*</span> • Lisboa • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(4)}>Romana</span> • Nativa • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(10)}>Home</span> • Oasis • <span style={{cursor: 'pointer', color: 'var(--contex-dark)', fontWeight: 600}} onClick={() => bookRef.current?.pageFlip().turnToPage(6)}>Royal</span>-Candy* • Tapete Pies • Bata Ziggy
                        </p>
                      </div>
                      
                      <div>
                        <h3 style={{ color: 'var(--contex-green)', fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cocina</h3>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>
                          Limpiones Microfibra • Limpiones Estampados
                        </p>
                      </div>

                      <div>
                        <h3 style={{ color: 'var(--contex-green)', fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hamacas</h3>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>
                          Típica a Color • Típica Negra • Metalissa • Bordada • Extra Bordada • Familiar a Rayas
                        </p>
                      </div>

                      <div>
                        <h3 style={{ color: 'var(--contex-green)', fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Lencería</h3>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>
                          Sobrecama Andrea • Sobrecama Domino • Juego de Sábanas Estampado • Almohada Spectra • Almohada Memor
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Page>

              {/* === COLECCIÓN ROMANA === */}
              <Page number={4} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.romana?.title || 'Colección Romana'}</h2>
                  <div className={styles.specsGrid}>
                    {(catalogData.romana?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.8rem' }}>
                      Colores Disponibles:
                    </h3>
                    {renderCollectionPalette('romana')}
                  </div>
                </div>
              </Page>

              <Page number={5} isRight={true}>
                <HoverZoomImage 
                  src={getColorImage('romana', getSelectedColor('romana'), towelImages)} 
                  alt="Toalla Romana"
                  className={styles.pageImage}
                />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Romana" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('romana', getSelectedColor('romana'), catalogData.romana?.title || 'Colección Romana')}
                </div>
              </Page>

              {/* === COLECCIÓN ROYAL === */}
              <Page number={6} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.royal?.title || 'Colección Royal'}</h2>

                  <div className={styles.specsGrid}>
                    {(catalogData.royal?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>
                      Colores Disponibles:
                    </h3>
                    {renderCollectionPalette('royal')}
                  </div>
                </div>
              </Page>

              <Page number={7} isRight={true}>
                <HoverZoomImage 
                  src={getColorImage('royal', getSelectedColor('royal'), royalImages)} 
                  alt="Colección Royal"
                  className={styles.pageImage}
                />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Royal" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('royal', getSelectedColor('royal'), catalogData.royal?.title || 'Colección Royal')}
                </div>
              </Page>

              {/* === COLECCIÓN TOSCANA === */}
              <Page number={8} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.toscana?.title || 'Colección Toscana'}</h2>
                  
                  <div className={styles.specsGrid}>
                    {(catalogData.toscana?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>
                      Colores Disponibles:
                    </h3>
                    {renderCollectionPalette('toscana')}
                  </div>
                </div>
              </Page>

              <Page number={9} isRight={true}>
                <HoverZoomImage 
                  src={getColorImage('toscana', getSelectedColor('toscana'), toscanaImages)} 
                  alt="Colección Toscana"
                  className={styles.pageImage}
                />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Toscana" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('toscana', getSelectedColor('toscana'), catalogData.toscana?.title || 'Colección Toscana')}
                </div>
              </Page>

              {/* === COLECCIÓN HOME === */}
              <Page number={10} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.home?.title || 'Colección Home'}</h2>
                  
                  <div className={styles.specsGrid}>
                    {(catalogData.home?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>
                      Colores Disponibles:
                    </h3>
                    {renderCollectionPalette('home')}
                  </div>
                </div>
              </Page>
              <Page number={11} isRight={true}>
                <HoverZoomImage src={getColorImage('home', getSelectedColor('home'), homeImages)} alt="Colección Home" className={styles.pageImage} />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Home" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('home', getSelectedColor('home'), catalogData.home?.title || 'Colección Home')}
                </div>
              </Page>

              {/* === COLECCIÓN SONATA === */}
              <Page number={12} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.sonata?.title || 'Colección Sonata'}</h2>
                  
                  <div className={styles.specsGrid}>
                    {(catalogData.sonata?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>Colores Disponibles:</h3>
                    {renderCollectionPalette('sonata')}
                  </div>
                </div>
              </Page>
              <Page number={13} isRight={true}>
                <HoverZoomImage src={getColorImage('sonata', getSelectedColor('sonata'), sonataImages)} alt="Colección Sonata" className={styles.pageImage} />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Sonata" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('sonata', getSelectedColor('sonata'), catalogData.sonata?.title || 'Colección Sonata')}
                </div>
              </Page>

              {/* === COLECCIÓN TROPICAL === */}
              <Page number={14} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.tropical?.title || 'Colección Tropical'}</h2>
                  
                  <div className={styles.specsGrid}>
                    {(catalogData.tropical?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>Colores Disponibles:</h3>
                    {renderCollectionPalette('tropical')}
                  </div>
                </div>
              </Page>
              <Page number={15} isRight={true}>
                <HoverZoomImage src={getColorImage('tropical', getSelectedColor('tropical'), tropicalImages)} alt="Colección Tropical" className={styles.pageImage} />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Tropical" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('tropical', getSelectedColor('tropical'), catalogData.tropical?.title || 'Colección Tropical')}
                </div>
              </Page>

              {/* === COLECCIÓN ZAFIRO === */}
              <Page number={16} isLeft={true}>
                <PageBackground side="left" variant="hotelera" />
                <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                  <h2 className={styles.pageTitle}>{catalogData.zafiro?.title || 'Colección Zafiro'}</h2>
                  <div className={styles.specsGrid}>
                    {(catalogData.zafiro?.features || []).map((feature: any) => (
                      <div className={styles.specCard} key={feature.id}>
                        <span className={styles.specTitle}>{feature.label}</span>
                        <span className={styles.specValue}>{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>Colores Disponibles:</h3>
                    {renderCollectionPalette('zafiro')}
                  </div>
                </div>
              </Page>
              <Page number={17} isRight={true}>
                <HoverZoomImage src={getColorImage('zafiro', getSelectedColor('zafiro'), zafiroImages)} alt="Colección Zafiro" className={styles.pageImage} />
                <PageBackground side="right" variant="hotelera" />
                <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                  <WhatsAppButton inline={true} collection="Zafiro" />
                </div>
                <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  {getColorName('zafiro', getSelectedColor('zafiro'), catalogData.zafiro?.title || 'Colección Zafiro')}
                </div>
              </Page>

              {/* COLECCIONES DINÁMICAS (AÑADIDAS DESDE ADMIN) */}
              {extraKeys.flatMap((key, index) => {
                const leftPageNum = 18 + (index * 2);
                const rightPageNum = 19 + (index * 2);
                const data = catalogData[key];
                
                return [
                  <Page key={`${key}-left`} number={leftPageNum} isLeft={true}>
                    <PageBackground side="left" variant="hotelera" />
                    <div style={{ position: 'relative', zIndex: 2, paddingBottom: '3rem' }}>
                      <h2 className={styles.pageTitle}>{data.title || key}</h2>
                      <div className={styles.specsGrid}>
                        {(data.features || []).map((feature: any) => (
                          <div className={styles.specCard} key={feature.id}>
                            <span className={styles.specTitle}>{feature.label}</span>
                            <span className={styles.specValue}>{feature.value}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '1.2rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--contex-dark)', marginBottom: '0.6rem' }}>Colores Disponibles:</h3>
                        {renderCollectionPalette(key)}
                      </div>
                    </div>
                  </Page>,
                  
                  <Page key={`${key}-right`} number={rightPageNum} isRight={true}>
                    <HoverZoomImage 
                      src={getColorImage(key, getSelectedColor(key), {})} 
                      alt={data.title || key}
                      className={styles.pageImage}
                    />
                    <PageBackground side="right" variant="hotelera" />
                    <div style={{position: 'absolute', bottom: '10%', right: '5%', zIndex: 11}}>
                      <WhatsAppButton inline={true} collection={data.title || key} />
                    </div>
                    <div style={{position: 'absolute', bottom: '2%', right: '5%', color: 'white', padding: '0.5rem 1rem', zIndex: 10, fontWeight: 'bold', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                      {getColorName(key, getSelectedColor(key), data.title || key)}
                    </div>
                  </Page>
                ];
              })}

              {/* CONTRAPORTADA */}
              <Page number={totalPages} isCover={true}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${catalogSettings?.backCoverImage || '/catalogo/portada_editorial.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, filter: 'grayscale(50%) brightness(0.2)' }}></div>
              </Page>

              </HTMLFlipBook>

              {/* EFECTO HOJAS APILADAS A LA IZQUIERDA (Páginas leídas) */}
              <div 
                className={styles.stackedPagesLeft}
                style={{
                  width: `${Math.min(currentPage * 2.5, 20)}px`,
                  opacity: currentPage > 0 ? 1 : 0,
                  transition: 'width 0.3s ease, opacity 0.3s ease'
                }}
              />

              {/* EFECTO HOJAS APILADAS A LA DERECHA (Páginas por leer) */}
              <div 
                className={styles.stackedPagesRight}
                style={{
                  width: `${Math.min((totalPages - currentPage) * 2.5, 20)}px`,
                  opacity: currentPage < totalPages ? 1 : 0,
                  transition: 'width 0.3s ease, opacity 0.3s ease'
                }}
              />
            </>
          )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
