// This file resolves the @types/minimatch stub package issue
// Since we don't use minimatch, we declare an empty module to satisfy TypeScript
declare module "minimatch" {
  // Empty declaration to prevent TS2688 error
}