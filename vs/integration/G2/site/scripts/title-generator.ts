import path from 'path';

export function generateTitleFromPath(g2FilePath: string, sourceBaseDir: string, demoFileName: string): string {
    const relativePath = path.relative(sourceBaseDir, g2FilePath);
    const parts = relativePath.split(path.sep);
    let titleParts: string[] = [];
    if (parts.length > 2 && parts[parts.length - 2] === 'demo') {
        titleParts = parts.slice(0, parts.length - 2);
        titleParts.push(demoFileName.replace(/\.ts$/, ''));
    } else {
        titleParts = parts.map(p => p === demoFileName ? p.replace(/\.ts$/, '') : p);
    }
    return titleParts
        .map(part => part.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(''))
        .join(' ');
}