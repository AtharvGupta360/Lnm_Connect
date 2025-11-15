# 🤖 LNM Campus Chatbot - Quick Start Guide

## ✅ Setup Complete!

Your RAG-based chatbot is fully integrated into LNMConnect! Here's how to get it running.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Python Dependencies

```powershell
# Navigate to chatbot backend
cd chatbot_backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Step 3: Configure Environment

```powershell
# Create .env file from example
copy .env.example .env

# Open .env in notepad
notepad .env
```

Add your key:
```
OPENAI_API_KEY=sk-your-actual-key-here
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=mydatabase
```

### Step 4: Start All Services

**Terminal 1 - Python Backend:**
```powershell
cd chatbot_backend
venv\Scripts\activate
python main.py
```
✅ Running on http://localhost:8000

**Terminal 2 - Java Backend:**
```powershell
cd backend
mvn spring-boot:run
```
✅ Running on http://localhost:8080

**Terminal 3 - React Frontend:**
```powershell
cd frontend
npm run dev
```
✅ Running on http://localhost:5173

---

## 🎯 How to Use the Chatbot

### For Students:

1. **Open your browser** to http://localhost:5173
2. **Log in** to your account
3. **Look for the purple floating button** in the bottom-right corner (💬)
4. **Click the button** to open the chatbot
5. **Ask questions** like:
   - "When is Plinth fest happening?"
   - "What are the hostel timings?"
   - "How is the grading system calculated?"
   - "Tell me about campus facilities"
   - "What are the emergency contact numbers?"

### For Admins:

1. **Navigate to** http://localhost:5173/admin/unanswered
2. **View unanswered queries** that the bot couldn't handle
3. **Provide answers** to help students
4. **Mark as resolved** to close queries

---

## 📊 What Makes This Smart?

### RAG (Retrieval-Augmented Generation) Architecture:

```
Student Question
     ↓
Vector Search (FAISS) ← Knowledge Base (8000+ words)
     ↓
Top 3 Most Relevant Docs
     ↓
GPT-3.5 + Context + Conversation History
     ↓
Accurate Answer with Sources
```

### Knowledge Base Coverage:

- **📚 Academics** (2000+ words): Grading, exams, courses, faculty, internships
- **🎉 Events** (1500+ words): Plinth, Vivacity, HackLNMIIT, clubs, workshops
- **🏢 Facilities** (2500+ words): Hostels, mess, library, sports, medical
- **📞 Contacts** (2000+ words): Offices, departments, emergency numbers

---

## 🎨 UI Features

### Chatbot Window:
- ✅ Animated typing indicator
- ✅ User/Assistant message bubbles
- ✅ Source attribution for answers
- ✅ Quick question buttons
- ✅ Conversation reset
- ✅ Auto-scroll to latest message
- ✅ Enter to send, Shift+Enter for newline

### Admin Panel:
- ✅ Real-time statistics dashboard
- ✅ Unanswered query list with timestamps
- ✅ Inline answer textarea
- ✅ Resolve/delete actions
- ✅ Auto-refresh capability

---

## 🧪 Test Questions

### Academic Questions:
```
"What is the attendance policy?"
"How are grades calculated?"
"Tell me about the credit system"
"What are the exam rules?"
```

### Event Questions:
```
"When is Plinth 2025?"
"What is HackLNMIIT?"
"Tell me about Vivacity fest"
"What clubs can I join?"
```

### Facility Questions:
```
"What are the hostel timings?"
"When is the library open?"
"What sports facilities are available?"
"How do I access the medical center?"
```

### Contact Questions:
```
"What is the registrar's office number?"
"Give me emergency contact numbers"
"How do I contact the placement cell?"
```

---

## 🔧 Troubleshooting

### Chatbot button not showing?
- ✅ Make sure all 3 servers are running
- ✅ Check browser console for errors (F12)
- ✅ Clear browser cache and refresh

### "Error connecting to chatbot backend"?
- ✅ Verify Python backend is running on port 8000
- ✅ Check http://localhost:8000/docs (should show API docs)
- ✅ Ensure .env has valid OpenAI API key

### Slow first response?
- ✅ First startup builds FAISS index (takes ~30 seconds)
- ✅ Subsequent responses are fast (<2 seconds)
- ✅ Check terminal for "Vector store initialized successfully"

### Getting generic answers?
- ✅ Check knowledge base files in `chatbot_backend/lnm_data/`
- ✅ Ensure files have proper content
- ✅ Restart Python backend to reload data

---

## 📝 Adding More Knowledge

Want to add more campus information?

1. **Edit knowledge base files:**
   ```
   chatbot_backend/lnm_data/academics.txt
   chatbot_backend/lnm_data/events.txt
   chatbot_backend/lnm_data/facilities.txt
   chatbot_backend/lnm_data/contacts.txt
   ```

2. **Or create new files:**
   - Add `.txt` files to `chatbot_backend/lnm_data/`
   - Use clear headings and structured content

3. **Reload knowledge:**
   ```powershell
   # Option 1: Call reload API
   curl -X POST http://localhost:8000/api/reload-knowledge
   
   # Option 2: Restart Python backend
   # Ctrl+C to stop, then python main.py
   ```

---

## 🎯 Success Indicators

When everything is working correctly:

### Python Backend Terminal:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ Vector store initialized successfully
✓ Loaded 12 documents
✓ Created 45 text chunks
```

### Browser (http://localhost:5173):
```
✅ Purple floating chat button visible (bottom-right)
✅ Click opens chatbot modal
✅ Can send messages and get responses
✅ Sources shown below answers
✅ Conversation history maintained
```

### Admin Panel (http://localhost:5173/admin/unanswered):
```
✅ Stats cards show correct counts
✅ Unanswered queries listed
✅ Can provide answers
✅ Can mark as resolved
```

---

## 🚀 What You Just Built

1. **Backend Intelligence:**
   - FastAPI server with RAG pipeline
   - FAISS vector database for semantic search
   - OpenAI GPT-3.5 for answer generation
   - MongoDB for conversation tracking

2. **Frontend Experience:**
   - Beautiful chat UI with animations
   - Admin dashboard for query management
   - Floating button for easy access
   - Source attribution for transparency

3. **Knowledge Management:**
   - 8000+ words of campus information
   - Structured into 4 categories
   - Easily extendable with new content
   - Automatic reindexing on updates

---

## 📚 Full Documentation

For detailed technical documentation, see:
- **CHATBOT_SETUP.md** - Complete setup guide
- **API Documentation** - http://localhost:8000/docs (when running)
- **Knowledge Base** - `chatbot_backend/lnm_data/` directory

---

## 🎉 You're All Set!

Your campus chatbot is ready to help students 24/7 with:
- Academic queries
- Event information
- Facility details
- Contact information
- And any campus-related questions!

**Next Steps:**
1. Test with various questions
2. Monitor unanswered queries in admin panel
3. Add more content to knowledge base as needed
4. Share the admin panel link with moderators

Happy chatting! 🚀
