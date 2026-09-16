"use client";
import { useState } from 'react';
import styles from './ContactSection.module.css';
import { sendEmail } from '../actions/sendEmail';

export default function ContactSection({ data }: { data?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  return (
    <section id="contacto" className={styles.container}>
      <div className={styles.inner}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>{data?.title || "Hablemos de tu Proyecto"}</h2>
          {data?.subtitle ? (
            <div className={styles.subtitle} dangerouslySetInnerHTML={{ __html: data.subtitle }} />
          ) : (
            <p className={styles.subtitle}>Déjanos tus datos o visítanos en nuestra sede en Barranquilla.</p>
          )}
        </div>

        <div className={styles.grid}>
          {/* Columna Izquierda: Formulario */}
          <div className={styles.formCard}>
            <form action={async (formData) => {
              setIsSubmitting(true);
              setStatus({ type: null, message: '' });
              
              const result = await sendEmail(formData);
              
              setIsSubmitting(false);
              
              if (result.success) {
                setStatus({ type: 'success', message: '¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.' });
                (document.getElementById('contactForm') as HTMLFormElement)?.reset();
              } else {
                setStatus({ type: 'error', message: result.error || 'Hubo un problema al enviar el mensaje.' });
              }
            }} id="contactForm">
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nombre o Empresa <span style={{ color: '#ef4444' }}>*</span></label>
                <input suppressHydrationWarning type="text" name="name" id="name" className={styles.input} placeholder="Ej. Hotel del Mar" required />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                <input suppressHydrationWarning type="email" name="email" id="email" className={styles.input} placeholder="ventas@empresa.com" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Teléfono <span style={{ color: '#ef4444' }}>*</span></label>
                <input suppressHydrationWarning type="tel" name="phone" id="phone" className={styles.input} placeholder="+57 300 000 0000" pattern="[0-9\+\-\s\(\)]+" title="Ingresa un número de teléfono válido" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Requerimiento Especial <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea name="message" id="message" className={styles.textarea} placeholder="Estoy buscando dotación para 50 habitaciones..." required></textarea>
              </div>

              {status.message && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  backgroundColor: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: status.type === 'success' ? '#4ade80' : '#f87171',
                  border: `1px solid ${status.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  fontSize: '0.95rem'
                }}>
                  {status.message}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Mapa */}
          <div className={styles.mapWrapper}>
            {/* Mapa de Calle 76 # 70-34, Barranquilla */}
            <iframe 
              src="https://maps.google.com/maps?q=Cl.%2076%20%2370-34,%20Barranquilla,%20Atlantico&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              className={styles.iframe}
              allowFullScreen
              loading="lazy" 
              referrerPolicy="no-referrer"
              title="Ubicación Contex SAS Barranquilla"
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
}
