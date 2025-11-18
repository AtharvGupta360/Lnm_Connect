# Stream SDK Voice Channel Setup Guide

## Overview
The voice channel feature has been migrated from custom WebRTC implementation to Stream SDK for better reliability and scalability.

## What Was Changed

### Deleted Files (Old WebRTC Implementation):
**Frontend:**
- `src/components/VoiceChannelModal.jsx`
- `src/components/VoiceChannelInvites.jsx`
- `src/components/CreateVoiceChannelModal.jsx`
- `src/services/webrtcService.js`

**Backend:**
- `controller/VoiceChannelController.java`
- `service/VoiceChannelService.java`
- `repository/VoiceChannelRepository.java`
- `repository/VoiceChannelInviteRepository.java`
- `model/VoiceChannel.java`
- `model/VoiceChannelInvite.java`
- `dto/VoiceChannelDTO.java`
- `dto/VoiceChannelInviteDTO.java`

### New Files (Stream SDK):
- `frontend/src/components/StreamVoiceChannel.jsx` - New voice channel component using Stream SDK

## Setup Instructions

### Step 1: Get Stream API Credentials

1. **Sign up for Stream.io:**
   - Go to https://getstream.io/
   - Click "Start Free Trial"
   - Create an account

2. **Create a Video Application:**
   - In the Stream dashboard, click "Create App"
   - Select "Video & Audio"
   - Give your app a name (e.g., "LNMConnect")
   - Click "Create App"

3. **Get Your API Key:**
   - After creating the app, you'll see your **API Key** in the dashboard
   - Copy this key (looks like: `mmhfdzb5evj2`)

### Step 2: Configure Frontend

Update the file: `frontend/src/components/StreamVoiceChannel.jsx`

Replace these lines (around line 14-15):
```javascript
const API_KEY = 'YOUR_STREAM_API_KEY'; // Replace with your Stream API key
const USER_TOKEN = 'YOUR_USER_TOKEN'; // Replace with user token from backend
```

With your actual API key:
```javascript
const API_KEY = 'mmhfdzb5evj2'; // Your actual Stream API key
const USER_TOKEN = 'YOUR_USER_TOKEN'; // We'll set this up next
```

### Step 3: Set Up Backend Token Generation (Recommended for Production)

For production, you should generate user tokens on your backend:

1. **Add Stream dependency to your Spring Boot backend:**

Add to `backend/pom.xml`:
```xml
<dependency>
    <groupId>io.getstream</groupId>
    <artifactId>stream-java</artifactId>
    <version>1.15.0</version>
</dependency>
```

2. **Create a Token Controller:**

Create `backend/src/main/java/com/miniproject/backend/controller/StreamTokenController.java`:

```java
package com.miniproject.backend.controller;

import io.getstream.core.StreamVideo;
import io.getstream.core.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stream")
@CrossOrigin(origins = "http://localhost:5173")
public class StreamTokenController {

    @Value("${stream.api.key}")
    private String apiKey;

    @Value("${stream.api.secret}")
    private String apiSecret;

    @GetMapping("/token/{userId}")
    public String generateToken(@PathVariable Long userId) {
        try {
            StreamVideo streamVideo = StreamVideo.builder(apiKey, apiSecret).build();
            User user = new User(userId.toString());
            return streamVideo.createToken(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate token", e);
        }
    }
}
```

3. **Add Stream credentials to `backend/src/main/resources/application.properties`:**

```properties
stream.api.key=YOUR_STREAM_API_KEY
stream.api.secret=YOUR_STREAM_API_SECRET
```

4. **Update Frontend to fetch token from backend:**

Update `frontend/src/components/StreamVoiceChannel.jsx`:

Replace the initialization in `initializeStream()` function:

