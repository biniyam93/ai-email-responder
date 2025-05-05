from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro-latest')

# Load support docs
with open("data/support_docs.json") as f:
    SUPPORT_DOCS = json.load(f)

def search_docs(query):
    """Check if query matches any FAQ entry."""
    for question, answer in SUPPORT_DOCS.items():
        if question.lower() in query.lower():
            return answer
    return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/respond', methods=['POST'])
def respond():
    email_text = request.json.get('email_text', '').strip()

    # Check FAQ first
    faq_answer = search_docs(email_text)
    if faq_answer:
        return jsonify({
            "reply": faq_answer,
            "source": "FAQ"
        })

    # Fallback to Gemini
    try:
        prompt = f"""You are a customer support agent. Use ONLY this info:
        {SUPPORT_DOCS}.
        If unsure, say: "I'll check with the team."
        
        Customer email: {email_text}"""
        
        response = model.generate_content(prompt)
        return jsonify({
            "reply": response.text,
            "source": "Gemini AI"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(port=5050, debug=True)
