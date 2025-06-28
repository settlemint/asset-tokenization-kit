import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import reactPerfPlugin from "eslint-plugin-react-perf";
import pluginSecurity from "eslint-plugin-security";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "src/routeTree.gen.ts",
      ".tanstack/",
      ".output/",
      ".nitro/",
      "dist/",
      "node_modules/",
      ".generated/",
      ".generated/**",
      "src/components/ui/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
    },
    settings: {
      react: {
        version: "19",
      },
    },
  },
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "orpc",
              allow: ["lib", "config"],
            },
            {
              from: "routes",
              allow: [
                "components",
                "hooks",
                "lib",
                "providers",
                "config",
                "styles",
              ],
            },
            {
              from: "components",
              allow: ["components", "hooks", "lib", "config", "styles"],
            },
            {
              from: "lib",
              allow: ["lib", "config"],
            },
          ],
        },
      ],
    },
  },
  pluginReact.configs.flat.recommended,
  // Base TypeScript config without type checking for all files
  ...tseslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  ...pluginRouter.configs["flat/recommended"],
  // Type-checked rules only for source files
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),
  reactHooks.configs["recommended-latest"],
  pluginSecurity.configs.recommended,
  reactPerfPlugin.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  // React Compiler plugin
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
  {
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prevent large component files
      "max-lines": [
        "warn",
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "react/no-multi-comp": [
        "error",
        {
          ignoreStateless: true,
        },
      ],
      "import/no-unresolved": "off",
      "security/detect-object-injection": "off",
      // React rules
      "react/react-in-jsx-scope": "off",

      // TypeScript strict rules
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
      // Ensure proper query key usage
      "@tanstack/query/exhaustive-deps": "error",
      // Router specific
      "@tanstack/router/create-route-property-order": "error",

      // Additional strict TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          ignoreVoid: true,
          ignoreIIFE: true,
        },
      ],
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
            returns: true,
          },
        },
      ],
      "@typescript-eslint/restrict-template-expressions": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",
      // Disable some rules that might be too strict for TanStack Start
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  },
  // Basic config for config files
  {
    files: ["*.config.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["src/lib/settlemint/*.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },
  {
    files: ["**/*.test.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
]);
