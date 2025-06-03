import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    const content = await driveService.getFile(fileId);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}