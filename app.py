from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize the summarizer (this may take time on first run due to model download)
try:
    logger.info("Loading summarization model...")
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data or 'text' not in data:
            logger.warning("No text provided in request.")
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        if not isinstance(text, str) or not text.strip():
            logger.warning("Invalid text input.")
            return jsonify({'error': 'Text must be a non-empty string'}), 400

        # Summarize the text
        logger.info("Summarizing text...")
        summary = summarizer(text, max_length=100, min_length=30, do_sample=False)
        logger.info("Summarization complete.")
        
        return jsonify({'summary': summary[0]['summary_text']})
    
    except Exception as e:
        logger.error(f"Error during summarization: {str(e)}")
        return jsonify({'error': f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5001...")
    app.run(debug=True, port=5001)  # Changed to port 5001 to avoid conflicts