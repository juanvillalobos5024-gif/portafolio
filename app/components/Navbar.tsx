"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // ScrollSpy para detectar la sección activa y si el navbar debe tener fondo
    const handleScroll = () => {
      // 1. Detectar si hemos hecho scroll hacia abajo lo suficiente
      setIsScrolled(window.scrollY > 80);

      // 2. Detectar sección actual
      const sections = ['inicio', 'nosotros', 'contacto'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition) {
          current = section;
        }
      }
      
      // Si estamos hasta arriba, forzamos 'inicio'
      if (window.scrollY < 100) {
        current = 'inicio';
      }
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    closeMobileMenu();
    
    // Update URL hash without jumping
    if (window.history.pushState) {
      window.history.pushState(null, '', hash);
    } else {
      window.location.hash = hash;
    }

    const id = hash.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/admin'))) {
    return null;
  }

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
      <Link href="#inicio" className={styles.logoContainer} aria-label="Ir al inicio" onClick={(e) => handleScrollToSection(e, '#inicio')}>
        <Image
          src="/logo-contex.png" 
          alt="Logotipo oficial de CONTEX Compañía Nacional de Textiles S.A.S."
          width={120}
          height={40}
          className={styles.logoImage}
          priority
        />
      </Link>
      
      {/* Botón Hamburguesa */}
      <button 
        className={styles.hamburger} 
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar1 : ''}`}></span>
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar2 : ''}`}></span>
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar3 : ''}`}></span>
      </button>

      <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
        <Link 
          href="#inicio" 
          className={`${styles.link} ${activeSection === 'inicio' ? styles.active : ''}`}
          onClick={(e) => handleScrollToSection(e, '#inicio')}
        >
          Inicio
        </Link>
        <Link 
          href="#nosotros" 
          className={`${styles.link} ${activeSection === 'nosotros' ? styles.active : ''}`}
          onClick={(e) => handleScrollToSection(e, '#nosotros')}
        >
          Quiénes Somos
        </Link>
        <Link 
          href="#contacto" 
          className={`${styles.link} ${activeSection === 'contacto' ? styles.active : ''}`}
          onClick={(e) => handleScrollToSection(e, '#contacto')}
        >
          Contacto
        </Link>
      </div>
    </nav>
  );
}
