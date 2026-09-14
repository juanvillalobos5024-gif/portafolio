import styles from './ValueProposition.module.css';

export default function ValueProposition({ data }: { data?: any }) {
  const values = [
    {
      id: 1,
      title: data?.card1Title || "Calidad de Hilos",
      description: data?.card1Desc || "Seleccionamos minuciosamente nuestras materias primas para garantizar acabados suaves y resistentes.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      )
    },
    {
      id: 2,
      title: data?.card2Title || "Alta Durabilidad",
      description: data?.card2Desc || "Nuestros textiles están diseñados para soportar lavados industriales continuos sin perder su forma ni color.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    {
      id: 3,
      title: data?.card3Title || "Atención Hotelera",
      description: data?.card3Desc || "Líneas especializadas de dotación con los más altos estándares para el sector turismo y hospitalidad.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 22v-6.57"/>
          <path d="M14 22v-6.57"/>
          <path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
          <path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>
          <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
          <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
        </svg>
      )
    },
    {
      id: 4,
      title: data?.card4Title || "Distribución Nacional",
      description: data?.card4Desc || "Llegamos a cada rincón del país con logística eficiente y tiempos de entrega garantizados.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
          <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      )
    }
  ];

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{data?.title || "¿Por qué elegir Contex?"}</h2>
        
        <div className={styles.grid}>
          {values.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
