import sharedConfig from "@tools/eslint-config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Override the tsconfigRootDir for this package
export default sharedConfig.map((config) => {
  // Only modify configs that have TypeScript parser options
  if (config.languageOptions?.parserOptions?.project === true) {
    return {
      ...config,
      languageOptions: {
        ...config.languageOptions,
        parserOptions: {
          ...config.languageOptions.parserOptions,
          tsconfigRootDir: __dirname,
        },
      },
    };
  }
  return config;
})