```javascript
const initializeStream = async () => {
  try {
    // Fetch token from backend
    const response = await fetch(`http://localhost:8080/api/stream/token/${currentUserId}`);
    const token = await response.text();

    // Initialize Stream client
    const streamClient = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: currentUserId.toString(),
        name: currentUserName,
      },
      token: token,
    });

    setClient(streamClient);

    // Create or join a call
    const callId = 'lnm-connect-voice';
    const streamCall = streamClient.call('audio_room', callId);
    
    await streamCall.join({ create: true });
    
    setCall(streamCall);
    setIsConnecting(false);
  } catch (error) {
    console.error('Error initializing Stream:', error);
    setIsConnecting(false);
  }
};
```

### Step 4: Development Setup (Quick Start)

For quick testing during development, you can use a development token:

1. Go to Stream Dashboard → Your App → Authentication
2. Generate a development token for a test user
3. Use that token temporarily in the frontend

**⚠️ WARNING:** Never use development tokens in production!

### Step 5: Testing

1. **Start your backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the voice channel:**
   - Click the green phone icon (bottom left)
   - You should see "Connecting to voice channel..."
   - Once connected, you'll see the voice channel UI
   - Open multiple browser tabs/windows to test multi-user voice

## Features

### Current Features:
- ✅ Audio-only voice channels
- ✅ Mute/unmute microphone
- ✅ Deafen/undeafen speakers
- ✅ Real-time participant list
- ✅ Speaking indicators
- ✅ Connection status
- ✅ Drag-and-drop voice button

### Stream SDK Benefits:
- 🚀 No manual WebRTC peer connections
- 🔒 Built-in security and encryption
- 📱 Automatic network recovery
- 🌍 Global edge network
- 📊 Analytics and monitoring
- 🔧 Easy to scale

## Customization

### Change Call Type:
Edit `StreamVoiceChannel.jsx`, line 42:
```javascript
const streamCall = streamClient.call('audio_room', callId);
```

Options:
- `'audio_room'` - Audio only (current)
- `'default'` - Video + audio
- `'livestream'` - Live streaming

### Multiple Channels:
To create separate channels for different groups, make `callId` dynamic:

```javascript
const callId = `lnm-channel-${channelName}`;
```

### Add Video Support:
1. Change call type to `'default'`
2. Import `VideoPreview` from Stream SDK
3. Add camera toggle button
4. Use `ParticipantView` with video enabled

## Troubleshooting

### "Failed to connect"
- Check your API key is correct
- Verify your Stream account is active
- Check browser console for detailed errors

### "Token expired"
- Tokens expire after some time
- Implement token refresh logic
- Get new token from backend

### No audio
- Check browser permissions
- Verify microphone is not muted in OS
- Check Stream dashboard for connection logs

### Participants not showing
- Ensure all users use same `callId`
- Check network connectivity
- Verify Stream SDK version compatibility

## Production Checklist

- [ ] Move API key to environment variables
- [ ] Implement backend token generation
- [ ] Add token refresh logic
- [ ] Set up proper user authentication
- [ ] Configure CORS properly
- [ ] Add error boundaries
- [ ] Implement connection retry logic
- [ ] Add analytics tracking
- [ ] Test on different networks
- [ ] Load test with multiple users

## Cost Considerations

Stream.io pricing (as of 2024):
- **Free Tier:** 10,000 minutes/month
- **Pro:** $99/month for 100,000 minutes
- **Enterprise:** Custom pricing

Monitor usage in Stream dashboard.

## Resources

- Stream Video SDK Docs: https://getstream.io/video/docs/react/
- Stream API Reference: https://getstream.io/video/docs/api/
- React SDK GitHub: https://github.com/GetStream/stream-video-js
- Support: https://getstream.io/support/

## Migration Notes

The old WebRTC implementation required:
- Manual peer connection management
- TURN/STUN server configuration
- ICE candidate handling
- Signaling via WebSocket

Stream SDK handles all of this automatically, providing:
- Managed infrastructure
- Better reliability
- Easier maintenance
- Professional support

## Next Steps

After basic setup:
1. Add channel creation UI for multiple rooms
2. Implement user invitations
3. Add voice channel notifications
4. Create admin controls (mute users, kick, etc.)
5. Add screen sharing support
6. Implement voice channel history/logs
7. Add voice quality settings

## Support

For issues:
1. Check Stream Dashboard logs
2. Review browser console errors
3. Check this documentation
4. Contact Stream support (for Stream-related issues)
5. Create GitHub issue (for LNMConnect-specific issues)
