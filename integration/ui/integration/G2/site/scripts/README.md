'''
# G2 React Stub Generation Scripts

This directory contains scripts used to generate React component stubs from G2 example code.

## Overview

The primary goal of these scripts is to automate the initial creation of React components that wrap G2 chart configurations. This helps in integrating G2 visualizations into a React-based application.

## File Structure

-   `main.ts`: The main executable script that orchestrates the stub generation process. It reads `meta.json` files from the G2 examples directory, processes each demo, and generates corresponding React components.
-   `file-utils.ts`: Contains utility functions for file system operations, such as finding `meta.json` files (`findMetaFiles`) and sanitizing strings for use as filenames (`sanitizeForFilename`).
-   `g2-code-adapter.ts`: Includes the core logic for `extractAndAdaptG2Code`. This function attempts to extract G2 chart initialization code, imports, and helper functions from the original G2 example files and adapt them for a React environment.
-   `react-component-generator.ts`: Provides the `getReactComponentTemplate` function, which generates the string content for the React component file. This template includes boilerplate for a React functional component, `useEffect` for chart initialization and cleanup, and `Card` components for presentation.
-   `title-generator.ts`: Contains the `generateTitleFromPath` function, used to create a human-readable title for the generated component based on its original file path if a title is not provided in the `meta.json`.

## How to Run

1.  Ensure you have Node.js and the necessary dependencies installed (e.g., `fs`, `path`).
2.  Navigate to the `integration/G2/site/scripts/` directory in your terminal.
3.  Execute the main script:

    ```bash
    npx ts-node main.ts
    ```

    *(You might need to install `ts-node` globally or as a dev dependency: `npm install -g ts-node` or `npm install --save-dev ts-node`)*

## Important Considerations

-   **Heuristic Extraction**: The G2 code extraction logic in `g2-code-adapter.ts` is heuristic. It makes assumptions about the structure of the G2 example code. Therefore, the generated stubs will likely require manual review, adjustments, and debugging to function correctly.
-   **Path Configuration**: The script uses hardcoded base paths (`baseWorkspaceDir`, `sourceBaseDir`, `targetBaseDir`) within `main.ts`. You may need to adjust these if your directory structure differs.
-   **Dependencies**: The generated React components might have dependencies (e.g., `@antv/g2`, `@/registry/default/ui/card`). Ensure these are correctly installed and resolvable in the target project where these components will be used.

## Workflow

1.  The `main.ts` script starts by defining source and target directories.
2.  It uses `findMetaFiles` (from `file-utils.ts`) to locate all `meta.json` files within the G2 example source directory.
3.  For each `meta.json` file, it iterates through the demos listed.
4.  For each demo:
    a.  It constructs the path to the original G2 TypeScript file.
    b.  It determines a `cardTitle` for the component, either from `meta.json` or by using `generateTitleFromPath` (from `title-generator.ts`).
    c.  It generates a `targetReactFileName` using `sanitizeForFilename` (from `file-utils.ts`).
    d.  It reads the original G2 source code.
    e.  It calls `extractAndAdaptG2Code` (from `g2-code-adapter.ts`) to process the G2 code.
    f.  It calls `getReactComponentTemplate` (from `react-component-generator.ts`) to create the React component code.
    g.  It writes the generated component to the target directory.
5.  The script outputs progress and a summary of created files.

This refactoring aims to make the codebase more modular, easier to understand, and maintain.
'''

git remote set-url origin https://manfromexistence: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@github.com/manfromexistence/ui-g2.git