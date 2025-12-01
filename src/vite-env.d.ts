/// <reference types="vite/client" />
/// <reference types="@tarojs/taro" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@tarojs/taro' {
  export = Taro
}
