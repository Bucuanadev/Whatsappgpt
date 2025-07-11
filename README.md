# WhatsApp SaaS Platform - Plataforma SaaS para WhatsApp

Uma plataforma SaaS completa para automação de atendimento ao cliente via WhatsApp, desenvolvida especificamente para o mercado moçambicano e africano.

## 🌟 Características Principais

### 💰 Sistema de Facturação e Créditos
- **Pacotes de Créditos**: A partir de 130 MZN (2 USD) para 20 créditos
- **Sistema de Mensagens**: 2 créditos = 1 mensagem
- **Métodos de Pagamento Locais**:
  - M-Pesa (Dinheiro Móvel)
  - e-Mola (Dinheiro Móvel)
  - Cartão de Débito
  - Cartão de Crédito

### 🎁 Programa de Referência
- **Bónus de Inscrição**: 200 créditos grátis para novos utilizadores
- **Bónus de Referência**: 50 créditos por cada pessoa convidada
- **Comissão Contínua**: 5% dos créditos comprados pelos referidos

### 🌍 Localização Completa
- **Português (pt-PT)**: Idioma principal
- **Inglês**: Suporte internacional
- **Francês**: Mercados francófonos africanos

### 🔧 Funcionalidades Técnicas
- **Base de Conhecimento**: Upload de documentos e gestão de conhecimento
- **Integração WhatsApp**: Conexão com WhatsApp Business API
- **Fluxos n8n**: Automação de processos
- **Análises**: Métricas e relatórios detalhados
- **Gestão de Utilizadores**: Sistema completo de autenticação

## 🏗️ Arquitectura Técnica

### Frontend
- **Framework**: React 18 + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Internacionalização**: react-i18next
- **Roteamento**: React Router DOM

### Backend
- **Framework**: Flask (Python)
- **Base de Dados**: Redis
- **Armazenamento**: Supabase
- **CORS**: Flask-CORS

### Estrutura de Preços
```
20 créditos  = 130 MZN ($2 USD)  = 10 mensagens
50 créditos  = 325 MZN ($5 USD)  = 25 mensagens
100 créditos = 650 MZN ($10 USD) = 50 mensagens
200 créditos = 1300 MZN ($20 USD) = 100 mensagens
500 créditos = 3250 MZN ($50 USD) = 250 mensagens
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- Python 3.11+
- Redis Server
- Git

### 1. Configuração do Frontend

```bash
# Navegar para o directório do frontend
cd whatsapp-saas-platform

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev
```

### 2. Configuração do Backend

```bash
# Navegar para o directório do backend
cd whatsapp-billing-backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor Flask
python src/main.py
```

### 3. Configuração do Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar status
sudo systemctl status redis-server
```

## 📁 Estrutura do Projecto

```
whatsapp-saas-platform/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CompanyProfile.jsx
│   │   ├── Documents.jsx
│   │   ├── WhatsAppIntegration.jsx
│   │   ├── N8nFlows.jsx
│   │   ├── Analytics.jsx
│   │   ├── Billing.jsx
│   │   ├── CreditPurchase.jsx
│   │   ├── TransactionHistory.jsx
│   │   ├── ReferralManagement.jsx
│   │   ├── Settings.jsx
│   │   └── Layout.jsx
│   ├── i18n.js
│   └── App.jsx
├── package.json
└── README.md

whatsapp-billing-backend/
├── src/
│   ├── config/
│   │   └── redis_config.py
│   ├── models/
│   │   └── billing.py
│   ├── routes/
│   │   └── billing.py
│   └── main.py
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

### Facturação
- `POST /api/billing/purchase` - Comprar créditos
- `GET /api/billing/balance/{user_id}` - Consultar saldo
- `GET /api/billing/transactions` - Histórico de transacções
- `POST /api/billing/use-credits` - Usar créditos

### Referências
- `GET /api/billing/referral/{user_id}` - Dados de referência
- `POST /api/billing/referral/register` - Registar com código de referência

## 🎨 Componentes da Interface

### 1. Painel Principal (Dashboard)
- Estatísticas rápidas
- Agentes activos
- Mensagens processadas
- Taxa de resolução

### 2. Facturação
- Saldo actual de créditos
- Pacotes de créditos disponíveis
- Métodos de pagamento locais
- Histórico de transacções

### 3. Programa de Referência
- Link de referência personalizado
- Lista de utilizadores referidos
- Créditos ganhos por comissões
- Estatísticas de referência

### 4. Base de Conhecimento
- Upload de documentos
- Gestão de conhecimento textual
- Organização por categorias

### 5. Integração WhatsApp
- Configuração da API
- Estado da conexão
- Gestão de números

## 🔧 Configuração de Produção

### Variáveis de Ambiente

```bash
# Backend (.env)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
FLASK_ENV=production
SECRET_KEY=your-secret-key

# Frontend (.env)
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=WhatsApp SaaS Platform
```

### Deploy do Frontend
```bash
# Construir para produção
pnpm run build

# Os ficheiros estarão em dist/
```

### Deploy do Backend
```bash
# Usar Gunicorn para produção
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

## 🐛 Resolução de Problemas

### Erro de CORS
Se encontrar erros de CORS, verifique:
1. Flask-CORS está instalado
2. CORS está configurado no main.py
3. URLs do frontend e backend estão correctas

### Redis Connection Error
```bash
# Verificar se Redis está a correr
redis-cli ping

# Deve retornar: PONG
```

### Problemas de Tradução
- Verifique se todas as chaves de tradução existem em i18n.js
- Confirme que o idioma está definido correctamente

## 📱 Funcionalidades Móveis

A interface é totalmente responsiva e optimizada para:
- Smartphones Android e iOS
- Tablets
- Navegadores móveis
- Aplicações PWA

## 🔐 Segurança

### Autenticação
- Tokens JWT para sessões
- Armazenamento seguro no localStorage
- Validação de sessão no backend

### Pagamentos
- Validação de dados de pagamento
- Logs de transacções
- Prevenção de fraudes

## 📊 Métricas e Análises

### Dashboards Disponíveis
- Mensagens enviadas/recebidas
- Taxa de conversão
- Tempo médio de resposta
- Satisfação do cliente
- Receita por período

## 🌐 Suporte Multi-idioma

### Idiomas Suportados
1. **Português (pt-PT)** - Idioma principal
2. **Inglês (en)** - Mercado internacional
3. **Francês (fr)** - Países francófonos

### Adicionar Novos Idiomas
1. Editar `src/i18n.js`
2. Adicionar novo objecto de tradução
3. Actualizar selector de idioma

## 🚀 Próximos Passos

### Funcionalidades Planeadas
1. **Integração com Evolution API** - Automação completa
2. **Chatbots com IA** - GPT-4 integration
3. **Análises Avançadas** - Machine learning insights
4. **App Mobile Nativo** - React Native
5. **Integração Bancária** - Pagamentos directos

### Melhorias Técnicas
1. **Testes Automatizados** - Jest + Cypress
2. **CI/CD Pipeline** - GitHub Actions
3. **Monitorização** - Logs e métricas
4. **Backup Automático** - Dados e configurações

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@whatsappsaas.mz
- Telefone: +258 XX XXX XXXX
- WhatsApp: +258 XX XXX XXXX

## 📄 Licença

Este projecto está licenciado sob a Licença MIT. Veja o ficheiro LICENSE para mais detalhes.

---

**Desenvolvido especificamente para o mercado moçambicano e africano** 🇲🇿 🌍

