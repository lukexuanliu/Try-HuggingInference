import os

# Default models to use
AVAILABLE_MODELS = {
    "distilgpt2": {
        "name": "distilgpt2",
        "display_name": "DistilGPT-2",
        "description": "Distilled version of GPT-2, a transformer-based language model",
        "task": "text-generation"
    },
    "flan-t5-large": {
        "name": "google/flan-t5-large",
        "display_name": "Flan-T5 Large",
        "description": "Finetuned version of T5 with instructions",
        "task": "text2text-generation"
    },
    "bloom-560m": {
        "name": "bigscience/bloom-560m",
        "display_name": "BLOOM 560M",
        "description": "BLOOM language model, 560M parameter version",
        "task": "text-generation"
    }
}

# Default model to use
DEFAULT_MODEL = "distilgpt2"

# Configuration for API request
MAX_NEW_TOKENS = 100
TEMPERATURE = 0.7
TOP_K = 50
TOP_P = 0.95

# Get Hugging Face API key from environment variables
# This should be set in the environment or in the Replit Secrets
HUGGINGFACE_API_TOKEN = os.environ.get("HUGGINGFACE_API_TOKEN", "")
