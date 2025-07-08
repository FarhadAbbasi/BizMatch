import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_SCOPES } from '../config/auth';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'com.bizmatch',
      path: 'auth/google'
    }),
    scopes: GOOGLE_SCOPES,
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success' && result.authentication) {
        const { authentication } = result;
        
        if (!authentication.idToken || !authentication.accessToken) {
          throw new Error('Failed to get authentication tokens');
        }
        
        // Exchange the Google token for a Supabase session
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: authentication.idToken,
          access_token: authentication.accessToken,
        });

        if (error) throw error;
        
        // Fetch additional Google Business Profile data if needed
        if (authentication.accessToken) {
          // TODO: Implement Google Business Profile API calls
          // const businessData = await fetchGoogleBusinessProfile(authentication.accessToken);
        }

        return data;
      }
      throw new Error('Google sign in failed or was cancelled');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    isLoading: !!request,
  };
};

// Helper function to fetch Google Business Profile data (to be implemented)
const fetchGoogleBusinessProfile = async (accessToken: string) => {
  try {
    const response = await fetch(
      'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Business Profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google Business Profile:', error);
    throw error;
  }
}; 