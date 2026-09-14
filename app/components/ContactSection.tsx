"use client";
import styles from './ContactSection.module.css';

export default function ContactSection({ data }: { data?: any }) {
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
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nombre o Empresa <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" id="name" className={styles.input} placeholder="Ej. Hotel del Mar" required />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" id="email" className={styles.input} placeholder="ventas@empresa.com" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Teléfono <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="tel" id="phone" className={styles.input} placeholder="+57 300 000 0000" pattern="[0-9\+\-\s\(\)]+" title="Ingresa un número de teléfono válido" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Requerimiento Especial <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea id="message" className={styles.textarea} placeholder="Estoy buscando dotación para 50 habitaciones..." required></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Enviar Mensaje
              </button>
            </form>
          </div>

          {/* Columna Derecha: Mapa */}
          <div className={styles.mapWrapper}>
            {/* Mapa de Calle 76 # 70-35, Barranquilla */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.4862419515566!2d-74.8066531!3d11.0021307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d99d14620df%3A0xc6fb0426bbbf2e9c!2sCl.%2076%20%2370-35%2C%20Norte-Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses!2sco!4v1714421160350!5m2!1ses!2sco" 
              className={styles.iframe}
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Contex SAS Barranquilla"
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
}
