/// <reference types="vite/client" />

declare module "virtual:pwa-register" {
  export function registerSW(options?: Record<string, unknown>): void;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
