import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Función para generar 25 jugadores aleatorios al principio
function generateInitialRanking(lang: 'es' | 'en') {
  if (lang === 'es') {
    return [
      { name: "María G.", country: "ES", score: 25 },
      { name: "Carlos M.", country: "MX", score: 24 },
      { name: "Ana P.", country: "AR", score: 23 },
      { name: "Luis R.", country: "CO", score: 22 },
      { name: "Sofia L.", country: "CL", score: 21 },
      { name: "Diego H.", country: "PE", score: 20 },
      { name: "Valentina C.", country: "ES", score: 19 },
      { name: "Andrés F.", country: "VE", score: 18 },
      { name: "Camila S.", country: "UY", score: 17 },
      { name: "Martín B.", country: "EC", score: 16 },
      { name: "Paula R.", country: "ES", score: 15 },
      { name: "Javier M.", country: "MX", score: 14 },
      { name: "Laura S.", country: "AR", score: 13 },
      { name: "Roberto P.", country: "CO", score: 12 },
      { name: "Elena F.", country: "CL", score: 11 },
      { name: "Miguel A.", country: "PE", score: 10 },
      { name: "Carmen L.", country: "ES", score: 9 },
      { name: "Fernando G.", country: "VE", score: 8 },
      { name: "Isabel T.", country: "UY", score: 7 },
      { name: "Ricardo V.", country: "EC", score: 6 },
      { name: "Patricia N.", country: "ES", score: 5 },
      { name: "Alejandro C.", country: "MX", score: 4 },
      { name: "Lucía H.", country: "AR", score: 3 },
      { name: "Daniel O.", country: "CO", score: 2 },
      { name: "Teresa M.", country: "CL", score: 1 },
    ];
  } else {
    return [
      { name: "Olivia W.", country: "US", score: 25 },
      { name: "Noah B.", country: "GB", score: 24 },
      { name: "Amelia T.", country: "CA", score: 23 },
      { name: "Liam K.", country: "AU", score: 22 },
      { name: "Charlotte F.", country: "NZ", score: 21 },
      { name: "James H.", country: "IE", score: 20 },
      { name: "Emily S.", country: "US", score: 19 },
      { name: "Henry L.", country: "GB", score: 18 },
      { name: "Sophia R.", country: "CA", score: 17 },
      { name: "Jack M.", country: "AU", score: 16 },
      { name: "Grace P.", country: "NZ", score: 15 },
      { name: "Lucas C.", country: "IE", score: 14 },
      { name: "Ava N.", country: "US", score: 13 },
      { name: "Benjamin D.", country: "GB", score: 12 },
      { name: "Mia J.", country: "CA", score: 11 },
      { name: "William G.", country: "AU", score: 10 },
      { name: "Ella V.", country: "NZ", score: 9 },
      { name: "Alexander O.", country: "IE", score: 8 },
      { name: "Isla Q.", country: "US", score: 7 },
      { name: "Daniel A.", country: "GB", score: 6 },
      { name: "Sophie X.", country: "CA", score: 5 },
      { name: "Michael Z.", country: "AU", score: 4 },
      { name: "Ruby E.", country: "NZ", score: 3 },
      { name: "Ethan Y.", country: "IE", score: 2 },
      { name: "Lily I.", country: "US", score: 1 },
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
    const { name, country, score, lang } = await request.json();
    
    const validLang = lang === 'en' ? 'en' : 'es';

    if (!name || !country || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const RANKING_KEY = `palabramaster:ranking:${validLang}`;

    let ranking: any = await kv.get(RANKING_KEY) || generateInitialRanking(validLang);

    ranking.push({ name, country, score });
    ranking.sort((a: any, b: any) => b.score - a.score);
    ranking = ranking.slice(0, 25);

    await kv.set(RANKING_KEY, ranking);

    return NextResponse.json({ ranking });
  } catch (error) {
    console.error('Error updating ranking:', error);
    return NextResponse.json({ error: 'Failed to update ranking' }, { status: 500 });
  }
}
