# OAuth Configuration Guide

## Google OAuth Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable APIs:
   - Navigate to "APIs & Services > Library"
   - Search for and enable:
     - Google Sign-In API
     - Google Business Profile API
     - People API

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services > Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: BizMatch
   - Support email: Your email
   - Developer contact information: Your email

4. Create credentials for each platform:

#### Web Platform
1. Application type: Web application
2. Name: BizMatch Web
3. Authorized JavaScript origins:
   - `http://localhost:8084`
   - `https://your-production-domain.com`
4. Authorized redirect URIs:
   - `http://localhost:8084/auth/google`
   - `https://your-production-domain.com/auth/google`

#### iOS Platform
1. Application type: iOS
2. Bundle ID: com.bizmatch
3. App Store ID: (Optional)
4. Team ID: Your Apple Team ID

#### Android Platform
1. Application type: Android
2. Package name: com.bizmatch
2. SHA-1 certificate fingerprint: Your app's SHA-1

### 3. Update Configuration
1. Copy the client IDs to `config/auth.ts`:
```typescript
export const GOOGLE_CLIENT_ID = Platform.select({
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

### 4. Supabase Configuration
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your OAuth credentials:
   - Client ID: Your Web client ID
   - Client Secret: Your client secret
4. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

## LinkedIn OAuth Setup

### 1. LinkedIn Developer Portal Setup
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in app details:
   - App name: BizMatch
   - LinkedIn Page: Your company page
   - App logo: Upload your logo
   - Legal agreement: Accept

### 2. Configure OAuth 2.0 Settings
1. Request the following OAuth 2.0 scopes:
   - r_emailaddress
   - r_liteprofile
   - r_organization_social
   - rw_organization_admin

2. Add OAuth 2.0 redirect URLs:
   - `http://localhost:8084/auth/linkedin`
   - `https://your-production-domain.com/auth/linkedin`
   - `com.bizmatch://auth/linkedin`

3. Generate OAuth 2.0 credentials:
   - Note down Client ID and Client Secret

### 3. Update Configuration
1. Copy the client ID to `config/auth.ts`:
```typescript
export const LINKEDIN_CLIENT_ID = 'YOUR_LINKEDIN_CLIENT_ID';
```

### 4. Supabase Configuration
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable LinkedIn provider
3. Add your OAuth credentials:
   - Client ID: Your LinkedIn client ID
   - Client Secret: Your LinkedIn client secret
4. Add authorized redirect URLs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

## Security Best Practices
1. Never commit OAuth credentials to version control
2. Use environment variables for sensitive data
3. Implement proper PKCE flow for mobile apps
4. Regularly rotate client secrets
5. Monitor OAuth usage for suspicious activity
6. Implement rate limiting for OAuth endpoints
7. Keep OAuth libraries updated

## Testing OAuth Flow
1. Test on all platforms (web, iOS, Android)
2. Verify error handling
3. Test token refresh flow
4. Verify user data retrieval
5. Test sign-out and token revocation
6. Verify redirect handling
7. Test with network issues 