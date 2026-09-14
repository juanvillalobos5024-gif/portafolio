import { promises as fs } from 'fs';
import path from 'path';
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import FeaturedPillars from "./components/FeaturedPillars";
import ValueProposition from "./components/ValueProposition";
import ContactSection from "./components/ContactSection";
import GlobalThread from "./components/GlobalThread";
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';

const redis = new Redis(process.env.REDIS_URL || '');
const REDIS_KEY = 'contex_portfolio_content';

export default async function Home() {
  let content = null;
  try {
    const redisData = await redis.get(REDIS_KEY);
    if (redisData) {
      content = JSON.parse(redisData);
    } else {
      // Fallback a archivo local si Redis está vacío (solo pasa la primera vez)
      const dataFilePath = path.join(process.cwd(), 'data', 'content.json');
      const fileContents = await fs.readFile(dataFilePath, 'utf8');
      content = JSON.parse(fileContents);
    }
  } catch (error) {
    console.error('Error reading content:', error);
  }

  return (
    <main style={{ position: 'relative' }}>
      {/* Hilo Conductor Global */}
      <GlobalThread />
      
      {/* 1. Hero Section */}
      <Hero data={content?.hero} />
      
      {/* 2. Quiénes Somos */}
      <AboutUs data={content?.about} />
      
      {/* 2.5 Líneas de Excelencia / Pilares */}
      <FeaturedPillars data={content?.featuredPillars} />
      
      {/* 3. Propuesta de Valor */}
      <ValueProposition data={content?.valueProposition} />
      
      {/* 5. Contacto y Mapa */}
      <ContactSection data={content?.contact} />
      
    </main>
  );
}
