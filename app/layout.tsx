import type { Metadata } from "next";
import { Outfit, Inter, Playfair_Display, Dancing_Script, Fredoka } from "next/font/google";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingShopButton from "./components/FloatingShopButton";
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

export const metadata: Metadata = {
  title: "CONTEX SAS | Textiles en Barranquilla y Dotación Hotelera en Colombia",
  description: "Fábrica nacional de textiles con años de experiencia. Alta calidad en hilos, telas industriales, ropa de cama y lencería para hoteles en toda Colombia.",
  keywords: "textiles en Barranquilla, dotación hotelera en Colombia, telas industriales, fábrica de textiles, Contex SAS, sábanas para hoteles",
};

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
