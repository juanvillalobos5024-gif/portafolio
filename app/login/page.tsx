"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg('Credenciales inválidas o cuenta bloqueada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg('Por favor ingresa tu correo electrónico arriba primero.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfoMsg('Se ha enviado un enlace de recuperación a tu correo.');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg('Error al enviar el correo de recuperación. Verifica la dirección.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
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
          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>
              {infoMsg}
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Usuario / Correo</label>
            <input 
              type="email" 
              id="email"
              className={styles.input} 
              placeholder="ejemplo@contex.com.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <div className={styles.passwordInputContainer}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className={styles.input} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button 
                type="button" 
                className={styles.passwordToggle} 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.optionsContainer}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkboxInput}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Recordarme
            </label>
            <button type="button" onClick={handleResetPassword} className={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading && <span className={styles.spinner}></span>}
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
