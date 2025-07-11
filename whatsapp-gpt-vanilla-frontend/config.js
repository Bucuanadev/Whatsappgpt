// Configuration for WhatsApp GPT Frontend
const CONFIG = {
    // API Base URL - Update this to match your backend server
    API_BASE_URL: window.location.origin,
    
    // API Endpoints
    ENDPOINTS: {
        SETUP_AGENT: '/api/whatsapp-gpt/setup-whatsapp-agent',
        CHECK_CONNECTION: '/api/whatsapp-gpt/check-connection',
        GET_QR_CODE: '/api/whatsapp-gpt/get-qr-code'
    },
    
    // Evolution API Configuration
    EVOLUTION_API: {
        BASE_URL: 'http://139.84.242.22:8080',
        GLOBAL_KEY: '429683C4C977415CAAFCCE10F7D57E11'
    },
    
    // Application Settings
    SETTINGS: {
        CONNECTION_CHECK_INTERVAL: 5000, // 5 seconds
        QR_CODE_REFRESH_INTERVAL: 30000, // 30 seconds
        DEFAULT_LANGUAGE: 'pt',
        SUPPORTED_LANGUAGES: ['pt', 'en', 'fr']
    },
    
    // UI Configuration
    UI: {
        LOADING_TIMEOUT: 30000, // 30 seconds
        ERROR_DISPLAY_DURATION: 5000, // 5 seconds
        SUCCESS_MESSAGE_DURATION: 3000 // 3 seconds
    }
};

// Make config available globally
window.CONFIG = CONFIG;

