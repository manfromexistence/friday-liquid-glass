// @ts-nocheck
export function extractAndAdaptG2Code(
    originalG2SourceCode: string, 
    g2InstanceVarName = "g2ChartInstance.current", 
    domContainerVarName = "chartRef.current"
) {
    let g2CodeBlock = "";
    const originalImports = new Set<string>();
    let helperCode = "";

    // 1. Extract imports from @antv packages
    const importRegex = /import\s+{[^}]*}?\s*from\s+['"](@antv\/[a-zA-Z0-9_-]+[^'"]*)['"];?/g;
    let importMatch;
    while ((importMatch = importRegex.exec(originalG2SourceCode)) !== null) {
        originalImports.add(importMatch[0]);
    }

    // Consolidate 'register' imports, prioritizing @antv/g2
    const finalImports = new Set<string>();
    let g2CoreRegisterImported = false;

    originalImports.forEach(imp => {
        if (imp.includes("@antv/g2") && imp.includes("register")) {
            g2CoreRegisterImported = true;
        }
    });

    if (originalG2SourceCode.includes("new Chart(") && !g2CoreRegisterImported) {
        let g2ImportLine = Array.from(originalImports).find(line => line.includes("@antv/g2") && !line.includes("register"));
        if (g2ImportLine) {
            originalImports.delete(g2ImportLine);
            if (g2ImportLine.includes("{") && g2ImportLine.includes("}")) {
                 g2ImportLine = g2ImportLine.replace('}', ', register }');
            } else { 
                 g2ImportLine += `\nimport { register } from "@antv/g2";`; 
            }
            originalImports.add(g2ImportLine);
            g2CoreRegisterImported = true;
        } else if (!Array.from(originalImports).some(line => line.includes("@antv/g2"))) {
            originalImports.add('import { Chart, register } from "@antv/g2";');
            g2CoreRegisterImported = true;
        }
    }
    
    originalImports.forEach(imp => {
        if (g2CoreRegisterImported && imp.includes("register") && !imp.includes("@antv/g2") && imp.startsWith("import") && imp.includes("@antv")) {
            let modifiedImp = imp.replace(/{\s*register\s*,?\s*/, '{ ').replace(/,\s*register\s*}/, ' }').replace(/{\s*register\s*}/, '{ }');
            if (modifiedImp.includes("{ } from")) { // Only register was imported
                // Skip adding this line
            } else if (modifiedImp.trim() === "import { } from" || modifiedImp.trim() === "import {} from") {
                // Skip if it becomes an empty import
            } else if (modifiedImp !== imp && modifiedImp.includes("{") && !modifiedImp.match(/{[^}]*\w/)) {
                // If it became `import { } from '...'` but originally had other imports, this logic is flawed.
                // For now, if it results in an empty curly brace but wasn't just `import {register}`, keep original.
                // This case is complex; the goal is to remove *only* register if other named imports exist.
                // A simple check: if `modifiedImp` still has other named imports, add it.
                // If `modifiedImp` is `import { , foo }` or `import { foo, }`, it needs cleanup.
                // Let's refine:
                modifiedImp = modifiedImp.replace(/{\s*,/, '{').replace(/,\s*}/, '}'); // Clean up dangling commas
                if (modifiedImp.includes("{ }")) { // If it truly became empty
                    // don't add
                } else {
                    finalImports.add(modifiedImp);
                }
            } else {
                 finalImports.add(modifiedImp);
            }
        } else {
            finalImports.add(imp);
        }
    });
     // Ensure Chart from @antv/g2 is imported if new Chart() is used and not already handled
    if (originalG2SourceCode.includes("new Chart(") && !Array.from(finalImports).some(imp => imp.includes("Chart") && imp.includes("@antv/g2"))) {
        let g2ImportLine = Array.from(finalImports).find(line => line.includes("@antv/g2"));
        if (g2ImportLine && g2ImportLine.includes("register") && !g2ImportLine.includes("Chart")) {
            finalImports.delete(g2ImportLine);
            finalImports.add(g2ImportLine.replace('{', '{ Chart, '));
        } else if (!g2ImportLine) {
            finalImports.add('import { Chart, register } from "@antv/g2";');
        }
    }

    let originalChartVarName = null;
    let initializationStartIndex = -1;
    let initializationEndIndex = -1; 

    const chartVarRegex = /(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*new\s+Chart\s*\(([\s\S]*?)\);/m;
    const chartVarMatch = originalG2SourceCode.match(chartVarRegex);

    if (chartVarMatch) {
        originalChartVarName = chartVarMatch[1];
        initializationStartIndex = chartVarMatch.index;
        initializationEndIndex = chartVarMatch.index + chartVarMatch[0].length;
    }

    // Process code occurring *before* the `new Chart()` call.
    // Include all of it in helperCode to ensure no definitions are lost.
    if (initializationStartIndex > 0) {
        let preChartCode = originalG2SourceCode.substring(0, initializationStartIndex);
        
        // Filter out import statements from preChartCode, as they are handled separately
        const preChartCodeLines = preChartCode.split('\n');
        const nonImportLines = preChartCodeLines.filter(line => !line.trim().startsWith('import '));
        preChartCode = nonImportLines.join('\n');

        // Perform adaptations on this block if necessary
        if (originalChartVarName && originalChartVarName !== g2InstanceVarName) {
            preChartCode = preChartCode.replace(new RegExp(`\\b${originalChartVarName}\\.(?!current\\b)`, "g"), `${g2InstanceVarName}.`);
            preChartCode = preChartCode.replace(new RegExp(`\\b${originalChartVarName}\\b(?!\\.|\\s*=\\s*new\\s+Chart)`, "g"), `${g2InstanceVarName}`);
        }
        if (originalChartVarName !== 'chart') { // Fallback for literal 'chart'
             preChartCode = preChartCode.replace(/\bchart\.(?!current\\b)/g, `${g2InstanceVarName}.`);
             preChartCode = preChartCode.replace(/\bchart\b(?!\\.|\\s*=\\s*new\\s+Chart)/g, `${g2InstanceVarName}`);
        }

        if (preChartCode.trim().length > 0) {
            helperCode += "// Code from original script before chart initialization:\n";
            helperCode += preChartCode.trim() + "\n\n";
        }
    }
    // Note: The previous logic using `potentialHelpers` and `topLevelDeclarationRegex` for pre-chart code is now replaced by the above block.
    // `topLevelDeclarationRegex` will still be used for processing post-chart-initialization code.

    // Refined regex to better capture full bodies of multi-line helpers for post-chart code.
    const topLevelDeclarationRegex = /^(?:export\s+)?(?:async\s+)?(?:const|let|var|function(?:\s*\*)?|class)\s+([a-zA-Z_]\w*)\s*[\s\S]*?(?=\n\s*^(?:(?:export\s+)?(?:async\s+)?(?:const|let|var|function(?:\s*\*)?|class)\s+[a-zA-Z_]\w*)|(?:const|let|var)\s+[a-zA-Z_]\w*\s*=\s*new\s+Chart\s*[(]|\Z)/gm;
    
    // Removed static palette registration from helperCode.

    // 3. Extract the G2 chart initialization logic and subsequent code
    if (chartVarMatch) { 
        let chartArgs = chartVarMatch[2];

        // Use domContainerVarName for the container property
        chartArgs = chartArgs.replace(
            /container\s*:\s*(['"`])?[a-zA-Z0-9_]+(['"`])?/,
            `container: ${domContainerVarName}`
        );
        chartArgs = chartArgs.replace(
            /container\s*:\s*document\.getElementById\([^)]+\)/,
            `container: ${domContainerVarName}`
        );

        // Use g2InstanceVarName for assigning the new Chart instance
        let chartInitializationCode = `${g2InstanceVarName} = new Chart(${chartArgs});\n`;

        const postInitializationCode = originalG2SourceCode.substring(initializationEndIndex);
        
        let adaptedPostInitializationCode = postInitializationCode;

        // Handle originalChartVarName first if it exists
        if (originalChartVarName) {
            adaptedPostInitializationCode = adaptedPostInitializationCode.replace(
                new RegExp(`\\b${originalChartVarName}\\.(?!current\\b)`, "g"), // Avoid replacing .current if g2InstanceVarName is like 'g2ChartInstance.current'
                `${g2InstanceVarName}.`
            );
            adaptedPostInitializationCode = adaptedPostInitializationCode.replace(
                new RegExp(`\\b${originalChartVarName}\\b(?!\\.|\\s*=\\s*new\\s+Chart)`, "g"), // Avoid replacing the var in its own declaration
                `${g2InstanceVarName}`
            );
        }
        
        // Fallback for literal 'chart' if originalChartVarName was not 'chart' or was null
        if (originalChartVarName !== 'chart') {
            adaptedPostInitializationCode = adaptedPostInitializationCode.replace(
                /\bchart\.(?!current\b)/g, // Avoid replacing .current
                `${g2InstanceVarName}.`
            );
            adaptedPostInitializationCode = adaptedPostInitializationCode.replace(
                /\bchart\b(?!\\.|\\s*=\\s*new\\s+Chart)/g, // Avoid replacing var in new Chart or if it's 'chart.current'
                `${g2InstanceVarName}`
            );
        }
        
        const linesFromAdaptedPostInit = adaptedPostInitializationCode.split('\n');
        let lastG2OpLineActualIndex = -1;
        const g2OpPattern = new RegExp(`^\\s*${g2InstanceVarName.replace('.', '\\.')}\\.`);
        // declarationPattern and commentOrEmptyPattern are already defined earlier in the function
        // const declarationPattern = /^\s*(?:export\s+)?(?:async\s+)?(const|let|var|function(?:\s*\*)?|class)\s+/;
        // const commentOrEmptyPattern = /^\s*(\/\/.*)?$/;


        for (let i = 0; i < linesFromAdaptedPostInit.length; i++) {
            if (g2OpPattern.test(linesFromAdaptedPostInit[i].trim())) {
                lastG2OpLineActualIndex = i;
            }
        }
        
        let currentChartOpLines = [];
        let currentTrailingHelperLines = [];

        if (lastG2OpLineActualIndex !== -1) {
            currentChartOpLines = linesFromAdaptedPostInit.slice(0, lastG2OpLineActualIndex + 1);
            currentTrailingHelperLines = linesFromAdaptedPostInit.slice(lastG2OpLineActualIndex + 1);
        } else {
            // No G2 ops found after chart initialization in adaptedPostInitializationCode.
            // Re-parse this segment to separate declarations (helpers) from other code.
            const postInitContent = linesFromAdaptedPostInit.join('\n');
            const tempPostInitHelpers = [];
            const tempPostInitOpsSegments = []; // Store segments of non-helper code

            let lastRegexIndex = 0;
            topLevelDeclarationRegex.lastIndex = 0; // Reset regex state before reuse
            let match;

            while((match = topLevelDeclarationRegex.exec(postInitContent)) !== null) {
                // Content before the current match is considered non-helper (ops/misc)
                if (match.index > lastRegexIndex) {
                    tempPostInitOpsSegments.push(postInitContent.substring(lastRegexIndex, match.index));
                }
                // The matched content is a declaration (helper)
                tempPostInitHelpers.push(match[0]);
                lastRegexIndex = match.index + match[0].length;
            }
            // Any remaining content after the last declaration match is non-helper
            if (lastRegexIndex < postInitContent.length) {
                tempPostInitOpsSegments.push(postInitContent.substring(lastRegexIndex));
            }

            if (tempPostInitHelpers.length > 0) {
                 // Join helper declarations with double newlines, then split back into lines
                currentTrailingHelperLines = tempPostInitHelpers.join("\n\n").split('\n');
            } else {
                currentTrailingHelperLines = [];
            }
           
            if (tempPostInitOpsSegments.length > 0) {
                // Join ops segments (which might preserve original newlines), then split
                currentChartOpLines = tempPostInitOpsSegments.join('').split('\n');
            } else {
                currentChartOpLines = [];
            }

            // Filter out any potential empty lines from split operations
            currentTrailingHelperLines = currentTrailingHelperLines.filter(line => line.trim() !== '' || line === ''); // Keep intentionally blank lines within helpers
            currentChartOpLines = currentChartOpLines.filter(line => line.trim() !== '' || line === ''); // Keep intentionally blank lines within ops
        }
        
        // Filter out a leading stray '});' from the start of currentTrailingHelperLines
        if (currentTrailingHelperLines.length > 0 && currentTrailingHelperLines[0].trim() === '});') {
            currentTrailingHelperLines.shift(); // Remove it
        }
        
        if (currentTrailingHelperLines.length > 0) {
            const newTrailingHelpers = currentTrailingHelperLines.join('\n');
            if (newTrailingHelpers.trim().length > 0) { // Only add if there's actual content
                if (helperCode.trim().length > 0 && !helperCode.endsWith('\n\n') && !helperCode.endsWith('\n')) {
                    helperCode += '\n'; // Add one newline if there's existing helper code but no trailing newlines
                }
                 if (helperCode.trim().length > 0 && !helperCode.endsWith('\n\n')) {
                     helperCode += '\n'; // Ensure a blank line before appending new helpers if there's existing content
                 }
                helperCode += "// Trailing helpers extracted from original:\n" + newTrailingHelpers;
            }
        }
        // Ensure helperCode ends with a newline if it has content
        if (helperCode.trim().length > 0 && !helperCode.endsWith('\n')) {
            helperCode += '\n';
        }


        let tempPostInitOps = currentChartOpLines.join('\n');
        
        // Clean up stray '});' from tempPostInitOps before adding theme or render
        tempPostInitOps = tempPostInitOps.trim();
        if (tempPostInitOps.endsWith('});')) {
            const coreOps = tempPostInitOps.substring(0, tempPostInitOps.length - 2).trim();
            // Ensure the part before '});' is a valid statement ending
            if (coreOps.endsWith(';') || coreOps.endsWith(')') || coreOps.endsWith('}')) {
                tempPostInitOps = coreOps;
            }
        }

        const themeOverrideCode = `${g2InstanceVarName}.theme({ defaultCategory10: 'shadcnPalette', defaultCategory20: 'shadcnPalette' });`;
        
        let themeCallFoundInPostInit = false;
        const themeCallRegexForPostInit = new RegExp(`\\b${g2InstanceVarName.replace('.', '\\.')}\\.theme\\s*\\([^)]*\\)`);
        if (themeCallRegexForPostInit.test(tempPostInitOps)) {
            themeCallFoundInPostInit = true;
            // If a theme call exists, we assume it's handled or shadcnPalette is added correctly.
            // For simplicity, we will ensure our theme is applied. We can prepend it if complex logic arises.
            // Or, more robustly, find the first top-level statement and insert before/after.
            // For now, let's ensure it's present. If the original already sets defaultCategory10, this might override.
            // This part might need more sophisticated logic if originals have complex theme setups.
             tempPostInitOps = themeOverrideCode + "\n" + tempPostInitOps; // Prepend to be safe
        } else {
            tempPostInitOps = themeOverrideCode + "\n" + tempPostInitOps;
        }
        
        g2CodeBlock = chartInitializationCode + tempPostInitOps; // Correctly combine chart init and operations

        // Remove any trailing }); that might have been incorrectly captured or formed
        // This is a bit of a heuristic. A more robust solution would involve AST parsing.
        g2CodeBlock = g2CodeBlock.trim();
        // If g2CodeBlock ends with '});' and this '});' is not part of a valid code structure
        // (e.g., it's truly extraneous after all operations).
        if (g2CodeBlock.endsWith('});')) {
            // A simple check: if the part before '});' ends with a semicolon or a closing brace from a method chain,
            // then the '});' is likely extraneous.
            const coreCode = g2CodeBlock.substring(0, g2CodeBlock.length - 2).trim();
            if (coreCode.endsWith(';') || coreCode.endsWith(')')) { // Or other valid statement endings
                 g2CodeBlock = coreCode;
            }
        }


        const renderCallPatternInAdapted = new RegExp(`\\b${g2InstanceVarName.replace('.', '\\.')}\\.render\\s*\\(\\s*\\)\\s*;?`);
        if (!renderCallPatternInAdapted.test(g2CodeBlock)) { // Test the whole g2CodeBlock
            // If render is not found, append it. This is crucial for async data loading.
            // Ensure it's appended as a new statement.
            if (!g2CodeBlock.trim().endsWith(';') && !g2CodeBlock.trim().endsWith('}')) {
                 g2CodeBlock += ';';
            }
            g2CodeBlock += `\n${g2InstanceVarName}.render();`;
        }
    } else {
        // Fallback if no `new Chart(...)` was found by the regex
        g2CodeBlock = `// TODO: Could not automatically find 'new Chart(...)' initialization.\n`;
        g2CodeBlock += `// Please review the original script and adapt the G2 logic, ensuring to use '${g2InstanceVarName}' for the chart instance and '${domContainerVarName}' for the container.\n`;
        
        // Suggest applying the theme, assuming palette is registered by the component
        g2CodeBlock += `\n// Remember to register 'shadcnPalette' with resolved colors and apply the theme: \n// register('palette.shadcnPalette', () => resolvedShadcnColors); \n// ${g2InstanceVarName}.theme({ defaultCategory10: 'shadcnPalette', defaultCategory20: 'shadcnPalette' });\n`;

        if (helperCode.trim().length > 0) {
             g2CodeBlock += `// Some top-level declarations might have been extracted into 'helpers' above.\n`;
        }
        g2CodeBlock += `// Original script content (partial for reference):\n`;
        
        const snippetMaxLength = 1000;
        let displaySnippet = originalG2SourceCode.substring(0, snippetMaxLength);
        if (originalG2SourceCode.length > snippetMaxLength) {
            displaySnippet += "\n// ... (code truncated)";
        }
        
        // Basic adaptation attempt for the snippet
        if (originalChartVarName && originalChartVarName !== 'chart') {
            displaySnippet = displaySnippet.replace(new RegExp(`\\b${originalChartVarName}\\.`, "g"), `${g2InstanceVarName}.`);
            displaySnippet = displaySnippet.replace(new RegExp(`\\b${originalChartVarName}\\b(?!\\.)`, "g"), `${g2InstanceVarName}`);
        }
        // Always try to adapt literal 'chart' in snippet as it's a common case / fallback
        displaySnippet = displaySnippet.replace(/\bchart\./g, `${g2InstanceVarName}.`);
        displaySnippet = displaySnippet.replace(/\bchart\b(?!\.)/g, `${g2InstanceVarName}`);
        
        g2CodeBlock += `// (Attempted to adapt chart references to '${g2InstanceVarName}' in the snippet below)\n`;
        
        g2CodeBlock += displaySnippet.split('\n').map(l => `// ${l}`).join('\n');
    }

    return {
        imports: Array.from(finalImports).join("\n"),
        g2Code: g2CodeBlock.trim(), 
        helpers: helperCode.trim() 
    };
}
