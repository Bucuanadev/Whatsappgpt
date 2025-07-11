# 🚀 WhatsApp GPT - Plataforma de Agentes IA para WhatsApp

## 📋 Visão Geral

WhatsApp GPT é uma plataforma inovadora que permite a qualquer pessoa criar um agente de inteligência artificial para WhatsApp em poucos minutos, sem necessidade de conhecimento técnico. A plataforma automatiza completamente a configuração de instâncias Evolution API, workflows n8n e bases de conhecimento vectoriais.

## 🎯 Características Principais

### ✨ **Para Utilizadores Finais**
- **Interface Simples**: Formulário intuitivo em português
- **Configuração Automática**: Sem necessidade de conhecimento técnico
- **QR Code Integrado**: Conexão WhatsApp em segundos
- **IA Inteligente**: Powered by GPT-4o
- **Base de Conhecimento**: Processa informações da empresa automaticamente

### 🔧 **Para Desenvolvedores**
- **Arquitetura Modular**: Backend Flask + Frontend React
- **APIs Completas**: Evolution API + n8n + Pinecone
- **Escalabilidade**: Instâncias isoladas por cliente
- **Segurança**: Credenciais geridas de forma segura

## 🏗️ Arquitetura Técnica

### Backend (Flask)
```
whatsapp-gpt-backend/
├── src/
│   ├── services/
│   │   ├── evolution_api.py      # Gestão Evolution API
│   │   ├── n8n_manager.py        # Gestão workflows n8n
│   │   └── vector_store.py       # Base conhecimento
│   ├── routes/
│   │   └── whatsapp_gpt.py       # API endpoints
│   └── main.py                   # Aplicação principal
└── requirements.txt
```

### Frontend (React)
```
whatsapp-gpt-frontend/
├── src/
│   ├── components/ui/            # Componentes UI
│   ├── App.jsx                   # Aplicação principal
│   └── main.jsx                  # Ponto entrada
└── package.json
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- Redis Server
- Evolution API (Docker)
- n8n (Docker)

### 1. Backend Setup
```bash
cd whatsapp-gpt-backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd whatsapp-gpt-frontend
pnpm install
```

### 3. Variáveis de Ambiente
Criar `.env` no backend:
```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key

# n8n
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Pinecone (opcional)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=whatsapp-gpt
```

### 4. Executar Aplicação
```bash
# Backend
cd whatsapp-gpt-backend
source venv/bin/activate
python src/main.py

# Frontend
cd whatsapp-gpt-frontend
pnpm run dev --host
```

## 📱 Fluxo do Utilizador

### 1. **Página de Boas-vindas**
- Apresentação da plataforma
- Benefícios principais
- Call-to-action "Começar Agora"

### 2. **Configuração do Agente**
- Nome da empresa
- Descrição do negócio
- Horário de funcionamento
- Informações de contacto
- Base de conhecimento

### 3. **Conexão WhatsApp**
- QR Code gerado automaticamente
- Instruções passo-a-passo
- Verificação de conexão

### 4. **Agente Ativo**
- Confirmação de sucesso
- Informações do agente
- Instruções de uso

## 🔌 API Endpoints

### Configuração de Agente
```http
POST /api/whatsapp-gpt/setup-whatsapp-agent
Content-Type: application/json

{
  "business_name": "Restaurante Maputo",
  "business_description": "Comida tradicional moçambicana",
  "business_hours": "11h-22h",
  "contact_info": "+258 84 123 4567",
  "knowledge_text": "Cardápio e informações..."
}
```

### Verificar Conexão
```http
GET /api/whatsapp-gpt/check-connection/{instance_id}
```

### Obter QR Code
```http
GET /api/whatsapp-gpt/get-qr-code/{instance_id}
```

### Adicionar Conhecimento
```http
POST /api/whatsapp-gpt/add-knowledge
Content-Type: application/json

