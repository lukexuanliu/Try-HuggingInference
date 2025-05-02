import json
import logging
import time
import requests
from requests.exceptions import RequestException
from config import HUGGINGFACE_API_TOKEN, AVAILABLE_MODELS

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('huggingface_api')

class HuggingFaceAPI:
    """Class to handle interactions with the Hugging Face Inference API"""
    
    def __init__(self, api_token=HUGGINGFACE_API_TOKEN):
        self.api_token = api_token
        self.base_url = "https://api-inference.huggingface.co/models/"
        self.headers = {"Authorization": f"Bearer {api_token}"}
        
    def generate_text(self, model_name, prompt, params=None):
        """
        Generate text using the specified model and prompt
        
        Args:
            model_name (str): The name of the model to use
            prompt (str): The prompt to generate text from
            params (dict): Additional parameters for the API call
            
        Returns:
            dict: Response containing generation results and debug info
        """
        # Start timing the request
        start_time = time.time()
        
        # Get the model info from the available models
        model_info = AVAILABLE_MODELS.get(model_name, None)
        if not model_info:
            return {
                "success": False,
                "error": f"Model {model_name} not found in available models",
                "debug_info": {
                    "request_time": 0,
                    "raw_request": None,
                    "raw_response": None
                }
            }
        
        # Construct the API URL
        api_url = f"{self.base_url}{model_info['name']}"
        logger.debug(f"API URL: {api_url}")
        
        # Prepare the payload based on the task type
        task = model_info.get('task', 'text-generation')
        
        if task == 'text-generation':
            payload = {
                "inputs": prompt,
                **(params or {})
            }
        elif task == 'text2text-generation':
            payload = {
                "inputs": prompt,
                **(params or {})
            }
        else:
            payload = {
                "inputs": prompt,
                **(params or {})
            }
            
        # Log the request details
        logger.debug(f"Request payload: {json.dumps(payload, indent=2)}")
        
        # Prepare the debug info dictionary
        debug_info = {
            "model": model_info,
            "request_url": api_url,
            "request_headers": {k: v for k, v in self.headers.items() if k != "Authorization"},
            "request_payload": payload,
            "request_time": 0,
            "raw_request": None,
            "raw_response": None,
            "http_status": None
        }
        
        try:
            # Make the API request
            response = requests.post(
                api_url,
                headers=self.headers,
                json=payload
            )
            
            # Calculate the request time
            request_time = time.time() - start_time
            debug_info["request_time"] = round(request_time, 3)
            
            # Log the raw request and response
            debug_info["raw_request"] = {
                "url": response.request.url,
                "method": response.request.method,
                "headers": dict(response.request.headers),
                "body": payload
            }
            
            debug_info["http_status"] = response.status_code
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            debug_info["raw_response"] = result
            
            logger.debug(f"Response status: {response.status_code}")
            logger.debug(f"Response body: {json.dumps(result, indent=2)}")
            
            # Process the result based on the task
            processed_result = self._process_result(result, task)
            
            return {
                "success": True,
                "result": processed_result,
                "debug_info": debug_info
            }
            
        except RequestException as e:
            # Handle request errors
            logger.error(f"API request error: {str(e)}")
            error_message = str(e)
            
            # Try to parse the error response if available
            if hasattr(e, 'response') and e.response is not None:
                debug_info["http_status"] = e.response.status_code
                try:
                    error_json = e.response.json()
                    debug_info["raw_response"] = error_json
                    error_message = error_json.get('error', str(e))
                except ValueError:
                    debug_info["raw_response"] = e.response.text
            
            return {
                "success": False,
                "error": error_message,
                "debug_info": debug_info
            }
        except Exception as e:
            # Handle other errors
            logger.error(f"Unexpected error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "debug_info": debug_info
            }
    
    def _process_result(self, result, task):
        """Process the API result based on the task type"""
        if task == 'text-generation':
            # For text generation models like GPT-2
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '')
            return str(result)
        
        elif task == 'text2text-generation':
            # For text2text generation models like T5
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '')
            return str(result)
        
        # Default fallback
        return str(result)
