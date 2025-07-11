import requests
import json
import uuid
from typing import Dict, Optional, List
from dataclasses import dataclass
import os
from datetime import datetime

@dataclass
class N8nWorkflow:
    """Data class for n8n workflow"""
    workflow_id: str
    client_id: str
    instance_id: str
    name: str
    status: str
    webhook_url: Optional[str] = None
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

class N8nFlowManager:
    """Manager for n8n workflow operations"""
    
    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = base_url or os.getenv('N8N_API_URL', 'http://localhost:5678')
        self.api_key = api_key or os.getenv('N8N_API_KEY', '')
        self.headers = {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': self.api_key
        }
    
    def get_workflow_template(self) -> Dict:
        """
        Get the base WhatsApp GPT workflow template
        
        Returns:
            Dictionary with workflow template
        """
        template = {
            "name": "WhatsApp GPT Agent Template",
            "nodes": [
                {
                    "parameters": {
                        "path": "whatsapp-webhook",
                        "options": {}
                    },
                    "id": "webhook-trigger",
                    "name": "Webhook Trigger",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300],
                    "webhookId": str(uuid.uuid4())
                },
                {
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
                    },
                    "id": "message-filter",
                    "name": "Message Filter",
                    "type": "n8n-nodes-base.if",
                    "typeVersion": 1,
                    "position": [460, 300]
                },
                {
                    "parameters": {
                        "jsCode": "// Extract message data\nconst messageData = $input.first().json;\nconst message = messageData.data?.message;\nconst remoteJid = messageData.data?.key?.remoteJid;\nconst messageText = message?.conversation || message?.extendedTextMessage?.text || '';\n\n// Skip if no message text or if it's from us\nif (!messageText || messageData.data?.key?.fromMe) {\n  return [];\n}\n\nreturn [{\n  messageText,\n  remoteJid,\n  instanceId: messageData.instance,\n  timestamp: new Date().toISOString()\n}];"
                    },
                    "id": "extract-message",
                    "name": "Extract Message",
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [680, 300]
                },
                {
                    "parameters": {
                        "url": "={{$env.VECTOR_STORE_URL}}/query",
                        "sendHeaders": true,
                        "headerParameters": {
                            "parameters": [
                                {
                                    "name": "Authorization",
                                    "value": "Bearer {{$env.VECTOR_STORE_API_KEY}}"
                                }
                            ]
                        },
                        "sendBody": true,
                        "bodyParameters": {
                            "parameters": [
                                {
                                    "name": "query",
                                    "value": "={{$json.messageText}}"
                                },
                                {
                                    "name": "namespace",
                                    "value": "={{$json.instanceId}}"
                                },
                                {
                                    "name": "top_k",
                                    "value": "3"
                                }
                            ]
                        }
                    },
                    "id": "query-knowledge-base",
                    "name": "Query Knowledge Base",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [900, 300]
                },
                {
                    "parameters": {
                        "model": "gpt-4o",
                        "messages": {
                            "messageValues": [
                                {
                                    "role": "system",
                                    "content": "Você é um assistente virtual inteligente para atendimento ao cliente via WhatsApp. Use o contexto fornecido para responder às perguntas de forma útil, profissional e amigável. Se não souber a resposta, seja honesto e ofereça ajuda alternativa. Sempre responda em português."
                                },
                                {
                                    "role": "user",
                                    "content": "Contexto: {{$json.context}}\n\nPergunta do cliente: {{$('Extract Message').item.json.messageText}}"
                                }
                            ]
                        },
                        "options": {
                            "temperature": 0.7,
                            "maxTokens": 500
                        }
                    },
                    "id": "generate-ai-response",
                    "name": "Generate AI Response",
                    "type": "@n8n/n8n-nodes-langchain.openAi",
                    "typeVersion": 1,
                    "position": [1120, 300]
                },
                {
                    "parameters": {
                        "url": "={{$env.EVOLUTION_API_URL}}/message/sendText/{{$('Extract Message').item.json.instanceId}}",
                        "sendHeaders": true,
                        "headerParameters": {
                            "parameters": [
                                {
                                    "name": "apikey",
                                    "value": "={{$env.EVOLUTION_API_KEY}}"
                                }
                            ]
                        },
                        "sendBody": true,
                        "bodyParameters": {
                            "parameters": [
                                {
                                    "name": "number",
                                    "value": "={{$('Extract Message').item.json.remoteJid}}"
                                },
                                {
                                    "name": "text",
                                    "value": "={{$json.choices[0].message.content}}"
                                }
                            ]
                        }
                    },
                    "id": "send-whatsapp-reply",
                    "name": "Send WhatsApp Reply",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 4,
                    "position": [1340, 300]
                }
            ],
            "connections": {
                "Webhook Trigger": {
                    "main": [
                        [
                            {
                                "node": "Message Filter",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Message Filter": {
                    "main": [
                        [
                            {
                                "node": "Extract Message",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Extract Message": {
                    "main": [
                        [
                            {
                                "node": "Query Knowledge Base",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Query Knowledge Base": {
                    "main": [
                        [
                            {
                                "node": "Generate AI Response",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Generate AI Response": {
                    "main": [
                        [
                            {
                                "node": "Send WhatsApp Reply",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                }
            },
            "active": False,
            "settings": {
                "timezone": "Africa/Maputo"
            },
            "tags": [
                {
                    "name": "WhatsApp GPT",
                    "id": "whatsapp-gpt"
                }
            ]
        }
        
        return template
    
    def create_client_workflow(self, client_id: str, instance_id: str, business_name: str = None) -> Dict:
        """
        Create a personalized n8n workflow for a client
        
        Args:
            client_id: Unique identifier for the client
            instance_id: Evolution API instance ID
            business_name: Optional business name
            
        Returns:
            Dictionary with workflow creation result
        """
        try:
            # Get template and customize it
            template = self.get_workflow_template()
            
            # Customize workflow name
            workflow_name = f"WhatsApp GPT - {business_name or client_id}"
            template["name"] = workflow_name
            
            # Create workflow
            response = requests.post(
                f"{self.base_url}/api/v1/workflows",
                headers=self.headers,
                json=template
            )
            
            if response.status_code == 201:
                workflow_data = response.json()
                workflow_id = workflow_data.get("id")
                
                # Get webhook URL
                webhook_url = self.get_webhook_url(workflow_id)
                
                workflow = N8nWorkflow(
                    workflow_id=workflow_id,
                    client_id=client_id,
                    instance_id=instance_id,
                    name=workflow_name,
                    status="created",
                    webhook_url=webhook_url
                )
                
                return {
                    "success": True,
                    "workflow": workflow.__dict__,
                    "message": "Workflow created successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to create workflow: {response.text}",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception creating workflow: {str(e)}"
            }
    
    def get_webhook_url(self, workflow_id: str) -> Optional[str]:
        """
        Get webhook URL for a workflow
        
        Args:
            workflow_id: n8n workflow ID
            
        Returns:
            Webhook URL or None
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                workflow_data = response.json()
                
                # Find webhook node
                for node in workflow_data.get("nodes", []):
                    if node.get("type") == "n8n-nodes-base.webhook":
                        webhook_id = node.get("webhookId")
                        path = node.get("parameters", {}).get("path", "")
                        
                        if webhook_id:
                            return f"{self.base_url}/webhook/{webhook_id}"
                        elif path:
                            return f"{self.base_url}/webhook/{path}"
                
                return None
                
        except Exception as e:
            print(f"Error getting webhook URL: {str(e)}")
            return None
    
    def activate_workflow(self, workflow_id: str) -> Dict:
        """
        Activate a workflow
        
        Args:
            workflow_id: n8n workflow ID
            
        Returns:
            Dictionary with activation result
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/activate",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Workflow activated successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to activate workflow: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception activating workflow: {str(e)}"
            }
    
    def deactivate_workflow(self, workflow_id: str) -> Dict:
        """
        Deactivate a workflow
        
        Args:
            workflow_id: n8n workflow ID
            
        Returns:
            Dictionary with deactivation result
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/deactivate",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Workflow deactivated successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to deactivate workflow: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception deactivating workflow: {str(e)}"
            }
    
    def delete_workflow(self, workflow_id: str) -> Dict:
        """
        Delete a workflow
        
        Args:
            workflow_id: n8n workflow ID
            
        Returns:
            Dictionary with deletion result
        """
        try:
            response = requests.delete(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Workflow deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to delete workflow: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception deleting workflow: {str(e)}"
            }
    
    def get_workflow_status(self, workflow_id: str) -> Dict:
        """
        Get workflow status and details
        
        Args:
            workflow_id: n8n workflow ID
            
        Returns:
            Dictionary with workflow status
        """
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                workflow_data = response.json()
                return {
                    "success": True,
                    "workflow": workflow_data,
                    "active": workflow_data.get("active", False),
                    "name": workflow_data.get("name", ""),
                    "id": workflow_data.get("id", "")
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to get workflow status: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception getting workflow status: {str(e)}"
            }

