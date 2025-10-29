# Troubleshooting "Failed to fetch" Error

## Problem
You're seeing this error: `TypeError: Failed to fetch at Object.listFillials`

## Root Cause
The application is trying to connect to the API at `https://api.premiumnasiya.uz/api/v1`, but the request is failing. This can happen due to:

1. **CORS (Cross-Origin Resource Sharing) Issue** - The backend server doesn't allow requests from `http://localhost:3000`
2. **Backend Server is Down** - The API is not responding
3. **Network Issues** - Cannot reach the external API
4. **Authentication Required** - Missing or invalid authentication token

## Solutions

### Option 1: Fix CORS on Backend (Recommended for Production)
Add CORS configuration to your NestJS backend to allow localhost during development:

```typescript
// In your main.ts or app configuration
app.enableCors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true,
});
```

### Option 2: Use a Proxy (Quick Development Fix)
Add a proxy configuration to `package.json`:

```json
{
  "proxy": "https://api.premiumnasiya.uz",
  ...
}
```

Then update `.env.local`:
```bash
REACT_APP_API_BASE=/api/v1
```

### Option 3: Use Mock API for Development
Update `.env.local`:
```bash
REACT_APP_USE_MOCK_API=true
```

This will use the mock data in `src/lib/mockApi.ts` instead of the real API.

### Option 4: Run Backend Locally
If you have access to the backend code:
1. Clone and run the backend locally
2. Update `.env.local`:
```bash
REACT_APP_API_BASE=http://localhost:3333/api/v1
```

## What I've Fixed

1. ✅ **Added error handling** in navbar search to prevent crashes when API is unavailable
2. ✅ **Added console logging** to help debug API connection issues
3. ✅ **Created `.env.local`** for local development configuration
4. ✅ **Improved error messages** in the API calls

## Testing the Fix

1. Save all files
2. Restart the development server:
   ```bash
   npm start
   ```
3. Open the browser console (F12) to see the API configuration and any error details
4. The app should no longer crash, but search may return empty results if API is unreachable

## Next Steps

1. **Check browser console** - Look for the "API Configuration" log to see what URL it's using
2. **Verify backend is running** - Try accessing `https://api.premiumnasiya.uz/api/v1/fillial/all` in your browser
3. **Check authentication** - Make sure you're logged in and have a valid token
4. **Contact backend team** - Ask them to enable CORS for localhost development

## Development vs Production

- **Development**: Use `.env.local` for local settings (not committed to git)
- **Production**: Use `.env` or environment variables in your deployment platform

The `.env.local` file will override `.env` during development.
