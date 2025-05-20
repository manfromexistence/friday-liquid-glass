import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd(); // Assumes script is run from /workspaces/ui-g2
const pageFilePath = path.join(projectRoot, 'apps/www/app/(app)/g2/page.tsx');

function generatePropsFromG2ComponentName(g2ComponentName: string): { newName: string; newTitle: string } | null {
  if (!g2ComponentName.startsWith('G2ChartComponent_')) {
    return null;
  }
  const baseName = g2ComponentName.substring('G2ChartComponent_'.length);
  
  const newTitle = baseName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const newName = baseName.replace(/_/g, '-').toLowerCase();
  
  return { newName, newTitle };
}

function parseAttributes(attrsStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)=({`[^`]*`}|"[^"]*"|'[^']*'|\S+)/g;
  let match;
  while ((match = attrRegex.exec(attrsStr)) !== null) {
    // Remove quotes from simple string values, keep template literals/expressions as is
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    attrs[match[1]] = value;
  }
  return attrs;
}

function buildAttributes(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([key, value]) => {
      // Check if value needs to be wrapped in quotes or is an expression
      if (value.startsWith('{') && value.endsWith('}')) {
        return `${key}=${value}`; // JSX expression
      }
      if (value.includes('"') && value.includes("'")) { // Contains both, use template literal
         return `${key}={\`${value.replace(/`/g, '\\`')}\`}`;
      }
      if (value.includes("'") || value.includes(" ") || value.includes("[")) { // Contains single quote or space or bracket, use double quotes
        return `${key}="${value.replace(/"/g, '&quot;')}"`;
      }
      // Default to double quotes for safety, or no quotes if simple
      return `${key}="${value}"`;
    })
    .join(' ');
}

function run(): void {
  if (!fs.existsSync(pageFilePath)) {
    console.error(`Error: Page file not found at ${pageFilePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(pageFilePath, 'utf-8');
  let updatedContent = content;
  let changesMade = false;
  let warnings = 0;

  // Regex to find ChartDisplay blocks and capture attributes and the child component name
  // It handles self-closing or non-self-closing Charts.Component
  const chartDisplayRegex = /<ChartDisplay\s+([^>]*?)>\s*<Charts\.([A-Za-z0-9_]+)\s*(?:\/>|>\s*<\/Charts\.\2\s*>)\s*<\/ChartDisplay>/gs;

  let match;
  const replacements = [];

  while ((match = chartDisplayRegex.exec(content)) !== null) {
    const originalBlock = match[0];
    const attributesString = match[1];
    const childComponentName = match[2];

    const props = generatePropsFromG2ComponentName(childComponentName);

    if (props) {
      const { newName, newTitle } = props;
      let currentAttributes = parseAttributes(attributesString);
      
      currentAttributes['name'] = newName;
      currentAttributes['title'] = newTitle;
      
      const newAttributesString = buildAttributes(currentAttributes);
      const newBlock = `<ChartDisplay ${newAttributesString}>\n              <Charts.${childComponentName} />\n            </ChartDisplay>`;
      
      if (originalBlock !== newBlock) {
        replacements.push({ original: originalBlock, new: newBlock });
        changesMade = true;
      }
    } else {
      console.warn(`Warning: Child component <Charts.${childComponentName} /> inside a ChartDisplay block is not a G2 component (does not start with G2ChartComponent_). Props for this ChartDisplay block will not be updated. Please manually update this component reference first.`);
      warnings++;
    }
  }

  // Apply replacements from end to start to avoid index issues
  for (let i = replacements.length - 1; i >= 0; i--) {
    updatedContent = updatedContent.replace(replacements[i].original, replacements[i].new);
  }

  if (changesMade) {
    fs.writeFileSync(pageFilePath, updatedContent, 'utf-8');
    console.log(`Successfully updated ChartDisplay props in ${pageFilePath}.`);
  } else {
    console.log(`No ChartDisplay props needed updating in ${pageFilePath} for already conforming G2 components.`);
  }
  if (warnings > 0) {
    console.log(`Found ${warnings} ChartDisplay block(s) with non-G2 child components. These were not modified.`);
  }
  if (!changesMade && warnings === 0) {
    console.log("No changes or warnings. The file seems to be up-to-date or contains no processable ChartDisplay blocks.");
  }
}

run();
