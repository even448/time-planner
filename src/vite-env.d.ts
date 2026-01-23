// 环境变量类型定义

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 可以添加更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
