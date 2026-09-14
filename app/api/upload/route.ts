import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    // Create unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Upload to Vercel Blob
    const blob = await put(uniqueName, file, {
      access: 'public',
    });
    
    // Return the public URL path
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Error in upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
