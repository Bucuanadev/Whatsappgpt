import requests
import json
import uuid
from typing import Dict, Optional, List
from dataclasses import dataclass
import os
from datetime import datetime

@dataclass
class EvolutionInstance:
    """Data class for Evolution API instance"""
    instance_id: str
    instance_name: str
    client_id: str
    status: str
    qr_code: Optional[str] = None
    webhook_url: Optional[str] = None
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

class EvolutionAPIManager:
    """Manager for Evolution API operations"""
    
    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = base_url or os.getenv('EVOLUTION_API_URL', 'http://localhost:8080')
        self.api_key = api_key or os.getenv('EVOLUTION_API_KEY', 'change-me')
        self.headers = {
            'Content-Type': 'application/json',
            'apikey': self.api_key
        }
    
    def create_instance(self, client_id: str, business_name: str = None) -> Dict:
        """
        Create a new Evolution API instance for a client
        
        Args:
            client_id: Unique identifier for the client
            business_name: Optional business name for the instance
            
        Returns:
            Dictionary with instance details and QR code
        """
        try:
            # Generate unique instance name
            instance_name = f"whatsapp_gpt_{client_id}_{uuid.uuid4().hex[:8]}"
            
            # Create instance payload
            payload = {
                "instanceName": instance_name,
                "token": self.api_key,
                "qrcode": True,
                "number": "",
                "integration": "WHATSAPP-BAILEYS"
            }
            
            # Create instance
            response = requests.post(
                f"{self.base_url}/instance/create",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 201:
                result = response.json()
                
                # Get QR code
                qr_response = self.get_qr_code(instance_name)
                
                instance = EvolutionInstance(
                    instance_id=instance_name,
                    instance_name=instance_name,
                    client_id=client_id,
                    status="created",
                    qr_code=qr_response.get('qrcode', {}).get('code') if qr_response else None
                )
                
                return {
                    "success": True,
                    "instance": instance.__dict__,
                    "message": "Instance created successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to create instance: {response.text}",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception creating instance: {str(e)}"
            }
    
    def get_qr_code(self, instance_name: str) -> Dict:
        """
        Get QR code for WhatsApp connection
        
        Args:
            instance_name: Name of the Evolution API instance
            
        Returns:
            Dictionary with QR code data
        """
        try:
            response = requests.get(
                f"{self.base_url}/instance/connect/{instance_name}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "qrcode": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to get QR code: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception getting QR code: {str(e)}"
            }
    
    def check_connection_status(self, instance_name: str) -> Dict:
        """
        Check WhatsApp connection status for an instance
        
        Args:
            instance_name: Name of the Evolution API instance
            
        Returns:
            Dictionary with connection status
        """
        try:
            response = requests.get(
                f"{self.base_url}/instance/connectionState/{instance_name}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "status": result.get("instance", {}).get("state", "unknown"),
                    "data": result
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to check status: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception checking status: {str(e)}"
            }
    
    def configure_webhook(self, instance_name: str, webhook_url: str, events: List[str] = None) -> Dict:
        """
        Configure webhook for an instance
        
        Args:
            instance_name: Name of the Evolution API instance
            webhook_url: URL to receive webhook events
            events: List of events to monitor (default: all message events)
            
        Returns:
            Dictionary with configuration result
        """
        try:
            if events is None:
                events = [
                    "MESSAGES_UPSERT",
                    "CONNECTION_UPDATE",
                    "CALL",
                    "GROUPS_UPSERT",
                    "CONTACTS_UPDATE"
                ]
            
            payload = {
                "url": webhook_url,
                "enabled": True,
                "events": events,
                "webhook_by_events": True
            }
            
            response = requests.post(
                f"{self.base_url}/webhook/set/{instance_name}",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code in [200, 201]:
                return {
                    "success": True,
                    "message": "Webhook configured successfully",
                    "data": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to configure webhook: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception configuring webhook: {str(e)}"
            }
    
    def send_message(self, instance_name: str, number: str, message: str) -> Dict:
        """
        Send a WhatsApp message
        
        Args:
            instance_name: Name of the Evolution API instance
            number: Phone number to send message to
            message: Message content
            
        Returns:
            Dictionary with send result
        """
        try:
            payload = {
                "number": number,
                "text": message
            }
            
            response = requests.post(
                f"{self.base_url}/message/sendText/{instance_name}",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 201:
                return {
                    "success": True,
                    "message": "Message sent successfully",
                    "data": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to send message: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception sending message: {str(e)}"
            }
    
    def delete_instance(self, instance_name: str) -> Dict:
        """
        Delete an Evolution API instance
        
        Args:
            instance_name: Name of the Evolution API instance
            
        Returns:
            Dictionary with deletion result
        """
        try:
            response = requests.delete(
                f"{self.base_url}/instance/delete/{instance_name}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Instance deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to delete instance: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception deleting instance: {str(e)}"
            }
    
    def list_instances(self) -> Dict:
        """
        List all Evolution API instances
        
        Returns:
            Dictionary with list of instances
        """
        try:
            response = requests.get(
                f"{self.base_url}/instance/fetchInstances",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "instances": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to list instances: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Exception listing instances: {str(e)}"
            }

