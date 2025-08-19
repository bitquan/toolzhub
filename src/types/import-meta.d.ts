// Ensure ImportMeta.env is available to TypeScript in all contexts
// This augments Vite's types and serves as a fallback in strict TS checks
export {};

declare global {
  interface ImportMetaEnv {
    readonly DEV?: boolean;
    readonly PROD?: boolean;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv & Record<string, any>;
  }
}
