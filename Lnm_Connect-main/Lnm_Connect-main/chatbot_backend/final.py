"""
Final Simplified Gemini Chatbot
Sends all knowledge base files directly to Gemini for intelligent responses
Gemini handles: clarifications, context, and intelligent querying
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables!")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI
app = FastAPI(title="Final Gemini Chatbot API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    question: str
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    answer: str
    timestamp: str
    model: str = "gemini-2.0-flash"

# Global variables
knowledge_base = ""
files_loaded = []

def load_knowledge_base():
    """Load all .txt files from lnm_data folder into a single knowledge base"""
    global knowledge_base, files_loaded
    
    print("\n📚 Loading knowledge base...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_folder = os.path.join(script_dir, "lnm_data")
    
    if not os.path.exists(data_folder):
        print(f"❌ Data folder not found: {data_folder}")
        return False
    
    knowledge_parts = []
    files_loaded = []
    
    for filename in os.listdir(data_folder):
        if filename.endswith('.txt'):
            filepath = os.path.join(data_folder, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        knowledge_parts.append("=" * 80)
                        knowledge_parts.append(f"SOURCE FILE: {filename}")
                        knowledge_parts.append("=" * 80)
                        knowledge_parts.append(content)
                        knowledge_parts.append("")

                        files_loaded.append(filename)
                        print(f"✅ Loaded: {filename} ({len(content)} chars)")
            except Exception as e:
                print(f"⚠️ Error loading {filename}: {e}")
    
    if not knowledge_parts:
        print("❌ No data files loaded!")
        return False
    
    knowledge_base = "\n".join(knowledge_parts)
    print(f"\n✅ Knowledge base ready: {len(files_loaded)} files, {len(knowledge_base)} chars")
    return True


def create_system_prompt():
    """Create the system prompt with full knowledge base"""
    return f"""You are an intelligent AI assistant for LNMIIT (LNM Institute of Information Technology) college campus.

You have access to the complete knowledge base about the college below.

Rules:
- Answer ONLY using the provided knowledge base.
- If multiple names match, ask a clarifying question.
- If info is missing, say: "I don't have that information in my current knowledge base."
- Keep responses structured and friendly with 1–2 emojis max.

KNOWLEDGE BASE:
{knowledge_base}
"""


def chat_with_gemini(question: str, conversation_history: List[dict] = None) -> str:
    """Send question to Gemini with full knowledge base"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        if conversation_history and len(conversation_history) > 0:
            messages = []

            messages.append({
                "role": "user",
                "parts": [create_system_prompt()]
            })
            messages.append({
                "role": "model",
                "parts": ["Knowledge base received. Ready to answer accurately."]
            })

            for msg in conversation_history[-10:]:
                messages.append({
                    "role": msg["role"],
                    "parts": [msg["content"]]
                })

            chat = model.start_chat(history=messages)
            response = chat.send_message(question)
        else:
            prompt = f"{create_system_prompt()}\n\nUSER QUESTION: {question}\n\nANSWER:"
            response = model.generate_content(prompt)

        return response.text

    except Exception as e:
        return f"Error communicating with Gemini: {str(e)}"


@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 Starting Final Gemini Chatbot API")
    print("="*60)

    if not load_knowledge_base():
        print("⚠️ Knowledge base NOT loaded!")
    else:
        print("✅ Chatbot ready!")


@app.get("/")
def root():
    return {
        "message": "Final Gemini Chatbot API - Ready",
        "files_loaded": files_loaded,
        "knowledge_base_size": len(knowledge_base),
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "files_loaded": files_loaded,
        "knowledge_base_size": len(knowledge_base)
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not knowledge_base:
        raise HTTPException(503, "Knowledge base not loaded")

    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty")

    answer = chat_with_gemini(request.question, request.conversation_history)

    return ChatResponse(
        answer=answer,
        timestamp=datetime.now().isoformat()
    )


@app.post("/api/reload")
async def reload_data():
    success = load_knowledge_base()
    return {
        "message": "Reloaded" if success else "Failed",
        "files_loaded": files_loaded,
        "knowledge_base_size": len(knowledge_base)
    }


# ---------------------------------------------------
# 🚀 RENDER DEPLOYMENT ENTRY POINT (Correct)
# ---------------------------------------------------
if __name__ == "__main__":
    if not load_knowledge_base():
        print("❌ Failed to load knowledge base!")
        exit(1)

    print("\n" + "="*60)
    print("🎓 Final Gemini Chatbot API Server")
    print("="*60)

    port = int(os.environ.get("PORT", 8000))

    print(f"Starting server on http://0.0.0.0:{port}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
