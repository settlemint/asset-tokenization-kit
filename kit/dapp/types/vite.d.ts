declare module "vite" {
  type Awaitable<T> = T | Promise<T>;

  export type UserConfig = Record<string, unknown>;
  export type Plugin = Record<string, unknown>;

  export interface ConfigEnv {
    mode: string;
    command: "build" | "serve";
  }

  export function defineConfig(
    config: UserConfig | ((env: ConfigEnv) => Awaitable<UserConfig>)
  ): UserConfig;
}
