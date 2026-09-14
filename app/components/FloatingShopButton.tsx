'use client';
import { usePathname } from 'next/navigation';
import styles from './FloatingShopButton.module.css';

export default function FloatingShopButton() {
  const pathname = usePathname();

  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/admin'))) {
    return null;
  }
  return (
    <a 
      href="https://telaryhome.com/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.floatButton}
      aria-label="Compra en línea en Telary"
    >
      <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      Compra en Línea
    </a>
  );
}
