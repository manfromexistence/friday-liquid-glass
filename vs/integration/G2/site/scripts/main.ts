import fs from 'fs';
import path from 'path';

import { findMetaFiles, sanitizeForFilename } from './file-utils.ts';
import { extractAndAdaptG2Code } from './g2-code-adapter.ts';
import { getReactComponentTemplate } from './react-component-generator.ts';
import { generateTitleFromPath } from './title-generator.ts';

const baseWorkspaceDir = '/workspaces/ui-g2/';
const sourceBaseDir = path.join(baseWorkspaceDir, 'integration/G2/site/examples');
const targetBaseDir = path.join(baseWorkspaceDir, 'apps/www/registry/default/g2');

function main() {
    console.log(`Source G2 examples directory: ${sourceBaseDir}`);
    console.log(`Target React G2 components directory: ${targetBaseDir}`);

    if (!fs.existsSync(sourceBaseDir)) {
        console.error(`Source directory ${sourceBaseDir} does not exist.`);
        return;
    }

    if (!fs.existsSync(targetBaseDir)) {
        fs.mkdirSync(targetBaseDir, { recursive: true });
        console.log(`Created target directory: ${targetBaseDir}`);
    }

    const metaFiles = findMetaFiles(sourceBaseDir);
    console.log(`Found ${metaFiles.length} meta.json files.`);
    let createdCount = 0;

    metaFiles.forEach(metaFilePath => {
        try {
            const metaFileContent = fs.readFileSync(metaFilePath, 'utf-8');
            const metaData = JSON.parse(metaFileContent);
            const metaFileDir = path.dirname(metaFilePath);

            if (metaData.demos && Array.isArray(metaData.demos)) {
                metaData.demos.forEach(demo => {
                    if (demo.filename && demo.filename.endsWith('.ts')) {
                        const originalG2FileName = demo.filename;
                        const originalG2FilePath = path.join(metaFileDir, originalG2FileName);

                        if (!fs.existsSync(originalG2FilePath)) {
                            console.warn(`Original G2 file not found: ${originalG2FilePath}`);
                            return;
                        }

                        let cardTitle = "";
                        if (demo.title && demo.title.en) {
                            cardTitle = demo.title.en;
                        } else {
                            if (originalG2FilePath.endsWith('accessible/text-searching/demo/text-search.ts')) {
                                cardTitle = "Accessible TextSearching";
                            } else {
                                cardTitle = generateTitleFromPath(originalG2FilePath, sourceBaseDir, originalG2FileName);
                            }
                        }

                        const relativeToExamples = path.relative(sourceBaseDir, metaFileDir);
                        const namePrefix = relativeToExamples.split(path.sep).filter(p => p !== 'demo').map(sanitizeForFilename).join('-');
                        const baseName = sanitizeForFilename(originalG2FileName.replace(/\.ts$/, ''));
                        let targetReactFileName = namePrefix ? `${namePrefix}-${baseName}.tsx` : `${baseName}.tsx`;
                        targetReactFileName = targetReactFileName.replace(/-+/g, '-');
                        const targetReactFilePath = path.join(targetBaseDir, targetReactFileName);
                        const chartIdBase = targetReactFileName.replace(/\.tsx$/, '');

                        const originalG2SourceCode = fs.readFileSync(originalG2FilePath, 'utf-8');
                        // Pass both g2InstanceVarName ('g2ChartInstance.current') and domContainerVarName ('chartRef.current')
                        const g2Logic = extractAndAdaptG2Code(originalG2SourceCode, 'g2ChartInstance.current', 'chartRef.current');

                        const reactComponentContent = getReactComponentTemplate(originalG2FilePath, cardTitle, chartIdBase, g2Logic, baseWorkspaceDir);
                        fs.writeFileSync(targetReactFilePath, reactComponentContent);
                        console.log(`Created React G2 stub: ${targetReactFilePath} (Title: "${cardTitle}")`);
                        createdCount++;
                    }
                });
            }
        } catch (error) {
            console.error(`Error processing ${metaFilePath}: ${error.message}\n${error.stack}`);
        }
    });

    console.log(`Script finished. Created ${createdCount} React G2 component stubs in ${targetBaseDir}.`);
    console.log("IMPORTANT: Review each generated file. The G2 logic extraction is heuristic and will likely require manual adjustments and debugging.");
}

main();
