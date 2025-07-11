const CONFIG = {
    API_BASE_URL: 'http://139.84.242.22',
    
    ENDPOINTS: {
        SETUP_AGENT: '/api/whatsapp-gpt/setup-whatsapp-agent',
        CHECK_CONNECTION: '/api/whatsapp-gpt/check-connection',
        GET_QR_CODE: '/api/whatsapp-gpt/get-qr-code'
    },
    
    EVOLUTION_API: {
        BASE_URL: 'http://139.84.242.22:8080',
        GLOBAL_KEY: '429683C4C977415CAAFCCE10F7D57E11'
    },
    
    SETTINGS: {
        CONNECTION_CHECK_INTERVAL: 5000,
        QR_CODE_REFRESH_INTERVAL: 30000,
        DEFAULT_LANGUAGE: 'pt',
        SUPPORTED_LANGUAGES: ['pt', 'en', 'fr']
    },
    
    UI: {
        LOADING_TIMEOUT: 30000,
        ERROR_DISPLAY_DURATION: 5000,
        SUCCESS_MESSAGE_DURATION: 3000
    }
};

window.CONFIG = CONFIG;


