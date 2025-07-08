import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI, LINKEDIN_SCOPES } from '../config/auth';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// LinkedIn OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  revocationEndpoint: 'https://www.linkedin.com/oauth/v2/revoke',
};

export const useLinkedInAuth = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: LINKEDIN_CLIENT_ID,
      scopes: LINKEDIN_SCOPES,
      redirectUri: makeRedirectUri({
        scheme: 'com.bizmatch',
        path: 'auth/linkedin'
      }),
      responseType: 'code',
      extraParams: {
        state: Math.random().toString(36).substring(7),
      },
    },
    discovery
  );

  const signInWithLinkedIn = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success' && result.params?.code) {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: result.params.code,
            redirect_uri: makeRedirectUri({
              scheme: 'com.bizmatch',
              path: 'auth/linkedin'
            }),
            client_id: LINKEDIN_CLIENT_ID,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get LinkedIn access token');
        }

        const tokenData = await tokenResponse.json();
        
        // Fetch LinkedIn profile data
        const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch LinkedIn profile');
        }

        const profileData = await profileResponse.json();

        // Fetch company data if user has organization access
        const companyResponse = await fetch('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        let companyData = null;
        if (companyResponse.ok) {
          companyData = await companyResponse.json();
        }

        // Sign in to Supabase with LinkedIn credentials
        const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'linkedin',
          token: tokenData.id_token,
          access_token: tokenData.access_token,
        });

        if (authError) throw authError;

        return {
          auth: authData,
          profile: profileData,
          company: companyData,
        };
      }
      
      throw new Error('LinkedIn sign in failed or was cancelled');
    } catch (error) {
      console.error('LinkedIn sign in error:', error);
      throw error;
    }
  };

  return {
    signInWithLinkedIn,
    isLoading: !!request,
  };
}; 