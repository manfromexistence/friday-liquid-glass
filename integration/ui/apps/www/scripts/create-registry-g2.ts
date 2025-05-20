import * as fs from 'fs';
import * as path from 'path';

const registryFolder = path.resolve(__dirname, '../registry');
const indexFilePath = path.resolve(__dirname, '../registry/default/g2/index.ts');
const registryG2FilePath = path.join(registryFolder, 'registry-g2.ts');

// Ensure the registry folder exists
if (!fs.existsSync(registryFolder)) {
  fs.mkdirSync(registryFolder);
}

// Read data from index.ts
const indexFileContent = fs.readFileSync(indexFilePath, 'utf-8');

// Transform the content into a registry format
const registryItems = indexFileContent
  .split('\n')
  .filter((line) => line.startsWith('export { default as '))
  .map((line) => {
    const match = line.match(/export { default as (.+) } from "\.\/(.+)";/);
    if (!match) return null;

    const [_, name, filePath] = match;
    return `  {
    name: "${name}",
    type: "registry:block",
    files: [
      {
        path: "g2/${filePath}.tsx",
        type: "registry:block",
      },
    ],
    categories: ["g2"],
  },`;
  })
  .filter(Boolean)
  .join('\n');

// Create the registry-g2.ts file
const registryG2Content = `// filepath: /workspaces/ui-g2/apps/www/registry/registry-g2.ts
import { type Registry } from "shadcn/registry";

export const g2: Registry["items"] = [
${registryItems}
];
`;

fs.writeFileSync(registryG2FilePath, registryG2Content);

console.log(`File created: ${registryG2FilePath}`);

