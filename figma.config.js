export default {
  // Your Figma file ID (found in the URL of your Figma file)
  fileId: "YOUR_FIGMA_FILE_ID",

  // Your Figma personal access token
  // Generate this from Figma -> Settings -> Account -> Personal access tokens
  accessToken: "YOUR_FIGMA_ACCESS_TOKEN",

  // Design tokens to sync
  tokens: {
    colors: true,
    typography: true,
    spacing: true,
    shadows: true,
    radii: true,
  },

  // Output paths for generated files
  output: {
    tokens: "src/styles/tokens",
    components: "src/shared/components/figma",
  },

  // Component mapping
  components: {
    // Map Figma component names to your React component names
    "Button/Primary": "Button",
    "Button/Secondary": "Button",
    "Input/Default": "Input",
    // Add more component mappings as needed
  },
};
