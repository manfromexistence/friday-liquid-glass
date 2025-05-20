import fs from 'fs';
import path from 'path';

export function findMetaFiles(dir: string): string[] {
    let metaFiles: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            metaFiles = metaFiles.concat(findMetaFiles(fullPath));
        } else if (entry.name === 'meta.json') {
            metaFiles.push(fullPath);
        }
    }
    return metaFiles;
}

export function sanitizeForFilename(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9_]/g, '-').replace(/-+/g, '-');
}