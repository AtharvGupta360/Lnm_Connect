# LNMConnect AI ChatBot - Setup Guide

## 🤖 Overview
This is a Retrieval-Augmented Generation (RAG) based chatbot system for LNMConnect that answers campus-related questions using OpenAI embeddings and FAISS vector search.

## 📋 Prerequisites
- Python 3.9 or higher
- Node.js 16+ (already installed for frontend)
- MongoDB running on localhost:27017
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Install Python Dependencies
```powershell
cd chatbot_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
```powershell
# Copy the example file
copy .env.example .env

# Edit .env and add your OpenAI API key
notepad .env
```

Add this to `.env`:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=mydatabase
HOST=0.0.0.0
PORT=8000
```

### 3. Start the ChatBot Backend
```powershell
# Make sure you're in chatbot_backend folder
cd chatbot_backend
venv\Scripts\activate
python main.py
```

The API will start on `http://localhost:8000`

On first run, it will:
- Load all documents from `lnm_data` folder
- Create embeddings using OpenAI
- Build FAISS vector index
- Save index for future use

### 4. Start the Main Backend (Java)
```powershell
# In a new terminal
cd backend
mvn spring-boot:run
```

### 5. Start the Frontend
```powershell
# In another terminal
cd frontend
npm run dev
```

### 6. Access the ChatBot
- Main app: `http://localhost:5173`
- ChatBot API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Admin Panel: Navigate to `/admin/unanswered` in the app

## 📚 Knowledge Base Files

The chatbot learns from these files in `lnm_data/`:
- `academics.txt` - Academic information, grading, exams
- `events.txt` - Campus fests, clubs, workshops
- `facilities.txt` - Hostel, mess, library, sports
- `contacts.txt` - Important contacts and offices

### Adding New Information
1. Edit the relevant `.txt` file in `lnm_data/`
2. Call the reload endpoint:
```bash
curl -X POST http://localhost:8000/api/reload-knowledge
```

Or restart the backend to automatically rebuild the index.

## 🔑 API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "question": "When is the next fest?",
  "conversation_id": "optional-uuid",
  "user_id": "user123"
}
```

### Get Unanswered Queries
```http
GET /api/unanswered
```

### Resolve Query
```http
POST /api/unanswered/resolve
Content-Type: application/json

{
  "query_id": "query-uuid",
  "answer": "The answer to the question..."
}
```

### Get Stats
```http
GET /api/stats
```

## 🎨 Frontend Integration

### Add ChatBot Button
In your `App.jsx` or main component:

```jsx
import ChatBot from './components/ChatBot';
import { MessageCircle } from 'lucide-react';

function App() {
  const [showChatBot, setShowChatBot] = useState(false);

  return (
    <>
      {/* Your app content */}
      
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatBot(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ChatBot Modal */}
      {showChatBot && (
        <ChatBot
          currentUser={currentUser}
          onClose={() => setShowChatBot(false)}
        />
      )}
    </>
  );
}
```

### Add Admin Route
In your router configuration:

```jsx
import AdminUnanswered from './pages/AdminUnanswered';

// Add this route
<Route path="/admin/unanswered" element={<AdminUnanswered />} />
```

## 🧪 Testing

### Test the API
```bash
# Health check
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the grading system?"}'
```

### Test Questions
Try these questions in the chat:
- "When is Plinth fest?"
- "What are the hostel timings?"
- "How is the grading system calculated?"
- "What is the library contact?"
- "Tell me about HackLNMIIT"

## 💾 MongoDB Collections

The chatbot uses these collections:

### `unanswered_queries`
```javascript
{
  id: "uuid",
  question: "user question",
  user_id: "user123",
  timestamp: "2024-11-03T10:30:00",
  conversation_id: "conv-uuid",
  status: "pending" // or "resolved"
}
```

### `chat_logs`
```javascript
{
  conversation_id: "conv-uuid",
  user_id: "user123",
  question: "user question",
  answer: "bot answer",
  timestamp: "2024-11-03T10:30:00",
  confidence: "high" // or "low"
}
```

### `conversations`
```javascript
{
  conversation_id: "conv-uuid",
  user_id: "user123",
  created_at: "2024-11-03T10:30:00",
  updated_at: "2024-11-03T10:35:00",
  messages: [
    {
      role: "user",
      content: "question",
      timestamp: "2024-11-03T10:30:00"
    },
    {
      role: "assistant",
      content: "answer",
      timestamp: "2024-11-03T10:30:01"
    }
  ]
}
```

## 🎯 Features

✅ **RAG-based Q&A** - Answers from actual campus documents
✅ **Context Retention** - Remembers conversation history
✅ **Unanswered Tracking** - Saves questions it can't answer
✅ **Admin Panel** - Review and respond to unanswered queries
✅ **Source Attribution** - Shows which documents were used
✅ **Typing Animation** - Realistic chat experience
✅ **Quick Questions** - Suggested prompts
✅ **Conversation Reset** - Start fresh anytime
✅ **Analytics** - Track usage statistics

## 🔧 Troubleshooting

### "OPENAI_API_KEY not set" error
- Make sure you created `.env` file in `chatbot_backend/` folder
- Add your actual OpenAI API key
- Restart the Python server

### FAISS index not loading
- Delete `faiss_index` folder
- Restart server to rebuild
- Or call `/api/reload-knowledge` endpoint

### MongoDB connection error
- Make sure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Try connecting with: `mongosh mongodb://localhost:27017`

### No documents found
- Check that `.txt` files exist in `lnm_data/` folder
- Files should be UTF-8 encoded
- Check file permissions

## 📞 Support

For issues or questions:
- Check API logs in the Python terminal
- Visit API documentation: `http://localhost:8000/docs`
- Check MongoDB collections for data
- Review browser console for frontend errors

## 🎓 How It Works

1. **Document Loading**: Text files loaded from `lnm_data/`
2. **Chunking**: Split into 1000-character chunks with 200-char overlap
3. **Embedding**: Each chunk converted to vector using OpenAI
4. **Storage**: Vectors stored in FAISS for fast retrieval
5. **Query**: User question embedded and similar chunks found
6. **Generation**: OpenAI generates answer from retrieved chunks
7. **Tracking**: Unanswered queries saved to MongoDB

## 🚀 Production Tips

- Use environment-specific `.env` files
- Enable HTTPS for API endpoints
- Add rate limiting to prevent abuse
- Set up logging and monitoring
- Regular backups of MongoDB collections
- Cache frequently asked questions
- Fine-tune chunk size and overlap for better results

---

**Happy Chatting! 🤖💬**
