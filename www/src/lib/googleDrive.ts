import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
}

export class GoogleDriveService {
  private driveClient;

  constructor(clientEmail: string, privateKey: string, folderId?: string) {
    const auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth,
    });
  }

  async createFile(fileName: string, content: string, mimeType = 'application/json'): Promise<DriveFile> {
    const fileMetadata: any = {
      name: fileName,
      mimeType,
    };

    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
    }

    const response = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: content,
      },
      fields: 'id, name',
    });

    return response.data as DriveFile;
  }

  async getFile(fileId: string): Promise<string> {
    const response = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    let data = '';
    for await (const chunk of response.data) {
      data += chunk;
    }
    return data;
  }

  async listFiles(): Promise<DriveFile[]> {
    const query = process.env.GOOGLE_DRIVE_FOLDER_ID
      ? `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`
      : undefined;

    const response = await this.driveClient.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    return response.data.files as DriveFile[];
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.driveClient.files.delete({ fileId });
  }
}