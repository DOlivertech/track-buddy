declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENWEATHER_API_KEY?: string;
    }
  }
}

export {};