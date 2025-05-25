from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
import logging
from huggingface_hub import hf_hub_download
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Constants for token management
MAX_TOTAL_TOKENS = 2048
MAX_NEW_TOKENS = 512
MAX_HISTORY_TOKENS = 1024
SAFETY_MARGIN = 50

# Global variable for the model
model = None

SYSTEM_PROMPT = """<|im_start|>system
You are PozzyAI, a friendly, helpful, and concise chatbot designed to assist users with everyday questions and simple tasks. Always maintain a positive, polite, and supportive tone. Keep responses brief, clear, and easy to understand. If you’re unsure about something, say so honestly or suggest a helpful next step. Avoid technical jargon unless specifically asked. Your goal is to make interactions pleasant, helpful, and efficient.<|im_end|>
"""

def ensure_model_downloaded():
    """Ensure the model file is downloaded before loading."""
    try:
        model_path = hf_hub_download(
            repo_id="TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
            filename="mistral-7b-instruct-v0.2.Q4_K_M.gguf",
            local_dir="models"
        )
        logger.info(f"Model downloaded successfully to: {model_path}")
        return model_path
    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        return None

def load_model():
    global model
    try:
        logger.info("Loading Mistral model...")
        
        # Ensure model is downloaded
        model_path = ensure_model_downloaded()
        if not model_path:
            raise Exception("Failed to download model file")
        
        # Initialize the model using local file
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            model_type='mistral',
            context_length=MAX_TOTAL_TOKENS,
            threads=6
        )
        
        logger.info("Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def format_chat_history(history):
    """Format the chat history into a single string prompt."""
    formatted_messages = [SYSTEM_PROMPT]
    
    if history:
        for msg in history[:-1]:
            role = msg['role']
            content = msg['content']
            
            if role == 'user':
                formatted_messages.append(f"<|im_start|>user\n{content}<|im_end|>")
            elif role == 'assistant':
                formatted_messages.append(f"<|im_start|>assistant\nPozzyAI: {content}<|im_end|>")
    
    return "\n".join(formatted_messages)

@app.route('/chat', methods=['POST'])
def chat():
    global model
    try:
        # 1. Validate model
        if model is None:
            if not load_model():
                return jsonify({
                    'success': False,
                    'error': 'Model failed to load. Please try again.'
                }), 500

        # 2. Validate input
        data = request.json
        logging.info(f"Received message: {data['message']}")
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        current_message = data.get('message', '').strip()
        chat_history = data.get('history', [])

        if not current_message:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            }), 400
            
        logger.info(f"Processing message: {current_message[:100]}...")
        
        # 3. Format conversation
        conversation = format_chat_history(chat_history)
        prompt = f"{conversation}\n<|im_start|>user\n{current_message}<|im_end|>\n<|im_start|>assistant\nPozzyAI:"
        
        # 4. Generate response
        try:
            response = model(
                prompt,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                repetition_penalty=1.1,
                stop=["<|im_end|>", "<|im_start|>"]
            )
            
            # 5. Clean up response
            response = response.split("PozzyAI:")[-1].strip()
            if not response:
                return jsonify({
                    'success': False,
                    'error': 'Generated empty response. Please try again.'
                }), 500
                
            if len(response) > MAX_NEW_TOKENS * 4:
                response = response[:MAX_NEW_TOKENS * 4].rsplit('.', 1)[0] + '.'
            
            return jsonify({
                'success': True,
                'response': response
            })
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to generate response. Please try again.'
            }), 500
            
    except Exception as e:
        logger.error(f"Error during chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Server error. Please try again.'
        }), 500



@app.route('/')
def index():
    return send_from_directory('', 'index.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('', path) 


os.makedirs("models", exist_ok=True)
load_model()
app.run(host='0.0.0.0', port=80, debug=False)


