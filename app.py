import os
import json
import logging
from flask import Flask, render_template, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
from huggingface_api import HuggingFaceAPI
from config import AVAILABLE_MODELS, DEFAULT_MODEL, MAX_NEW_TOKENS, TEMPERATURE, TOP_K, TOP_P

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('huggingface_demo')

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Initialize the Hugging Face API client
hf_api = HuggingFaceAPI()

@app.route('/')
def index():
    """Render the main page of the application"""
    return render_template(
        'index.html', 
        models=AVAILABLE_MODELS,
        default_model=DEFAULT_MODEL,
        max_new_tokens=MAX_NEW_TOKENS,
        temperature=TEMPERATURE,
        top_k=TOP_K,
        top_p=TOP_P
    )

@app.route('/generate', methods=['POST'])
def generate():
    """
    Handle text generation requests
    
    Expects:
        - model: The model to use for generation
        - prompt: The input prompt for generation
        - params: Additional parameters for the API
    """
    try:
        # Get request data
        data = request.get_json()
        model = data.get('model', DEFAULT_MODEL)
        prompt = data.get('prompt', '')
        params = data.get('params', {})
        
        logger.debug(f"Generation request: model={model}, prompt={prompt}, params={params}")
        
        # Validate input
        if not prompt.strip():
            return jsonify({
                "success": False,
                "error": "Prompt cannot be empty",
                "debug_info": None
            })
        
        # Generate text
        response = hf_api.generate_text(model, prompt, params)
        
        # Log the result
        if response["success"]:
            logger.info(f"Generation successful: {response['result'][:50]}...")
        else:
            logger.error(f"Generation failed: {response['error']}")
        
        return jsonify(response)
        
    except Exception as e:
        logger.exception("Error processing generation request")
        return jsonify({
            "success": False,
            "error": str(e),
            "debug_info": None
        })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
