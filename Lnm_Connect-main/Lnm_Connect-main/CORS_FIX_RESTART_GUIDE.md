# 🔧 CORS Error Fix - Backend Restart Required

## 🐛 The Error
```
Access to fetch at 'http://localhost:8080/api/auth/login' from origin 
'http://localhost:5174' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' 
that is not equal to the supplied origin.
```

## 🔍 Root Cause
Your frontend is running on **port 5174**, but the backend's CORS configuration was cached from when it allowed only **port 5173**.

## ✅ Current CORS Configuration

All controllers are already correctly configured with:

```java
@CrossOrigin(origins = "*")
```

And `SecurityConfig.java` has:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(List.of("*"));  // ✅ Allows all origins
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 🚀 Solution: Restart Backend Server

### Step 1: Stop Current Backend
1. Go to the terminal running the backend
2. Press **Ctrl + C** to stop the server
3. Or use Task Manager to kill the Java process

### Step 2: Restart Backend
Open a terminal in the backend directory and run:

```powershell
cd backend
mvn clean install
mvn spring-boot:run
```

Or if you prefer a single command:
```powershell
cd backend; mvn spring-boot:run
```

### Step 3: Wait for Startup
Wait for this message in the console:
```
Started BackendApplication in X.XXX seconds
```

### Step 4: Verify CORS is Working
Check the console logs for:
```
Tomcat started on port(s): 8080 (http)
```

## 🧪 Test the Fix

### Method 1: Browser Console
1. Open your frontend: `http://localhost:5174`
2. Open browser DevTools (F12)
3. Try to log in
4. Check the Network tab
5. **Expected**: ✅ No CORS errors

### Method 2: Direct API Test
Open a new terminal and test:

```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password"}'
```

**Expected Response**: JSON data (not CORS error)

## 📋 Controllers with CORS Enabled

All these controllers have `@CrossOrigin(origins = "*")`:

| Controller | Status |
|------------|--------|
| AuthController.java | ✅ Configured |
| PostController.java | ✅ Configured |
| ProfileController.java | ✅ Configured |
| CertificateController.java | ✅ Configured |
| ChatController.java | ✅ Configured |
| ClubController.java | ✅ Configured |
| ItemController.java | ✅ Configured |
| ApplicationController.java | ✅ Configured |
| SearchController.java | ✅ Configured |

## 🔧 Alternative: Quick Fix (Temporary)

If you can't restart the backend right now, you can:

### Option 1: Change Frontend Port Back to 5173
```powershell
# Stop frontend (Ctrl + C)
# Then restart on port 5173:
cd frontend
npm run dev -- --port 5173
```

### Option 2: Kill Port 5173 Process
```powershell
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Restart frontend
cd frontend
npm run dev
```

## 🎯 Why This Happens

### Spring Boot CORS Caching
Spring Boot caches CORS configuration on startup:
1. Backend starts with CORS config
2. Config is loaded into memory
3. Changes to code don't take effect until restart
4. **Solution**: Always restart after CORS changes

### Vite Port Auto-Increment
Vite (your frontend) auto-increments ports:
- If port 5173 is busy → tries 5174
- If port 5174 is busy → tries 5175
- And so on...

## 🛠️ Permanent Solution

The current configuration with `origins = "*"` is already the permanent solution. It allows:
- ✅ localhost:5173
- ✅ localhost:5174
- ✅ localhost:5175
- ✅ Any port
- ✅ Any domain (for development)

**Just restart the backend** and it will work for any frontend port!

## 📝 Quick Reference Commands

### Stop Backend
```powershell
# In backend terminal: Ctrl + C
# Or kill process:
taskkill /F /IM java.exe
```

### Start Backend
```powershell
cd backend
mvn spring-boot:run
```

### Check Backend Running
```powershell
curl http://localhost:8080/actuator/health
# Or open in browser: http://localhost:8080
```

### Stop Frontend
```powershell
# In frontend terminal: Ctrl + C
```

### Start Frontend
```powershell
cd frontend
npm run dev
```

## ✅ Success Checklist

After restarting the backend, verify:
- [ ] Backend console shows "Started BackendApplication"
- [ ] No CORS errors in browser console
- [ ] Login works without errors
- [ ] API calls succeed
- [ ] Frontend can fetch data

## 🎉 Expected Result

After restart:
```
✅ Backend: Running on port 8080
✅ Frontend: Running on port 5174 (or any port)
✅ CORS: Allowing all origins
✅ API Calls: Working perfectly
✅ Login: Successful
✅ No Errors: Clean console
```

## 🆘 If Still Not Working

### 1. Check Backend Logs
Look for CORS-related errors:
```
grep -i "cors" backend.log
```

### 2. Clear Browser Cache
```
Ctrl + Shift + Delete → Clear cache
Or use Incognito mode
```

### 3. Check Firewall
```
# Windows Firewall might block port 8080
# Allow Java through firewall
```

### 4. Verify Configuration
```java
// In SecurityConfig.java - should have:
configuration.setAllowedOriginPatterns(List.of("*"));
```

### 5. Check Backend Port
```powershell
netstat -ano | findstr :8080
# Should show LISTENING
```

## 📚 Additional Resources

- [Spring Boot CORS Documentation](https://spring.io/guides/gs/rest-service-cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vite Port Configuration](https://vitejs.dev/config/server-options.html#server-port)

---

## 🎯 TL;DR - Quick Fix

```powershell
# 1. Stop backend (Ctrl + C in backend terminal)
# 2. Restart backend
cd backend
mvn spring-boot:run

# 3. Wait for startup message
# 4. Refresh frontend
# 5. Try login again
# 6. ✅ CORS error should be gone!
```

**That's it!** Your CORS is already configured correctly - just needs a restart! 🚀
