import type { Metadata } from "next";
import { Outfit, Inter, Playfair_Display, Dancing_Script, Fredoka } from "next/font/google";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingShopButton from "./components/FloatingShopButton";
import fs from 'fs';
import path from 'path';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Generación Dinámica de Metadatos (SEO) desde el Admin
export async function generateMetadata(): Promise<Metadata> {
  let seo = {
    title: "CONTEX SAS | Textiles en Barranquilla y Dotación Hotelera en Colombia",
    description: "Fábrica nacional de textiles con años de experiencia. Alta calidad en hilos, telas industriales, ropa de cama y lencería para hoteles en toda Colombia.",
    keywords: "textiles en Barranquilla, dotación hotelera en Colombia, telas industriales, fábrica de textiles, Contex SAS, sábanas para hoteles"
  };

  try {
    const filePath = path.join(process.cwd(), 'data/content.json');
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (data.seo) {
        if (data.seo.title) seo.title = data.seo.title;
        if (data.seo.description) seo.description = data.seo.description;
        if (data.seo.keywords) seo.keywords = data.seo.keywords;
      }
    }
  } catch (error) {
    console.error("Error reading SEO metadata", error);
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable} ${playfair.variable} ${dancing.variable} ${fredoka.variable} antialiased`}>
      <body suppressHydrationWarning className="flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        {children}
        <WhatsAppButton />
        <FloatingShopButton />
      </body>
    </html>
  );
}
