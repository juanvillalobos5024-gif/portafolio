import styles from './AboutUs.module.css';
import Image from 'next/image';

export default function AboutUs({ data }: { data?: any }) {
  return (
    <section id="nosotros" className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.title}>{data?.title || "Quiénes Somos"}</h2>
          {data?.bodyHtml ? (
            <div 
              className={styles.richText} 
              dangerouslySetInnerHTML={{ __html: data.bodyHtml }} 
            />
          ) : (
            <>
          
            </>
          )}
        </div>
        
      </div>
    </section>
  );
}
