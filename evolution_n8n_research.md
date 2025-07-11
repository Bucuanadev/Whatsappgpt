# Evolution API and n8n Integration Research

## Evolution API Overview

### What is Evolution API?
- **Open-source WhatsApp integration API** designed for small businesses, entrepreneurs, and freelancers
- **Free service** that provides WhatsApp messaging solution via API
- Supports both Baileys-based WhatsApp API and official WhatsApp Business API
- **Docker-based deployment** for easy installation and management

### Key Features:
1. **WhatsApp Integration**: Connect and manage WhatsApp accounts programmatically
2. **Instance Management**: Create and manage multiple WhatsApp instances
3. **Webhook Support**: Real-time event notifications
4. **Multi-platform Integration**: Works with Typebot, Chatwoot, Dify, OpenAI, and n8n
5. **QR Code Generation**: For WhatsApp connection
6. **Message Handling**: Send/receive text, images, videos, audio, documents

### API Endpoints Structure:
- **Base URL**: `http://localhost:8080` (default)
- **Authentication**: API Key via header (`apikey`)
- **Instance Management**: Create, delete, manage WhatsApp instances
- **Message Operations**: Send messages, get message history
- **Webhook Configuration**: Set up event notifications

## n8n Integration with Evolution API

### Community Node Available:
- **Package**: `n8n-nodes-evolution-api`
- **Installation**: Via n8n community nodes settings
- **Features**: Full Evolution API integration within n8n workflows

### Integration Capabilities:
1. **Message Processing**: Receive and process WhatsApp messages via webhooks
2. **Automated Responses**: Send automated replies based on triggers
3. **Group Management**: Handle group messages and operations
4. **Contact Management**: Manage WhatsApp contacts
5. **Media Handling**: Process images, videos, audio, documents

### Webhook Events:
- `MESSAGES_UPSERT`: New message received
- `CONNECTION_UPDATE`: Connection status changes
- `GROUPS_UPSERT`: Group updates
- `CONTACTS_UPDATE`: Contact changes

## Technical Implementation for WhatsApp GPT Platform

### 1. Evolution API Instance Management
```python
# Backend API endpoints for instance management
POST /api/evolution/create-instance
- Creates new Evolution API instance for client
- Generates unique instance name
- Returns QR code for WhatsApp connection

GET /api/evolution/instance-status/{instance_id}
- Checks connection status
- Returns QR code if disconnected

POST /api/evolution/configure-webhook/{instance_id}
- Sets up webhook URL for n8n integration
- Configures event types to monitor
```

### 2. n8n Flow Template Structure
```json
{
  "name": "WhatsApp GPT Agent Template",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "/whatsapp-message",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Message Filter",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event}}",
              "operation": "equal",
              "value2": "messages.upsert"
            }
          ]
        }
      }
    },
    {
      "name": "Vector Store Query",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.VECTOR_STORE_URL}}/query",
        "method": "POST",
        "body": {
          "query": "={{$json.data.message.conversation}}",
          "namespace": "={{$json.instance_id}}"
        }
      }
    },
    {
      "name": "OpenAI GPT Response",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful business assistant. Use the provided context to answer questions."
          },
          {
            "role": "user", 
            "content": "={{$json.data.message.conversation}}"
          }
        ]
      }
    },
    {
      "name": "Send WhatsApp Reply",
      "type": "n8n-nodes-evolution-api.evolutionApi",
      "parameters": {
        "operation": "sendMessage",
        "instanceId": "={{$json.instance_id}}",
        "number": "={{$json.data.key.remoteJid}}",
        "message": "={{$json.choices[0].message.content}}"
      }
    }
  ]
}
```

### 3. Automated Instance Creation Process
1. **User Registration**: Client signs up on WhatsApp GPT platform
2. **Instance Creation**: Backend automatically creates Evolution API instance
3. **n8n Flow Deployment**: Template workflow is duplicated for the client
4. **Webhook Configuration**: Evolution API configured to send events to n8n
5. **QR Code Generation**: Client scans QR to connect WhatsApp
6. **Knowledge Base Setup**: Client's documents processed and stored in vector database
7. **AI Agent Activation**: Automated responses begin working

### 4. Backend Architecture Components

#### Evolution API Manager Service
```python
class EvolutionAPIManager:
    def create_instance(self, client_id: str) -> dict:
        """Create new Evolution API instance for client"""
        
    def get_qr_code(self, instance_id: str) -> str:
        """Get QR code for WhatsApp connection"""
        
    def configure_webhook(self, instance_id: str, webhook_url: str) -> bool:
        """Configure webhook for n8n integration"""
        
    def check_connection_status(self, instance_id: str) -> str:
        """Check WhatsApp connection status"""
```

#### n8n Flow Manager Service
```python
class N8nFlowManager:
    def create_client_workflow(self, client_id: str, instance_id: str) -> str:
        """Create personalized n8n workflow from template"""
        
    def update_workflow_credentials(self, workflow_id: str, credentials: dict) -> bool:
        """Update workflow with client-specific credentials"""
        
    def activate_workflow(self, workflow_id: str) -> bool:
        """Activate the client's workflow"""
```

#### Vector Store Manager Service
```python
class VectorStoreManager:
    def create_namespace(self, client_id: str) -> str:
        """Create isolated namespace for client's knowledge base"""
        
    def process_documents(self, client_id: str, documents: list) -> bool:
        """Process and embed client documents"""
        
    def query_knowledge_base(self, client_id: str, query: str) -> str:
        """Query client's knowledge base for relevant information"""
```

### 5. Integration Flow Summary
1. **Client Onboarding**: Web interface collects business information
2. **Automated Setup**: Backend creates Evolution instance + n8n workflow
3. **WhatsApp Connection**: Client scans QR code to connect
4. **Knowledge Processing**: Documents embedded in vector store
5. **AI Agent Activation**: Automated responses begin
6. **Monitoring**: Dashboard shows conversation stats and agent performance

## Implementation Priorities
1. **Phase 1**: Basic Evolution API integration and instance management
2. **Phase 2**: n8n workflow template creation and deployment automation
3. **Phase 3**: Vector store integration for knowledge base
4. **Phase 4**: Advanced features (scheduling, analytics, multi-language)

## Technical Considerations
- **Scalability**: Each client gets isolated Evolution instance and n8n workflow
- **Security**: API keys and credentials managed securely
- **Reliability**: Health checks and automatic reconnection handling
- **Monitoring**: Logging and analytics for performance tracking

