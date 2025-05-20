import fs from 'fs';
import path from 'path';

// Resolve paths from the workspace root where the script is expected to be run from (e.g., using `pnpm run script-name`)
const projectRoot = process.cwd(); // Assumes script is run from /workspaces/ui-g2/apps/www
const pageFilePath = path.join(projectRoot, 'app/(app)/g2/page.tsx'); 
const g2FilePath = path.join(projectRoot, 'app/(app)/g2/g2.tsx'); 

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

function getValidG2ComponentNames(filePath: string): Set<string> {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: G2 components file not found at ${filePath}`);
    process.exit(1); 
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const names = new Set<string>();
  // Regex to capture G2ChartComponent_ names from export statements like:
  // export { default as G2ChartComponent_general_pie_point_jitter_radial } from "...";
  const regex = /\s+as\s+(G2ChartComponent_[A-Za-z0-9_]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    names.add(match[1]);
  }
  if (names.size === 0) {
    console.warn(`Warning: No G2 component names found in ${path.basename(filePath)}. This might indicate an issue with the file or regex.`);
  }
  return names;
}

function run(): void {
  if (!fs.existsSync(pageFilePath)) {
    console.error(`Error: Page file not found at ${pageFilePath}`);
    process.exit(1);
  }

  const validG2Names = getValidG2ComponentNames(g2FilePath);
  if (validG2Names.size === 0) {
    console.log(`No G2 components found in ${path.basename(g2FilePath)}. No changes made to ${path.basename(pageFilePath)}.`);
    return;
  }

  const chartDisplayComponents: string[] = [];
  // Sort names for consistent order in the output file
  const sortedNames = Array.from(validG2Names).sort();

  for (const componentName of sortedNames) {
    const props = generatePropsFromG2ComponentName(componentName);
    if (props) {
      const { newName, newTitle } = props;
      // Ensure consistent indentation as in the target page.tsx structure
      const componentString = 
`            <ChartDisplay name="${newName}" title="${newTitle}">
              <Charts.${componentName} />
            </ChartDisplay>`;
      chartDisplayComponents.push(componentString);
    } else {
      // This case should ideally not happen if getValidG2ComponentNames filters correctly
      // and all names start with G2ChartComponent_
      console.warn(`Warning: ${componentName} from ${path.basename(g2FilePath)} did not yield props (e.g., might not start with G2ChartComponent_). Skipping.`);
    }
  }

  if (chartDisplayComponents.length === 0) {
    console.log(`No processable G2 components found to generate ChartDisplay blocks. No changes made to ${path.basename(pageFilePath)}.`);
    return;
  }
  
  const newExamplesContent = chartDisplayComponents.join('\n');

  let pageContent = fs.readFileSync(pageFilePath, 'utf-8');
  
  // Regex to find the content within the div with id="examples"
  // Captures: 
  // $1: The opening div tag (e.g., <div id="examples" className="...">) and the newline after it.
  // $2: The current inner content of the div.
  // $3: The newline before the closing div tag and the closing div tag itself (e.g., \n          </div>).
  const examplesDivRegex = /(<div\s+id="examples"[^>]*>\s*\n)([\s\S]*?)(\n\s*<\/div>)/;
  
  const originalPageContent = pageContent;
  if (examplesDivRegex.test(pageContent)) {
    pageContent = pageContent.replace(examplesDivRegex, `$1${newExamplesContent}\n$3`);
    
    if (pageContent !== originalPageContent) {
      fs.writeFileSync(pageFilePath, pageContent, 'utf-8');
      console.log(`Successfully updated ${path.basename(pageFilePath)} with ${chartDisplayComponents.length} G2 chart components.`);
    } else {
      console.log(`Content for <div id="examples"> in ${path.basename(pageFilePath)} is already up-to-date with ${chartDisplayComponents.length} G2 chart components.`);
    }
  } else {
    console.error(`Error: Could not find the <div id="examples">...</div> block in ${path.basename(pageFilePath)}. No changes were made.`);
    process.exit(1);
  }
}

run();
