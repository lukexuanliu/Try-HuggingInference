# Hugging Face LLM Demo (TypeScript Version)

A prototype application that demonstrates interaction with Hugging Face's publicly hosted LLM models, with comprehensive debugging and logging features.

## Features

- Connect to Hugging Face's Inference API
- Generate text using various LLM models (distilgpt2, flan-t5-large, etc.)
- Adjust generation parameters (temperature, top-k, top-p)
- View detailed debug information about API requests and responses
- Comprehensive error handling and logging

## Tech Stack

- TypeScript
- Express.js
- EJS Templates
- Bootstrap CSS (Replit dark theme)
- Axios for API requests
- Winston for logging

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Hugging Face API token:
   ```
   HUGGINGFACE_API_TOKEN=your_token_here
   PORT=5000
   NODE_ENV=development
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Usage

The application provides a simple API endpoint for text generation:

```
POST /generate
{
  "model": "distilgpt2",
  "prompt": "Once upon a time",
  "params": {
    "max_new_tokens": 100,
    "temperature": 0.7,
    "top_k": 50,
    "top_p": 0.95
  }
}
```

Response:
```json
{
  "success": true,
  "result": "Generated text goes here...",
  "debugInfo": {
    "model": { ... },
    "requestUrl": "...",
    "requestHeaders": { ... },
    "requestPayload": { ... },
    "requestTime": 1.234,
    "rawResponse": { ... },
    "httpStatus": 200
  }
}
```

## Models

The application supports the following models:

- DistilGPT-2: A distilled version of GPT-2 for text generation
- Flan-T5 Large: Google's instruction-tuned T5 model for text2text generation
- BLOOM 560M: The BLOOM language model (560M parameter version)

## License

ISC