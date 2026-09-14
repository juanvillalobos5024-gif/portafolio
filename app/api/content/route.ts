import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || '');
const dataFilePath = path.join(process.cwd(), 'data', 'content.json');
const REDIS_KEY = 'contex_portfolio_content';

export async function GET() {
  try {
    // Intentar leer de Redis primero
    const redisData = await redis.get(REDIS_KEY);
    if (redisData) {
      return NextResponse.json(JSON.parse(redisData));
    }

    // Fallback: Si no hay datos en Redis, leer el archivo local y poblar Redis
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Guardar en Redis para futuras peticiones
    await redis.set(REDIS_KEY, JSON.stringify(data));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let currentData: any = {};
    const redisData = await redis.get(REDIS_KEY);
    
    if (redisData) {
      currentData = JSON.parse(redisData);
    } else {
      const currentFile = await fs.readFile(dataFilePath, 'utf8');
      currentData = JSON.parse(currentFile);
    }
    
    // Hacemos merge (mezclamos) el contenido nuevo con el actual
    const newData = { ...currentData, ...body };
    
    await redis.set(REDIS_KEY, JSON.stringify(newData));
    
    return NextResponse.json({ success: true, message: 'Content updated successfully in Redis' });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
}
