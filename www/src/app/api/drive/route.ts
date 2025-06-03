import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const { fileName, content } = await request.json();

    if (!fileName || !content) {
      return NextResponse.json({ error: 'Missing fileName or content' }, { status: 400 });
    }

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    const file = await driveService.createFile(fileName, content);
    return NextResponse.json({ message: 'File created', file });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    const files = await driveService.listFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}