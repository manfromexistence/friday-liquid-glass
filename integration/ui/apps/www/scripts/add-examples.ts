import fs from "fs";
import path from "path";

const indexFilePath = path.resolve(
  __dirname,
  "../registry/default/g2/index.ts"
);
const outputFilePath = path.resolve(
  __dirname,
  "../app/(app)/visualizations/op.tsx"
);

function getComponentsFromIndex() {
  const indexFileContent = fs.readFileSync(indexFilePath, "utf-8");
  const componentMatches = indexFileContent.matchAll(
    /export { default as (\w+) } from ".*";/g
  );
  return Array.from(componentMatches).map((match) => match[1]);
}

interface Component {
    name: string;
}

function generateComponentsCode(components: string[]): string {
    return components
        .map(
            (component: string) => `
                <div key="${component}" className="component-item">
                    <h3>${component}</h3>
                    <Charts.${component} />
                </div>
            `
        )
        .join("\n");
}

function generateOutputFile() {
  const components = getComponentsFromIndex();
  if (components.length === 0) {
    console.warn("No components found in index.ts.");
  }

  const componentsCode = generateComponentsCode(components);

  const outputFileContent = `
    import * as Charts from "../registry/default/g2";

    export default function Visualizations() {
      return (
        <div className="grid flex-1 gap-12">
          ${componentsCode}
        </div>
      );
    }
  `;

  fs.writeFileSync(outputFilePath, outputFileContent.trim(), "utf-8");
  console.log(
    components.length > 0
      ? "op.tsx has been generated with all components."
      : "op.tsx has been generated with no components."
  );
}

try {
  console.log("Generating op.tsx...");
  generateOutputFile();
  console.log("Generation complete.");
} catch (error) {
  console.error("An error occurred:", error);
}
