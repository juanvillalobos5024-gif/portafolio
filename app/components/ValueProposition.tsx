import styles from './ValueProposition.module.css';
import { ShieldCheck, Target, TrendingUp, Users, CheckCircle, Star, Zap } from 'lucide-react';

const icons = [
  <ShieldCheck key="shield" size={32} />,
  <Target key="target" size={32} />,
  <TrendingUp key="trending" size={32} />,
  <Users key="users" size={32} />,
  <CheckCircle key="check" size={32} />,
  <Star key="star" size={32} />,
  <Zap key="zap" size={32} />
];

export default function ValueProposition({ data }: { data?: any }) {
  // Manejar el formato nuevo dinámico vs el antiguo por retrocompatibilidad
  let values = [];
  
  if (data?.cards && Array.isArray(data.cards) && data.cards.length > 0) {
    values = data.cards.map((card: any, index: number) => ({
      id: card.id || index.toString(),
      title: card.title,
      description: card.desc,
      icon: icons[index % icons.length]
    }));
  } else {
    values = [
      {
        id: 1,
        title: data?.card1Title || "Calidad de Hilos",
        description: data?.card1Desc || "Seleccionamos minuciosamente nuestras materias primas para garantizar acabados suaves y resistentes.",
        icon: icons[0]
      },
      {
        id: 2,
        title: data?.card2Title || "Alta Durabilidad",
        description: data?.card2Desc || "Nuestros textiles están diseñados para soportar lavados industriales continuos sin perder su forma ni color.",
        icon: icons[1]
      },
      {
        id: 3,
        title: data?.card3Title || "Atención Hotelera",
        description: data?.card3Desc || "Líneas especializadas de dotación con los más altos estándares para el sector turismo y hospitalidad.",
        icon: icons[2]
      },
      {
        id: 4,
        title: data?.card4Title || "Distribución Nacional",
        description: data?.card4Desc || "Llegamos a cada rincón del país con logística eficiente y tiempos de entrega garantizados.",
        icon: icons[3]
      }
    ];
  }

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{data?.title || "¿Por qué elegir Contex?"}</h2>
        
        <div className={styles.grid}>
          {values.map((item: any) => (
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
