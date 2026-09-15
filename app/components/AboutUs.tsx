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
              dangerouslySetInnerHTML={{ __html: typeof data.bodyHtml === 'string' ? data.bodyHtml.replace(/&nbsp;/g, ' ') : data.bodyHtml }} 
            />
          ) : (
            <></>
          )}
        </div>
        
        {data?.image && (
          <div className={styles.imageWrapper}>
            <Image 
              src={data.image} 
              alt={data?.alt || "Acerca de Contex"} 
              width={500} 
              height={500} 
              className={styles.aboutImage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
