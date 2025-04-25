const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-unresolved": "error",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          moduleDirectory: ["node_modules", "../node_modules"],
        },
        typescript: {
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
      },
    },
    ignores: ["generated/**"],
  },
];
