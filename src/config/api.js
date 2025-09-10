// Konfigurace API - přepínání mezi mock a skutečným API

// Nastavte na true pro použití mock API (lokální vývoj)
// Nastavte na false pro použití skutečného API (produkce)
export const USE_MOCK_API = true;

// Automatické rozpoznání prostředí
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Výchozí nastavení podle prostředí
export const shouldUseMockApi = USE_MOCK_API || isDevelopment;
