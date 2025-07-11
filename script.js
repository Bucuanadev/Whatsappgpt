// WhatsApp GPT Frontend JavaScript
class WhatsAppGPTApp {
    constructor() {
        this.currentStep = 'welcome';
        this.currentLanguage = 'pt';
        this.setupData = {
            business_name: '',
            business_description: '',
            business_hours: '',
            contact_info: '',
            knowledge_text: ''
        };
        this.agentData = null;
        this.connectionCheckInterval = null;
        
        this.init();
    }

    init() {
        this.initializeIcons();
        this.setupEventListeners();
        this.loadLanguage();
        this.showStep('welcome');
    }

    // Initialize Lucide icons
    initializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Welcome step
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.showStep('setup'));
        }

        // Setup step
        const setupForm = document.getElementById('setup-form');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => this.handleSetupSubmit(e));
        }

        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.showStep('welcome'));
        }

        // QR Code step
        const checkConnectionButton = document.getElementById('check-connection-button');
        if (checkConnectionButton) {
            checkConnectionButton.addEventListener('click', () => this.checkConnection());
        }

        // Success step
        const createAnotherButton = document.getElementById('create-another-button');
        if (createAnotherButton) {
            createAnotherButton.addEventListener('click', () => this.resetApp());
        }

        // Language selector
        const languageButton = document.getElementById('language-button');
        const languageDropdown = document.getElementById('language-dropdown');
        
        if (languageButton && languageDropdown) {
            languageButton.addEventListener('click', (e) => {
                e.stopPropagation();
                languageDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                languageDropdown.classList.add('hidden');
            });

            // Language options
            const languageOptions = document.querySelectorAll('.language-option');
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const lang = e.target.getAttribute('data-lang');
                    this.changeLanguage(lang);
                    languageDropdown.classList.add('hidden');
                });
            });
        }
    }

    // Show loading overlay
    showLoading(text = null) {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        if (text && loadingText) {
            loadingText.textContent = text;
        }
        
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Show error message
    showError(message) {
        const errorElement = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    // Hide error message
    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    // Show specific step
    showStep(stepName) {
        // Hide all steps
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active'));

        // Show target step
        const targetStep = document.getElementById(`${stepName}-step`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepName;
        }

        // Re-initialize icons for the new step
        setTimeout(() => this.initializeIcons(), 100);
    }

    // Handle setup form submission
    async handleSetupSubmit(e) {
        e.preventDefault();
        
        this.hideError();
        
        // Get form data
        const formData = new FormData(e.target);
        this.setupData = {
            business_name: formData.get('business_name'),
            business_description: formData.get('business_description'),
            business_hours: formData.get('business_hours'),
            contact_info: formData.get('contact_info'),
            knowledge_text: formData.get('knowledge_text')
        };

        // Validate required fields
        if (!this.setupData.business_name || !this.setupData.business_description) {
            this.showError(this.translations[this.currentLanguage].errors.required_fields);
            return;
        }

        this.showLoading(this.translations[this.currentLanguage].loading.creating_agent);

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SETUP_AGENT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...this.setupData,
                    evolution_api_url: CONFIG.EVOLUTION_API.BASE_URL,
                    evolution_api_key: CONFIG.EVOLUTION_API.GLOBAL_KEY
                })
            });

            const result = await response.json();

            if (result.success) {
                this.agentData = result.data;
                this.showStep('qrcode');
                this.displayQRCode();
                this.startConnectionCheck();
            } else {
                this.showError(result.error || this.translations[this.currentLanguage].errors.setup_failed);
            }
        } catch (err) {
            console.error('Setup error:', err);
            this.showError(this.translations[this.currentLanguage].errors.connection_error);
        } finally {
            this.hideLoading();
        }
    }

    // Start checking connection status
    startConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }

        // Check every 5 seconds
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, CONFIG.SETTINGS.CONNECTION_CHECK_INTERVAL);
    }

    // Display QR Code
    displayQRCode() {
        const qrContainer = document.getElementById('qr-container');
        if (!qrContainer || !this.agentData?.qr_code) return;

        // Clear loading state
        qrContainer.innerHTML = '';

        // Create QR code image
        const qrImage = document.createElement('img');
        qrImage.src = `data:image/png;base64,${this.agentData.qr_code}`;
        qrImage.alt = 'QR Code WhatsApp';
        qrImage.className = 'qr-image';
        
        qrContainer.appendChild(qrImage);
    }

    // Check WhatsApp connection status
    async checkConnection() {
        if (!this.agentData?.instance_id) return;

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHECK_CONNECTION}/${this.agentData.instance_id}`);
            const result = await response.json();

            if (result.success && result.status === 'open') {
                if (this.connectionCheckInterval) {
                    clearInterval(this.connectionCheckInterval);
                    this.connectionCheckInterval = null;
                }
                this.showStep('success');
                this.updateSuccessInfo();
            }
        } catch (err) {
            console.error('Connection check error:', err);
        }
    }

    // Update success step with agent info
    updateSuccessInfo() {
        const businessNameElement = document.getElementById('agent-business-name');
        if (businessNameElement && this.setupData.business_name) {
            businessNameElement.textContent = this.setupData.business_name;
        }
    }

    // Reset app to initial state
    resetApp() {
        this.currentStep = 'welcome';
        this.setupData = {
            business_name: '',
            business_description: '',
            business_hours: '',
            contact_info: '',
            knowledge_text: ''
        };
        this.agentData = null;
        
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }

        // Reset form
        const form = document.getElementById('setup-form');
        if (form) {
            form.reset();
        }

        this.hideError();
        this.showStep('welcome');
    }

    // Change language
    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.loadLanguage();
        
        // Update language button
        const currentLanguageElement = document.getElementById('current-language');
        if (currentLanguageElement) {
            const langMap = { pt: 'PT', en: 'EN', fr: 'FR' };
            currentLanguageElement.textContent = langMap[lang] || 'PT';
        }
    }

    // Load language translations
    loadLanguage() {
        const translations = this.translations[this.currentLanguage];
        if (!translations) return;

        // Update all translatable elements
        this.updateTranslations(translations);
    }

    // Update translations in the DOM
    updateTranslations(translations) {
        // Welcome step
        this.updateElementText('.main-title', translations.welcome.title);
        this.updateElementText('.main-subtitle', translations.welcome.subtitle);
        this.updateElementText('#start-button', translations.welcome.start_button);
        this.updateElementText('.welcome-benefits', translations.welcome.benefits);

        // Features
        const featureCards = document.querySelectorAll('.feature-card');
        if (featureCards.length >= 3) {
            this.updateElementText(featureCards[0].querySelector('.feature-title'), translations.welcome.features.quick_setup.title);
            this.updateElementText(featureCards[0].querySelector('.feature-description'), translations.welcome.features.quick_setup.description);
            
            this.updateElementText(featureCards[1].querySelector('.feature-title'), translations.welcome.features.secure.title);
            this.updateElementText(featureCards[1].querySelector('.feature-description'), translations.welcome.features.secure.description);
            
            this.updateElementText(featureCards[2].querySelector('.feature-title'), translations.welcome.features.intelligent.title);
            this.updateElementText(featureCards[2].querySelector('.feature-description'), translations.welcome.features.intelligent.description);
        }

        // Setup step
        this.updateElementText('.setup-header .step-title', translations.setup.title);
        this.updateElementText('.setup-header .step-subtitle', translations.setup.subtitle);
        this.updateElementText('.setup-card .card-title', translations.setup.card_title);
        this.updateElementText('.setup-card .card-description', translations.setup.card_description);

        // Form labels and placeholders
        this.updateElementText('label[for="business_name"]', translations.setup.form.business_name.label);
        this.updateElementAttribute('#business_name', 'placeholder', translations.setup.form.business_name.placeholder);
        
        this.updateElementText('label[for="business_description"]', translations.setup.form.business_description.label);
        this.updateElementAttribute('#business_description', 'placeholder', translations.setup.form.business_description.placeholder);
        
        this.updateElementText('label[for="business_hours"]', translations.setup.form.business_hours.label);
        this.updateElementAttribute('#business_hours', 'placeholder', translations.setup.form.business_hours.placeholder);
        
        this.updateElementText('label[for="contact_info"]', translations.setup.form.contact_info.label);
        this.updateElementAttribute('#contact_info', 'placeholder', translations.setup.form.contact_info.placeholder);
        
        this.updateElementText('label[for="knowledge_text"]', translations.setup.form.knowledge_text.label);
        this.updateElementAttribute('#knowledge_text', 'placeholder', translations.setup.form.knowledge_text.placeholder);
        this.updateElementText('.form-help', translations.setup.form.knowledge_text.help);

        this.updateElementText('#back-button', translations.setup.back_button);
        this.updateElementText('#submit-button', translations.setup.submit_button);

        // QR Code step
        this.updateElementText('.qrcode-header .step-title', translations.qrcode.title);
        this.updateElementText('.qrcode-header .step-subtitle', translations.qrcode.subtitle);
        this.updateElementText('.qrcode-card .card-title', translations.qrcode.card_title);
        this.updateElementText('.qrcode-card .card-description', translations.qrcode.card_description);
        this.updateElementText('.instructions-title', translations.qrcode.instructions.title);
        this.updateElementText('#check-connection-button', translations.qrcode.check_button);
        this.updateElementText('.qr-note', translations.qrcode.note);

        // Instructions list
        const instructionsList = document.querySelector('.instructions-list');
        if (instructionsList) {
            instructionsList.innerHTML = translations.qrcode.instructions.steps
                .map(step => `<li>${step}</li>`)
                .join('');
        }

        // Success step
        this.updateElementText('.celebration-title', translations.success.title);
        this.updateElementText('.celebration-subtitle', translations.success.subtitle);
        this.updateElementText('.agent-info-card .card-title', translations.success.agent_info.title);
        
        // Info labels
        const infoItems = document.querySelectorAll('.info-item .info-label');
        if (infoItems.length >= 3) {
            this.updateElementText(infoItems[0], translations.success.agent_info.business_name);
            this.updateElementText(infoItems[1], translations.success.agent_info.status);
            this.updateElementText(infoItems[2], translations.success.agent_info.ai);
        }

        this.updateElementText('.next-steps-title', translations.success.next_steps.title);
        
        // Next steps list
        const nextStepsList = document.querySelector('.next-steps-list');
        if (nextStepsList) {
            nextStepsList.innerHTML = translations.success.next_steps.steps
                .map(step => `<li>${step}</li>`)
                .join('');
        }

        this.updateElementText('#create-another-button', translations.success.create_another);
        this.updateElementText('.support-text', translations.success.support);
    }

    // Helper method to update element text
    updateElementText(selector, text) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && text) {
            element.textContent = text;
        }
    }

    // Helper method to update element attribute
    updateElementAttribute(selector, attribute, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            element.setAttribute(attribute, value);
        }
    }

    // Translations object
    translations = {
        pt: {
            welcome: {
                title: "WhatsApp GPT",
                subtitle: "Crie seu agente de IA para WhatsApp em minutos, sem conhecimento técnico",
                start_button: "Começar Agora - É Grátis!",
                benefits: "✅ Sem cartão de crédito • ✅ Configuração em 5 minutos • ✅ Suporte em português",
                features: {
                    quick_setup: {
                        title: "Configuração Rápida",
                        description: "Configure seu agente em 3 passos simples. Sem programação necessária."
                    },
                    secure: {
                        title: "Seguro e Confiável",
                        description: "Seus dados ficam seguros. Cada empresa tem sua própria instância isolada."
                    },
                    intelligent: {
                        title: "IA Inteligente",
                        description: "Powered by GPT-4o, responde com base no conhecimento da sua empresa."
                    }
                }
            },
            setup: {
                title: "Configure Seu Agente WhatsApp",
                subtitle: "Preencha as informações da sua empresa para personalizar as respostas",
                card_title: "Informações da Empresa",
                card_description: "Estas informações serão usadas para treinar seu agente de IA",
                form: {
                    business_name: {
                        label: "Nome da Empresa *",
                        placeholder: "Ex: Restaurante Sabor Moçambicano"
                    },
                    business_description: {
                        label: "Descrição do Negócio *",
                        placeholder: "Ex: Restaurante especializado em comida tradicional moçambicana, localizado em Maputo. Servimos pratos como matapa, xima, caril de camarão..."
                    },
                    business_hours: {
                        label: "Horário de Funcionamento",
                        placeholder: "Ex: Segunda a Sábado: 11h às 22h, Domingo: 12h às 20h"
                    },
                    contact_info: {
                        label: "Informações de Contacto",
                        placeholder: "Ex: Telefone: +258 84 123 4567, Email: info@restaurante.co.mz"
                    },
                    knowledge_text: {
                        label: "Conhecimento Adicional",
                        placeholder: "Ex: Cardápio, preços, políticas, perguntas frequentes, informações sobre produtos/serviços...",
                        help: "Adicione qualquer informação que o agente deve saber para responder aos clientes"
                    }
                },
                back_button: "Voltar",
                submit_button: "Criar Agente WhatsApp"
            },
            qrcode: {
                title: "Agente Criado com Sucesso!",
                subtitle: "Agora conecte seu WhatsApp escaneando o código QR",
                card_title: "Conectar WhatsApp",
                card_description: "Use seu celular para escanear o código QR abaixo",
                instructions: {
                    title: "Como conectar:",
                    steps: [
                        "Abra o WhatsApp no seu celular",
                        "Toque nos três pontos (⋮) no canto superior direito",
                        "Selecione \"Aparelhos conectados\"",
                        "Toque em \"Conectar um aparelho\"",
                        "Escaneie o código QR acima"
                    ]
                },
                check_button: "Verificar Conexão",
                note: "O código QR expira em alguns minutos. Recarregue a página se necessário."
            },
            success: {
                title: "🎉 Parabéns!",
                subtitle: "Seu agente WhatsApp GPT está ativo e pronto para atender clientes!",
                agent_info: {
                    title: "Informações do Seu Agente",
                    business_name: "Nome da Empresa:",
                    status: "Status:",
                    ai: "IA:"
                },
                next_steps: {
                    title: "O que acontece agora?",
                    steps: [
                        "✅ Seu WhatsApp já está conectado ao agente de IA",
                        "✅ O agente responderá automaticamente às mensagens",
                        "✅ As respostas são baseadas nas informações da sua empresa",
                        "✅ Você pode continuar usando o WhatsApp normalmente"
                    ]
                },
                create_another: "Criar Outro Agente",
                support: "Precisa de ajuda? Entre em contacto connosco pelo WhatsApp: +258 84 000 0000"
            },
            loading: {
                creating_agent: "Configurando agente...",
                generating_qr: "Gerando código QR...",
                checking_connection: "Verificando conexão..."
            },
            errors: {
                required_fields: "Por favor, preencha todos os campos obrigatórios.",
                setup_failed: "Erro ao configurar o agente. Tente novamente.",
                connection_error: "Erro de conexão. Verifique se o servidor está funcionando."
            }
        },
        en: {
            welcome: {
                title: "WhatsApp GPT",
                subtitle: "Create your AI agent for WhatsApp in minutes, no technical knowledge required",
                start_button: "Get Started - It's Free!",
                benefits: "✅ No credit card • ✅ 5-minute setup • ✅ English support",
                features: {
                    quick_setup: {
                        title: "Quick Setup",
                        description: "Configure your agent in 3 simple steps. No programming required."
                    },
                    secure: {
                        title: "Secure & Reliable",
                        description: "Your data stays safe. Each company has its own isolated instance."
                    },
                    intelligent: {
                        title: "Intelligent AI",
                        description: "Powered by GPT-4o, responds based on your company's knowledge."
                    }
                }
            },
            setup: {
                title: "Configure Your WhatsApp Agent",
                subtitle: "Fill in your company information to customize responses",
                card_title: "Company Information",
                card_description: "This information will be used to train your AI agent",
                form: {
                    business_name: {
                        label: "Company Name *",
                        placeholder: "Ex: Mozambican Flavor Restaurant"
                    },
                    business_description: {
                        label: "Business Description *",
                        placeholder: "Ex: Restaurant specializing in traditional Mozambican food, located in Maputo. We serve dishes like matapa, xima, shrimp curry..."
                    },
                    business_hours: {
                        label: "Business Hours",
                        placeholder: "Ex: Monday to Saturday: 11am to 10pm, Sunday: 12pm to 8pm"
                    },
                    contact_info: {
                        label: "Contact Information",
                        placeholder: "Ex: Phone: +258 84 123 4567, Email: info@restaurant.co.mz"
                    },
                    knowledge_text: {
                        label: "Additional Knowledge",
                        placeholder: "Ex: Menu, prices, policies, frequently asked questions, product/service information...",
                        help: "Add any information the agent should know to respond to customers"
                    }
                },
                back_button: "Back",
                submit_button: "Create WhatsApp Agent"
            },
            qrcode: {
                title: "Agent Created Successfully!",
                subtitle: "Now connect your WhatsApp by scanning the QR code",
                card_title: "Connect WhatsApp",
                card_description: "Use your phone to scan the QR code below",
                instructions: {
                    title: "How to connect:",
                    steps: [
                        "Open WhatsApp on your phone",
                        "Tap the three dots (⋮) in the top right corner",
                        "Select \"Linked devices\"",
                        "Tap \"Link a device\"",
                        "Scan the QR code above"
                    ]
                },
                check_button: "Check Connection",
                note: "The QR code expires in a few minutes. Reload the page if necessary."
            },
            success: {
                title: "🎉 Congratulations!",
                subtitle: "Your WhatsApp GPT agent is active and ready to serve customers!",
                agent_info: {
                    title: "Your Agent Information",
                    business_name: "Company Name:",
                    status: "Status:",
                    ai: "AI:"
                },
                next_steps: {
                    title: "What happens now?",
                    steps: [
                        "✅ Your WhatsApp is now connected to the AI agent",
                        "✅ The agent will automatically respond to messages",
                        "✅ Responses are based on your company information",
                        "✅ You can continue using WhatsApp normally"
                    ]
                },
                create_another: "Create Another Agent",
                support: "Need help? Contact us on WhatsApp: +258 84 000 0000"
            },
            loading: {
                creating_agent: "Setting up agent...",
                generating_qr: "Generating QR code...",
                checking_connection: "Checking connection..."
            },
            errors: {
                required_fields: "Please fill in all required fields.",
                setup_failed: "Error setting up agent. Please try again.",
                connection_error: "Connection error. Check if the server is running."
            }
        },
        fr: {
            welcome: {
                title: "WhatsApp GPT",
                subtitle: "Créez votre agent IA pour WhatsApp en quelques minutes, sans connaissances techniques",
                start_button: "Commencer - C'est Gratuit!",
                benefits: "✅ Pas de carte de crédit • ✅ Configuration en 5 minutes • ✅ Support en français",
                features: {
                    quick_setup: {
                        title: "Configuration Rapide",
                        description: "Configurez votre agent en 3 étapes simples. Aucune programmation requise."
                    },
                    secure: {
                        title: "Sécurisé et Fiable",
                        description: "Vos données restent sécurisées. Chaque entreprise a sa propre instance isolée."
                    },
                    intelligent: {
                        title: "IA Intelligente",
                        description: "Alimenté par GPT-4o, répond basé sur les connaissances de votre entreprise."
                    }
                }
            },
            setup: {
                title: "Configurez Votre Agent WhatsApp",
                subtitle: "Remplissez les informations de votre entreprise pour personnaliser les réponses",
                card_title: "Informations de l'Entreprise",
                card_description: "Ces informations seront utilisées pour entraîner votre agent IA",
                form: {
                    business_name: {
                        label: "Nom de l'Entreprise *",
                        placeholder: "Ex: Restaurant Saveur Mozambicaine"
                    },
                    business_description: {
                        label: "Description de l'Entreprise *",
                        placeholder: "Ex: Restaurant spécialisé dans la cuisine traditionnelle mozambicaine, situé à Maputo. Nous servons des plats comme matapa, xima, curry de crevettes..."
                    },
                    business_hours: {
                        label: "Heures d'Ouverture",
                        placeholder: "Ex: Lundi au Samedi: 11h à 22h, Dimanche: 12h à 20h"
                    },
                    contact_info: {
                        label: "Informations de Contact",
                        placeholder: "Ex: Téléphone: +258 84 123 4567, Email: info@restaurant.co.mz"
                    },
                    knowledge_text: {
                        label: "Connaissances Supplémentaires",
                        placeholder: "Ex: Menu, prix, politiques, questions fréquentes, informations sur les produits/services...",
                        help: "Ajoutez toute information que l'agent doit connaître pour répondre aux clients"
                    }
                },
                back_button: "Retour",
                submit_button: "Créer Agent WhatsApp"
            },
            qrcode: {
                title: "Agent Créé avec Succès!",
                subtitle: "Maintenant connectez votre WhatsApp en scannant le code QR",
                card_title: "Connecter WhatsApp",
                card_description: "Utilisez votre téléphone pour scanner le code QR ci-dessous",
                instructions: {
                    title: "Comment se connecter:",
                    steps: [
                        "Ouvrez WhatsApp sur votre téléphone",
                        "Appuyez sur les trois points (⋮) en haut à droite",
                        "Sélectionnez \"Appareils liés\"",
                        "Appuyez sur \"Lier un appareil\"",
                        "Scannez le code QR ci-dessus"
                    ]
                },
                check_button: "Vérifier la Connexion",
                note: "Le code QR expire en quelques minutes. Rechargez la page si nécessaire."
            },
            success: {
                title: "🎉 Félicitations!",
                subtitle: "Votre agent WhatsApp GPT est actif et prêt à servir les clients!",
                agent_info: {
                    title: "Informations de Votre Agent",
                    business_name: "Nom de l'Entreprise:",
                    status: "Statut:",
                    ai: "IA:"
                },
                next_steps: {
                    title: "Que se passe-t-il maintenant?",
                    steps: [
                        "✅ Votre WhatsApp est maintenant connecté à l'agent IA",
                        "✅ L'agent répondra automatiquement aux messages",
                        "✅ Les réponses sont basées sur les informations de votre entreprise",
                        "✅ Vous pouvez continuer à utiliser WhatsApp normalement"
                    ]
                },
                create_another: "Créer un Autre Agent",
                support: "Besoin d'aide? Contactez-nous sur WhatsApp: +258 84 000 0000"
            },
            loading: {
                creating_agent: "Configuration de l'agent...",
                generating_qr: "Génération du code QR...",
                checking_connection: "Vérification de la connexion..."
            },
            errors: {
                required_fields: "Veuillez remplir tous les champs obligatoires.",
                setup_failed: "Erreur lors de la configuration de l'agent. Veuillez réessayer.",
                connection_error: "Erreur de connexion. Vérifiez si le serveur fonctionne."
            }
        }
    };
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppGPTApp();
});

