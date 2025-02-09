/**
 * Interface defining the site's theme configuration
 */
interface ThemeConfig {
  /** The theme variant to use throughout the application */
  variant: 'settlemint' | 'shadcn';
  /** Whether dark mode is enabled by default */
  defaultDarkMode: boolean;
}

/**
 * The theme configuration
 */
export const themeConfig = {
  variant: 'settlemint',
  defaultDarkMode: false,
} as const satisfies ThemeConfig;
