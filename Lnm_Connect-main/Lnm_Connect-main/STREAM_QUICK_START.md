# Stream Voice Channel - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Get Stream API Key (2 minutes)

1. Go to **https://getstream.io/**
2. Click **"Start Free Trial"**
3. Create account (use Google/GitHub for quick signup)
4. Create a new **Video & Audio** app
5. **Copy your API Key** from the dashboard

### 2. Configure the App (1 minute)

Open: `frontend/src/components/StreamVoiceChannel.jsx`

**Line 14-15:** Replace with your API key:
```javascript
const API_KEY = 'YOUR_KEY_HERE'; // Paste your Stream API key
```

### 3. Get Development Token (1 minute)

For quick testing:
1. In Stream Dashboard → **Authentication** tab
2. Click **"Generate Development Token"**
3. **Copy the token**
4. **Paste it** in `StreamVoiceChannel.jsx` line 15:
```javascript
const USER_TOKEN = 'YOUR_TOKEN_HERE'; // Paste your dev token
```

⚠️ **Development tokens are for testing only!** See full guide for production setup.

### 4. Test It! (1 minute)

```bash
# Terminal 1 - Start backend
cd backend
mvn spring-boot:run

# Terminal 2 - Start frontend  
cd frontend
npm run dev
```

1. Open **http://localhost:5173**
2. Click the **green phone button** (bottom left)
3. You should see the voice channel connect!
4. Open another browser tab to test multi-user

## ✅ That's It!

You now have a working voice channel powered by Stream SDK.

## 🎯 What Works Now

- ✅ Audio voice chat
- ✅ Mute/unmute
- ✅ Speaker controls
- ✅ Real-time participants
- ✅ Speaking indicators
- ✅ Connection status

## 📚 Next Steps

For production setup with proper authentication:
→ Read **STREAM_VOICE_SETUP.md**

## 🐛 Quick Troubleshooting

**"Failed to connect"**
- Check API key is correct
- Verify token is valid
- Check browser console

**No audio**
- Allow microphone permission
- Check system audio settings

**Can't hear others**
- Check speaker/volume
- Try deafen/undeafen button

## 💰 Free Tier

Stream free tier includes:
- 10,000 minutes/month
- Perfect for testing & small projects

## 🆘 Need Help?

1. Check **STREAM_VOICE_SETUP.md** for detailed guide
2. Check Stream Dashboard logs
3. Review browser console errors
4. Contact: support@getstream.io
