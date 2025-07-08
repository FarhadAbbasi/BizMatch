import { Platform } from 'react-native';

// Google OAuth
export const GOOGLE_CLIENT_ID = Platform.select({
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export const GOOGLE_REDIRECT_URI = Platform.select({
  web: 'http://localhost:8084',  // Update this with your production URL for web
  default: 'com.bizmatch://'     // Update this with your app's scheme
});

// LinkedIn OAuth
export const LINKEDIN_CLIENT_ID = 'YOUR_LINKEDIN_CLIENT_ID';
export const LINKEDIN_REDIRECT_URI = Platform.select({
  web: 'http://localhost:8084/auth/linkedin',  // Update this with your production URL for web
  default: 'com.bizmatch://auth/linkedin'      // Update this with your app's scheme
});

// Scopes
export const GOOGLE_SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/business.manage'
];

export const LINKEDIN_SCOPES = [
  'r_emailaddress',
  'r_liteprofile',
  'r_organization_social',
  'rw_organization_admin'
]; 