{
  "client_id": "uuid",
  "content": "Informações adicionais...",
  "metadata": {}
}
```

## 🤖 Workflow n8n

O sistema cria automaticamente um workflow n8n para cada cliente:

1. **Webhook Trigger**: Recebe mensagens WhatsApp
2. **Message Filter**: Filtra mensagens relevantes
3. **Extract Message**: Extrai dados da mensagem
4. **Query Knowledge Base**: Consulta base conhecimento
5. **Generate AI Response**: Gera resposta com GPT-4o
6. **Send WhatsApp Reply**: Envia resposta automática

## 🗄️ Base de Dados

### Redis
- Armazenamento de sessões
- Cache de configurações
- Dados temporários

### Pinecone (Vector Store)
- Embeddings de conhecimento
- Namespaces isolados por cliente
- Pesquisa semântica

## 🔒 Segurança

- **Isolamento**: Cada cliente tem instância própria
- **Credenciais**: Armazenamento seguro de API keys
- **CORS**: Configurado para frontend
- **Validação**: Inputs validados no backend

## 📊 Monitorização

### Logs
- Evolution API: Conexões e mensagens
- n8n: Execuções de workflow
- Backend: Requests e erros

### Métricas
- Número de agentes ativos
- Mensagens processadas
- Taxa de sucesso

## 🚀 Deployment

### Opção 1: Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./whatsapp-gpt-backend
    ports:
      - "5000:5000"
    environment:
      - EVOLUTION_API_URL=http://evolution:8080
      - N8N_API_URL=http://n8n:5678
  
  frontend:
    build: ./whatsapp-gpt-frontend
    ports:
      - "3000:3000"
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Opção 2: Serviços Separados
1. Deploy backend em servidor Python
2. Build frontend para arquivos estáticos
3. Configurar proxy reverso (Nginx)

## 🔧 Configuração Evolution API

### Docker Run
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your-key \
  atendai/evolution-api:latest
```

### Webhook Configuration
O sistema configura automaticamente webhooks para:
- `MESSAGES_UPSERT`: Novas mensagens
- `CONNECTION_UPDATE`: Estado da conexão
- `GROUPS_UPSERT`: Atualizações de grupos

## 🔧 Configuração n8n

### Docker Run
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  n8nio/n8n
```

### API Access
- Ativar API em Settings
- Gerar API key
- Configurar CORS se necessário

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. QR Code não aparece
- Verificar se Evolution API está ativo
- Confirmar API key correta
- Verificar logs do backend

#### 2. Mensagens não são respondidas
- Verificar conexão WhatsApp
- Confirmar workflow n8n ativo
- Verificar webhook configurado

#### 3. Erro de conexão backend
- Verificar se Redis está ativo
- Confirmar variáveis de ambiente
- Verificar portas disponíveis

### Logs Úteis
```bash
# Backend logs
tail -f whatsapp-gpt-backend/logs/app.log

# Evolution API logs
docker logs evolution-api

# n8n logs
docker logs n8n
```

## 📈 Escalabilidade

### Horizontal Scaling
- Load balancer para múltiplas instâncias backend
- Redis Cluster para alta disponibilidade
- CDN para frontend estático

### Vertical Scaling
- Aumentar recursos servidor
- Otimizar queries base dados
- Cache agressivo

## 🔄 Atualizações

### Backend
1. Parar serviço
2. Atualizar código
3. Instalar dependências
4. Reiniciar serviço

### Frontend
1. Build nova versão
2. Substituir arquivos estáticos
3. Limpar cache CDN

## 📞 Suporte

### Documentação
- README.md detalhado
- Comentários no código
- API documentation

### Contacto
- Email: suporte@whatsappgpt.co.mz
- WhatsApp: +258 84 000 0000
- GitHub: Issues e Pull Requests

## 📄 Licença

Este projeto está licenciado sob MIT License - ver arquivo LICENSE para detalhes.

## 🙏 Contribuições

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Criar branch para feature
3. Commit alterações
4. Push para branch
5. Abrir Pull Request

## 🔮 Roadmap

### Versão 1.1
- [ ] Dashboard de analytics
- [ ] Múltiplos idiomas
- [ ] Templates de respostas
- [ ] Integração calendário

### Versão 1.2
- [ ] Chatbot visual builder
- [ ] Integração CRM
- [ ] Relatórios avançados
- [ ] API pública

### Versão 2.0
- [ ] Multi-tenant SaaS
- [ ] Sistema de pagamentos
- [ ] Marketplace templates
- [ ] Mobile app

