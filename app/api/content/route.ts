import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'content.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validamos que sea un JSON válido leyendo el actual primero
    const currentFile = await fs.readFile(dataFilePath, 'utf8');
    const currentData = JSON.parse(currentFile);
    
    // Hacemos merge (mezclamos) el contenido nuevo con el actual
    const newData = { ...currentData, ...body };
    
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
}
