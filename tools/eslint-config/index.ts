// ============================================================================
// PERFORMANCE-OPTIMIZED ESLINT CONFIGURATION
// ============================================================================
import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
// import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

// ============================================================================
// CONFIGURATION
// ============================================================================
export default [
  // ==========================================================================
  // 1. IGNORE PATTERNS - EXPANDED FOR PERFORMANCE
  // ==========================================================================
  {
    ignores: [
      // Generated files
      "src/routeTree.gen.ts",
      ".tanstack/",
      ".generated/",
      ".generated/**",
      "**/*.gen.ts",
      "**/*.gen.tsx",
      "**/generated/**",

      // Build outputs
      ".output/",
      ".nitro/",
      "dist/",
      "node_modules/",
      "vite.config.ts",
      "eslint.config.mjs",
      "eslint.config.performance.mjs",

      // Third-party UI components (shadcn)
      "src/components/ui/**",

      // SettleMint SDK files with environment variables
      "src/lib/settlemint/**",

      // Cache and temp files
      "**/.cache/**",
      "**/tmp/**",
      "**/*.min.js",
      "**/*.min.css",

      // Type definitions
      "**/*.d.ts",
      "!src/**/*.d.ts", // Allow source type definitions

      // Large files that don't need linting
      "**/locales/**/*.json",
      "**/public/**",
      "**/*.svg",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.ico",
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
      globals: { ...globals.browser, ...globals.node, Bun: "readonly" },
      parser: tseslint.parser,
      parserOptions: {
        // PERFORMANCE: Only parse what's needed, don't create programs by default
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      react: {
        version: "19",
      },
    },
  },

  // ==========================================================================
  // 5. PLUGIN CONFIGURATIONS - SELECTIVE APPLICATION
  // ==========================================================================
  // React - Only for React files
  {
    files: ["src/**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
  },
  // {
  //   files: ["src/**/*.{jsx,tsx}"],
  //   plugins: {
  //     "react-hooks": reactHooks,
  //   },
  //   extends: ["react-hooks/recommended"],
  // },

  // TypeScript - Base rules only (no type checking)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),

  // TanStack Query
  ...pluginQuery.configs["flat/recommended"],

  // TanStack Router
  ...pluginRouter.configs["flat/recommended"],

  // No Barrel Files
  {
    ...noBarrelFiles.flat,
    files: ["src/**/*.{ts,tsx,js,jsx}"],
  },

  // Unicorn - Apply to source files with performance-friendly rules
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ...unicorn.configs.recommended,
  },

  // ==========================================================================
  // 6. REACT COMPILER PLUGIN - TARGETED
  // ==========================================================================
  {
    files: ["src/**/*.{tsx}"], // Only TSX files need this
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },

  // ==========================================================================
  // 7. PERFORMANCE-CRITICAL RULES ONLY
  // ==========================================================================
  {
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    rules: {
      // ========================================================================
      // CRITICAL CODE QUALITY RULES ONLY
      // ========================================================================
      "no-console": "warn",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/no-children-prop": "off",

      // ========================================================================
      // ESSENTIAL TYPESCRIPT RULES (Fast checks only)
      // ========================================================================
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],

      // ========================================================================
      // DISABLED FOR PERFORMANCE
      // ========================================================================
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/only-throw-error": "off",

      // ========================================================================
      // TANSTACK RULES - ALREADY INCLUDED VIA CONFIGS ABOVE
      // ========================================================================
      // "@tanstack/query/exhaustive-deps": "error", // Already in recommended config

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

      // ========================================================================
      // UNICORN RULES - CUSTOMIZED FOR PERFORMANCE & PROJECT NEEDS
      // ========================================================================
      "unicorn/prevent-abbreviations": "off", // Allow common abbreviations
      "unicorn/filename-case": "off", // Project has its own naming conventions
      "unicorn/no-null": "off", // null is sometimes needed
      "unicorn/prefer-module": "off", // Already enforced by package.json
      "unicorn/no-abusive-eslint-disable": "off", // Project policy: fix issues
      "unicorn/consistent-function-scoping": "off", // Can conflict with React
      "unicorn/no-nested-ternary": "off", // Sometimes cleaner
      "unicorn/prefer-top-level-await": "off", // Not always applicable
      "unicorn/no-array-reduce": "off", // reduce() is often the best solution
      "unicorn/no-array-for-each": "off", // forEach is fine for side effects
      "unicorn/switch-case-braces": ["error", "avoid"], // Cleaner switch statements
      "unicorn/no-useless-undefined": "off",
      "unicorn/number-literal-case": "off",
      "unicorn/prefer-string-raw": "off", // arkregex requires direct string literals
    },
  },

  // ==========================================================================
  // 8. TYPE-CHECKED RULES
  // ==========================================================================
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      },
    },
  })),

  // Override type-checked rules
  {
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    rules: {
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },

  // ==========================================================================
  // 9. TEST FILES - RELAXED TYPE-CHECKED RULES
  // ==========================================================================
  {
    files: ["**/*.{test,spec}.{ts,mts,cts,tsx}"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },

  // ==========================================================================
  // 9b. TEST DIRECTORIES - ENSURE TS-AWARE UNUSED VARS
  // Applies to helpers placed under any test/** folder (not matched by src/**)
  // ==========================================================================
  {
    files: ["**/test/**/*.{ts,mts,cts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Use TS-aware rule and disable the core one in test helpers
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },

  // ==========================================================================
  // 10. CONFIG FILES - MINIMAL RULES
  // ==========================================================================
  {
    files: ["*.config.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
