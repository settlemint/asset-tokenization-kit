// ============================================================================
// IMPORTS
// ============================================================================
import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import boundaries from "eslint-plugin-boundaries";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import oxlint from "eslint-plugin-oxlint";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import reactPerfPlugin from "eslint-plugin-react-perf";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// ============================================================================
// CONFIGURATION
// ============================================================================
export default defineConfig([
  // ==========================================================================
  // 1. IGNORE PATTERNS
  // ==========================================================================
  {
    ignores: [
      // Generated files
      "src/routeTree.gen.ts",
      ".tanstack/",
      ".generated/",
      ".generated/**",

      // Build outputs
      ".output/",
      ".nitro/",
      "dist/",
      "node_modules/",
      "vite.config.ts",
      "eslint.config.mjs",

      // Third-party UI components (shadcn)
      "src/components/ui/**",
    ],
  },

  // ==========================================================================
  // 2. BASE JAVASCRIPT CONFIG
  // ==========================================================================
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ...js.configs.recommended,
  },

  // ==========================================================================
  // 3. LANGUAGE OPTIONS & REACT SETTINGS
  // ==========================================================================
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

  // ==========================================================================
  // 4. OXLINT INTEGRATION - Disable ESLint rules handled by oxlint
  // ==========================================================================
  oxlint.configs["flat/recommended"],

  // ==========================================================================
  // 5. ARCHITECTURE BOUNDARIES
  // ==========================================================================
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

  // ==========================================================================
  // 6. PLUGIN CONFIGURATIONS (Recommended Configs)
  // ==========================================================================
  // React
  pluginReact.configs.flat.recommended,
  reactHooks.configs["recommended-latest"],
  reactPerfPlugin.configs.flat.recommended,

  // TypeScript (base - no type checking)
  ...tseslint.configs.recommended,

  // TanStack
  ...pluginQuery.configs["flat/recommended"],
  ...pluginRouter.configs["flat/recommended"],

  // No Barrel Files
  noBarrelFiles.flat,

  // ==========================================================================
  // 7. TYPESCRIPT TYPE-CHECKED RULES (Source Files Only)
  // ==========================================================================
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),

  // ==========================================================================
  // 8. REACT COMPILER PLUGIN
  // ==========================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },

  // ==========================================================================
  // 9. CUSTOM RULES FOR SOURCE FILES
  // ==========================================================================
  {
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ========================================================================
      // CODE QUALITY
      // ========================================================================
      "react/no-multi-comp": [
        "error",
        {
          ignoreStateless: true,
        },
      ],
      "no-console": "warn",

      // ========================================================================
      // REACT RULES
      // ========================================================================
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off", // Typescript provides type safety,
      "react-perf/jsx-no-new-function-as-prop": "off",
      "react/no-children-prop": [
        "error",
        {
          allowFunctions: true,
        },
      ],

      // ========================================================================
      // TYPESCRIPT RULES
      // ========================================================================
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
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignorePrimitives: {
            bigint: false,
            boolean: true,
            number: false,
            string: false,
          },
        },
      ],

      // ========================================================================
      // TYPESCRIPT RULES - DISABLED/RELAXED
      // ========================================================================
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",

      // ========================================================================
      // TANSTACK RULES
      // ========================================================================
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/router/create-route-property-order": "error",

      // ========================================================================
      // IMPORT RULES
      // ========================================================================
      "no-restricted-imports": [
        "error",
        {
          name: "zod/v4",
          importNames: ["z"],
          message: "Please import `z` from `zod` instead.",
        },
      ],

      "react-perf/jsx-no-new-object-as-prop": "off",
    },
  },

  // ==========================================================================
  // 10. CONFIG FILES - RELAXED RULES
  // ==========================================================================
  {
    files: ["*.config.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // ==========================================================================
  // 11. GENERATED FILES - RELAXED RULES
  // ==========================================================================
  {
    files: ["src/lib/settlemint/*.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },

  // ==========================================================================
  // 12. TEST FILES - RELAXED RULES
  // ==========================================================================
  {
    files: ["**/*.test.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
]);
