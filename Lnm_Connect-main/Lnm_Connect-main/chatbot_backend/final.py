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
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_folder = os.path.join(script_dir, "lnm_data")
    
    if not os.path.exists(data_folder):
        print(f"❌ Data folder not found: {data_folder}")
        return False
    
    # Load all .txt files
    knowledge_parts = []
    files_loaded = []
    
    for filename in os.listdir(data_folder):
        if filename.endswith('.txt'):
            filepath = os.path.join(data_folder, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        # Add clear section markers for each file
                        knowledge_parts.append(f"{'='*80}")
                        knowledge_parts.append(f"SOURCE FILE: {filename}")
                        knowledge_parts.append(f"{'='*80}")
                        knowledge_parts.append(content)
                        knowledge_parts.append("")  # Empty line between files
                        
                        files_loaded.append(filename)
                        print(f"✅ Loaded: {filename} ({len(content)} chars)")
            except Exception as e:
                print(f"⚠️  Error loading {filename}: {e}")
    
    if not knowledge_parts:
        print("❌ No data files loaded!")
        return False
    
    # Combine all content
    knowledge_base = "\n".join(knowledge_parts)
    print(f"\n✅ Knowledge base ready: {len(files_loaded)} files, {len(knowledge_base)} chars")
    return True

def create_system_prompt():
    """Create the system prompt with full knowledge base"""
    return f"""You are an intelligent AI assistant for LNMIIT (LNM Institute of Information Technology) college campus.

You have access to the complete knowledge base about the college below. Your job is to:

1. **Answer questions accurately** using ONLY the information provided in the knowledge base
2. **Ask clarifying questions** when user queries are ambiguous (e.g., if there are multiple people with same name)
3. **Be conversational and friendly** - use a helpful, student-friendly tone
4. **Use emojis sparingly** (1-2 per response) to make it engaging
5. **Format responses well** - use bullet points, line breaks for readability
6. **If information is not in knowledge base**, politely say "I don't have that information in my current knowledge base"

**IMPORTANT RULES:**
- When there are multiple matches (e.g., "Tell me about Rahul" when there are 2 Rahuls), ASK which one they mean
- Provide relevant details like email, phone, designation when available
- For department/contact queries, give complete information (name, email, phone, office location)
- For events, mention dates, times, locations, and registration details
- For facilities, mention timings, locations, and rules if available

**KNOWLEDGE BASE:**
{knowledge_base}

Remember: Be intelligent, ask clarifying questions when needed, and always use ONLY the information from the knowledge base above."""

def chat_with_gemini(question: str, conversation_history: List[dict] = None) -> str:
    """
    Send question to Gemini with full knowledge base
    
    Args:
        question: User's question
        conversation_history: List of previous messages for context
        
    Returns:
        Gemini's response
    """
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Build conversation with context
        if conversation_history and len(conversation_history) > 0:
            # Start a chat with history
            messages = []
            
            # Add system prompt as first message
            messages.append({
                "role": "user",
                "parts": [create_system_prompt()]
            })
            messages.append({
                "role": "model", 
                "parts": ["I understand. I'm ready to help with questions about LNMIIT using the knowledge base provided. I'll ask clarifying questions when needed and provide accurate information."]
            })
            
            # Add conversation history (skip system prompt)
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                if msg.get("role") in ["user", "model"]:
                    messages.append({
                        "role": msg["role"],
                        "parts": [msg["content"]]
                    })
            
            # Start chat with history
            chat = model.start_chat(history=messages)
            response = chat.send_message(question)
            
        else:
            # First message - send with system prompt
            prompt = f"{create_system_prompt()}\n\n**USER QUESTION:** {question}\n\n**YOUR RESPONSE:**"
            response = model.generate_content(prompt)
        
        return response.text
        
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return f"Sorry, I encountered an error processing your request: {str(e)}"

@app.on_event("startup")
async def startup_event():
    """Initialize chatbot on startup"""
    print("\n" + "="*60)
    print("🚀 Starting Final Gemini Chatbot API")
    print("="*60)
    
    if not load_knowledge_base():
        print("⚠️  WARNING: Knowledge base not loaded!")
    else:
        print("\n✅ Chatbot ready to serve!")

@app.get("/")
def root():
    return {
        "message": "Final Gemini Chatbot API - Direct Knowledge Base Access",
        "status": "running",
        "model": "gemini-2.0-flash",
        "files_loaded": files_loaded,
        "knowledge_base_size": len(knowledge_base),
        "docs": "/docs",
        "endpoints": {
            "chat": "POST /api/chat",
            "health": "GET /health",
            "reload": "POST /api/reload"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model": "gemini-2.0-flash",
        "files_loaded": len(files_loaded),
        "files": files_loaded,
        "knowledge_base_size": len(knowledge_base)
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat requests with conversation history"""
    try:
        if not knowledge_base:
            raise HTTPException(
                status_code=503,
                detail="Knowledge base not loaded. Please check data files."
            )
        
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Get answer from Gemini
        answer = chat_with_gemini(
            request.question, 
            request.conversation_history
        )
        
        return ChatResponse(
            answer=answer,
            timestamp=datetime.now().isoformat(),
            model="gemini-2.0-flash"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.post("/api/reload")
async def reload_data():
    """Reload knowledge base from files"""
    try:
        success = load_knowledge_base()
        return {
            "message": "Knowledge base reloaded successfully" if success else "Failed to reload",
            "files_loaded": len(files_loaded),
            "files": files_loaded,
            "knowledge_base_size": len(knowledge_base)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reloading: {str(e)}")

def interactive_chat():
    """Interactive command-line chat"""
    print("\n" + "="*60)
    print("🎓 LNMIIT Campus AI Assistant (Final Version)")
    print("="*60)
    print("\nType your questions (or 'quit' to exit)")
    print("I'll ask clarifying questions when needed!\n")
    
    conversation_history = []
    
    while True:
        try:
            question = input("\n💬 You: ").strip()
            
            if question.lower() in ['quit', 'exit', 'bye']:
                print("\n👋 Goodbye!\n")
                break
            
            if not question:
                continue
            
            # Get answer
            answer = chat_with_gemini(question, conversation_history)
            
            print(f"\n🤖 Bot: {answer}")
            
            # Store in history
            conversation_history.append({"role": "user", "content": question})
            conversation_history.append({"role": "model", "content": answer})
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!\n")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")

if __name__ == "__main__":
    # Load knowledge base
    if not load_knowledge_base():
        print("❌ Failed to load knowledge base!")
        exit(1)
    
    # Choose mode
    print("\nChoose mode:")
    print("1. API Server (for web app)")
    print("2. Interactive Chat (terminal)")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "2":
        interactive_chat()
    else:
        print("\n" + "="*60)
        print("🎓 Final Gemini Chatbot API Server")
        print("="*60)
        print("\nStarting server on http://localhost:8001")
        print("API Documentation: http://localhost:8001/docs\n")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            log_level="info"
        )
