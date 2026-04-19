import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Función para generar 25 jugadores aleatorios al principio
function generateInitialRanking(lang: 'es' | 'en') {
  if (lang === 'es') {
    return [
      { name: "María G.", country: "ES", score: 25, words: [] },
      { name: "Carlos M.", country: "MX", score: 24, words: [] },
      { name: "Ana P.", country: "AR", score: 23, words: [] },
      { name: "Luis R.", country: "CO", score: 22, words: [] },
      { name: "Sofia L.", country: "CL", score: 21, words: [] },
      { name: "Diego H.", country: "PE", score: 20, words: [] },
      { name: "Valentina C.", country: "ES", score: 19, words: [] },
      { name: "Andrés F.", country: "VE", score: 18, words: [] },
      { name: "Camila S.", country: "UY", score: 17, words: [] },
      { name: "Martín B.", country: "EC", score: 16, words: [] },
      { name: "Paula R.", country: "ES", score: 15, words: [] },
      { name: "Javier M.", country: "MX", score: 14, words: [] },
      { name: "Laura S.", country: "AR", score: 13, words: [] },
      { name: "Roberto P.", country: "CO", score: 12, words: [] },
      { name: "Elena F.", country: "CL", score: 11, words: [] },
      { name: "Miguel A.", country: "PE", score: 10, words: [] },
      { name: "Carmen L.", country: "ES", score: 9, words: [] },
      { name: "Fernando G.", country: "VE", score: 8, words: [] },
      { name: "Isabel T.", country: "UY", score: 7, words: [] },
      { name: "Ricardo V.", country: "EC", score: 6, words: [] },
      { name: "Patricia N.", country: "ES", score: 5, words: [] },
      { name: "Alejandro C.", country: "MX", score: 4, words: [] },
      { name: "Lucía H.", country: "AR", score: 3, words: [] },
      { name: "Daniel O.", country: "CO", score: 2, words: [] },
      { name: "Teresa M.", country: "CL", score: 1, words: [] },
    ];
  } else {
    return [
      { name: "Olivia W.", country: "US", score: 25, words: [] },
      { name: "Noah B.", country: "GB", score: 24, words: [] },
      { name: "Amelia T.", country: "CA", score: 23, words: [] },
      { name: "Liam K.", country: "AU", score: 22, words: [] },
      { name: "Charlotte F.", country: "NZ", score: 21, words: [] },
      { name: "James H.", country: "IE", score: 20, words: [] },
      { name: "Emily S.", country: "US", score: 19, words: [] },
      { name: "Henry L.", country: "GB", score: 18, words: [] },
      { name: "Sophia R.", country: "CA", score: 17, words: [] },
      { name: "Jack M.", country: "AU", score: 16, words: [] },
      { name: "Grace P.", country: "NZ", score: 15, words: [] },
      { name: "Lucas C.", country: "IE", score: 14, words: [] },
      { name: "Ava N.", country: "US", score: 13, words: [] },
      { name: "Benjamin D.", country: "GB", score: 12, words: [] },
      { name: "Mia J.", country: "CA", score: 11, words: [] },
      { name: "William G.", country: "AU", score: 10, words: [] },
      { name: "Ella V.", country: "NZ", score: 9, words: [] },
      { name: "Alexander O.", country: "IE", score: 8, words: [] },
      { name: "Isla Q.", country: "US", score: 7, words: [] },
      { name: "Daniel A.", country: "GB", score: 6, words: [] },
      { name: "Sophie X.", country: "CA", score: 5, words: [] },
      { name: "Michael Z.", country: "AU", score: 4, words: [] },
      { name: "Ruby E.", country: "NZ", score: 3, words: [] },
      { name: "Ethan Y.", country: "IE", score: 2, words: [] },
      { name: "Lily I.", country: "US", score: 1, words: [] },
    ];
  }
}

// GET: Leer el ranking de un idioma específico
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
    const RANKING_KEY = `palabramaster:ranking:${lang}`;

    let ranking = await kv.get(RANKING_KEY);

    if (!ranking) {
      ranking = generateInitialRanking(lang);
      await kv.set(RANKING_KEY, ranking);
    }

    return NextResponse.json({ ranking });
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return NextResponse.json({ ranking: generateInitialRanking('es') });
  }
}

// POST: Añadir una nueva puntuación al idioma correspondiente
export async function POST(request: Request) {
  try {
    const { name, country, score, lang, words } = await request.json();
    
    const validLang = lang === 'en' ? 'en' : 'es';

    if (!name || !country || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const RANKING_KEY = `palabramaster:ranking:${validLang}`;

    let ranking: any = await kv.get(RANKING_KEY) || generateInitialRanking(validLang);

    ranking.push({ 
      name, 
      country, 
      score,
      words: Array.isArray(words) ? words : [] // AÑADIDO: guardamos el array de palabras
    });
    
    ranking.sort((a: any, b: any) => b.score - a.score);
    ranking = ranking.slice(0, 25);

    await kv.set(RANKING_KEY, ranking);

    return NextResponse.json({ ranking });
  } catch (error) {
    console.error('Error updating ranking:', error);
    return NextResponse.json({ error: 'Failed to update ranking' }, { status: 500 });
  }
}
