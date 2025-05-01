import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import fetch from "node-fetch";
import config from "../figma.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fetchFigmaData() {
  const response = await fetch(
    `https://api.figma.com/v1/files/${config.fileId}`,
    {
      headers: {
        "X-Figma-Token": config.accessToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma data: ${response.statusText}`);
  }

  return response.json();
}

async function generateTokens(figmaData) {
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    shadows: {},
    radii: {},
  };

  // Process Figma data and extract tokens
  // This is a simplified example - you'll need to adapt this based on your Figma structure
  const styles = figmaData.styles || {};

  Object.entries(styles).forEach(([key, style]) => {
    if (style.type === "FILL" && config.tokens.colors) {
      tokens.colors[key] = style.fills[0].color;
    }
    // Add more token processing as needed
  });

  // Create output directory if it doesn't exist
  await fs.mkdir(config.output.tokens, { recursive: true });

  // Write tokens to file
  await fs.writeFile(
    join(config.output.tokens, "tokens.json"),
    JSON.stringify(tokens, null, 2)
  );
}

async function main() {
  try {
    console.log("Fetching Figma data...");
    const figmaData = await fetchFigmaData();

    console.log("Generating tokens...");
    await generateTokens(figmaData);

    console.log("Successfully synced Figma tokens!");
  } catch (error) {
    console.error("Error syncing Figma tokens:", error);
    process.exit(1);
  }
}

main();
