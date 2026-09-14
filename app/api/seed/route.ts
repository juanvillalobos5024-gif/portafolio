import { NextResponse } from 'next/server';
import contentData from '@/data/content.json';
import { db } from '@/app/utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // 1. Crear colección 'content' para la información general (hero, about, contact, etc.)
    const sections = ['hero', 'about', 'valueProposition', 'contact'];
    for (const section of sections) {
      // @ts-ignore
      if (contentData[section]) {
        // @ts-ignore
        await setDoc(doc(db, 'content', section), contentData[section]);
      }
    }

    // 2. Crear colección 'mainCatalog'
    if (contentData.mainCatalog) {
      for (const [key, value] of Object.entries(contentData.mainCatalog)) {
        await setDoc(doc(db, 'mainCatalog', key), value);
      }
    }

    // 3. Crear colección 'kidsCatalog'
    if (contentData.kidsCatalog) {
      for (const [key, value] of Object.entries(contentData.kidsCatalog)) {
        await setDoc(doc(db, 'kidsCatalog', key), value);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Migración a Firestore completada exitosamente. ¡Tus colecciones ya están creadas!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
