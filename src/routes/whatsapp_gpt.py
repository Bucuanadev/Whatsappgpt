from flask import Blueprint, request, jsonify
from src.services.evolution_api import EvolutionAPIManager
from src.services.n8n_manager import N8nFlowManager
from src.services.vector_store import VectorStoreManager
import uuid
import os
from datetime import datetime

# Create blueprint
whatsapp_gpt_bp = Blueprint('whatsapp_gpt', __name__)

# Initialize services
evolution_manager = EvolutionAPIManager()
n8n_manager = N8nFlowManager()
vector_manager = VectorStoreManager()

@whatsapp_gpt_bp.route('/setup-whatsapp-agent', methods=['POST'])
def setup_whatsapp_agent():
    """
    Complete setup process for a new WhatsApp GPT agent
    """
    try:
        data = request.get_json()
        
        # Extract required data
        business_name = data.get('business_name', '')
        business_description = data.get('business_description', '')
        business_hours = data.get('business_hours', '')
        contact_info = data.get('contact_info', '')
        knowledge_text = data.get('knowledge_text', '')
        
        # Generate unique client ID
        client_id = str(uuid.uuid4())
        
        # Step 1: Create Evolution API instance
        instance_result = evolution_manager.create_instance(
            client_id=client_id,
            business_name=business_name
        )
        
        if not instance_result['success']:
            return jsonify({
                'success': False,
                'error': f"Failed to create WhatsApp instance: {instance_result['error']}"
            }), 500
        
        instance_data = instance_result['instance']
        instance_id = instance_data['instance_id']
        
        # Step 2: Create n8n workflow
        workflow_result = n8n_manager.create_client_workflow(
            client_id=client_id,
            instance_id=instance_id,
            business_name=business_name
        )
        
        if not workflow_result['success']:
            return jsonify({
                'success': False,
                'error': f"Failed to create workflow: {workflow_result['error']}"
            }), 500
        
        workflow_data = workflow_result['workflow']
        webhook_url = workflow_data['webhook_url']
        
        # Step 3: Configure webhook in Evolution API
        if webhook_url:
            webhook_result = evolution_manager.configure_webhook(
                instance_name=instance_id,
                webhook_url=webhook_url
            )
            
            if not webhook_result['success']:
                print(f"Warning: Failed to configure webhook: {webhook_result['error']}")
        
        # Step 4: Process knowledge base
        knowledge_result = None
        if knowledge_text:
            # Combine business information with knowledge text
            full_knowledge = f"""
Informações da Empresa:
Nome: {business_name}
Descrição: {business_description}
Horário de Funcionamento: {business_hours}
Contacto: {contact_info}

Conhecimento Adicional:
{knowledge_text}
"""
            
            knowledge_result = vector_manager.process_text_content(
                client_id=client_id,
                content=full_knowledge,
                metadata={
                    'business_name': business_name,
                    'source_type': 'setup_form'
                }
            )
        
        # Step 5: Activate workflow
        activation_result = n8n_manager.activate_workflow(workflow_data['workflow_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'client_id': client_id,
                'instance_id': instance_id,
                'workflow_id': workflow_data['workflow_id'],
                'qr_code': instance_data.get('qr_code'),
                'webhook_url': webhook_url,
                'knowledge_processed': knowledge_result['success'] if knowledge_result else False,
                'workflow_active': activation_result['success'] if activation_result else False
            },
            'message': 'WhatsApp GPT agent setup completed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Setup failed: {str(e)}"
        }), 500

@whatsapp_gpt_bp.route('/check-connection/<instance_id>', methods=['GET'])
def check_connection(instance_id):
    """
    Check WhatsApp connection status
    """
    try:
        result = evolution_manager.check_connection_status(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/get-qr-code/<instance_id>', methods=['GET'])
def get_qr_code(instance_id):
    """
    Get QR code for WhatsApp connection
    """
    try:
        result = evolution_manager.get_qr_code(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/add-knowledge', methods=['POST'])
def add_knowledge():
    """
    Add knowledge to client's knowledge base
    """
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        content = data.get('content')
        metadata = data.get('metadata', {})
        
        if not client_id or not content:
            return jsonify({
                'success': False,
                'error': 'client_id and content are required'
            }), 400
        
        result = vector_manager.process_text_content(
            client_id=client_id,
            content=content,
            metadata=metadata
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/query-knowledge', methods=['POST'])
def query_knowledge():
    """
    Query client's knowledge base
    """
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        query = data.get('query')
        top_k = data.get('top_k', 5)
        
        if not client_id or not query:
            return jsonify({
                'success': False,
                'error': 'client_id and query are required'
            }), 400
        
        result = vector_manager.query_knowledge_base(
            client_id=client_id,
            query=query,
            top_k=top_k
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/workflow-status/<workflow_id>', methods=['GET'])
def workflow_status(workflow_id):
    """
    Get n8n workflow status
    """
    try:
        result = n8n_manager.get_workflow_status(workflow_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/send-test-message', methods=['POST'])
def send_test_message():
    """
    Send a test message via WhatsApp
    """
    try:
        data = request.get_json()
        instance_id = data.get('instance_id')
        number = data.get('number')
        message = data.get('message', 'Olá! Este é um teste do seu agente WhatsApp GPT. 🤖')
        
        if not instance_id or not number:
            return jsonify({
                'success': False,
                'error': 'instance_id and number are required'
            }), 400
        
        result = evolution_manager.send_message(
            instance_name=instance_id,
            number=number,
            message=message
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/client-stats/<client_id>', methods=['GET'])
def client_stats(client_id):
    """
    Get statistics for a client
    """
    try:
        # Get vector store stats
        vector_stats = vector_manager.get_client_stats(client_id)
        
        # Could add more stats here (message count, workflow executions, etc.)
        
        return jsonify({
            'success': True,
            'stats': {
                'knowledge_base': vector_stats,
                'client_id': client_id,
                'last_updated': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@whatsapp_gpt_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'success': True,
        'message': 'WhatsApp GPT API is running',
        'timestamp': datetime.now().isoformat()
    })

