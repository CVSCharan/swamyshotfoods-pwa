export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

if (!config.apiBaseUrl) {
  console.warn('⚠️ VITE_API_URL is not defined, using fallback http://localhost:5001/api');
}

if (config.isDevelopment) {
  console.log('🔧 Environment:', config.environment);
  console.log('🌐 API Base URL:', config.apiBaseUrl);
}
