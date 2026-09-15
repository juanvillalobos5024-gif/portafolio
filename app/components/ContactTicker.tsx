"use client";
import { Phone, Mail, MapPin } from 'lucide-react';
import styles from './ContactTicker.module.css';

export default function ContactTicker() {
  return (
    <div className={styles.tickerWrapper}>
      <div className={styles.tickerContent}>
        <span className={styles.tickerItem}>
          <Phone size={18} color="var(--contex-green)" />
          Teléfono: 605 3319432
        </span>
        <span className={styles.tickerSeparator}>|</span>
        <span className={styles.tickerItem}>
          <Mail size={18} color="var(--contex-green)" />
          ventas@contexsas.com
        </span>
        <span className={styles.tickerSeparator}>|</span>
        <span className={styles.tickerItem}>
          <MapPin size={18} color="var(--contex-green)" />
          Calle 76 # 70-34, Colombia – Atlántico, Barranquilla
        </span>
      </div>
    </div>
  );
}
