"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular un request de autenticación por ahora
    setTimeout(() => {
      setIsLoading(false);
      // Por ahora redirigimos al admin (que crearemos después)
      router.push('/admin');
    }, 1500);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          {/* Usamos el logo blanco o gris claro para que resalte en el fondo oscuro */}
          <Image 
            src="/logo-contex.png" 
            alt="CONTEX SAS" 
            width={180} 
            height={60} 
            style={{ objectFit: 'contain' }} 
            priority
          />
        </div>

        <div className={styles.accentLine}></div>

        <h1 className={styles.title}>Portal Privado</h1>
        <p className={styles.subtitle}>Acceso exclusivo para personal autorizado</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Usuario / Correo</label>
            <input 
              type="text" 
              id="email"
              className={styles.input} 
              placeholder="ejemplo@contex.com.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Autenticando...' : 'Ingresar al Portal'}
          </button>
        </form>

        <div className={styles.footerText}>
          &copy; {new Date().getFullYear()} Compañía Nacional de Textiles S.A.S.
        </div>
      </div>
    </div>
  );
}
