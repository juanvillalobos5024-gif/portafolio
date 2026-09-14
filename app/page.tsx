import { promises as fs } from 'fs';
import path from 'path';
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import ValueProposition from "./components/ValueProposition";
import ContactSection from "./components/ContactSection";
import GlobalThread from "./components/GlobalThread";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Leer contenido del CMS básico
  const dataFilePath = path.join(process.cwd(), 'data', 'content.json');
  let content = null;
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    content = JSON.parse(fileContents);
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
      
      {/* 3. Propuesta de Valor */}
      <ValueProposition data={content?.valueProposition} />
      
      {/* 5. Contacto y Mapa */}
      <ContactSection data={content?.contact} />
      
    </main>
  );
}
