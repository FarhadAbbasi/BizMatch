import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { useSession } from '../stores/useSession';
import { View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '../services/supabase';
import CreateProfileScreen from '../screens/auth/CreateProfile';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user } = useSession();
  const [profileStatus, setProfileStatus] = useState<'loading' | 'exists' | 'none'>('loading');

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function checkProfile() {
      if (!user) {
        if (isMounted) setProfileStatus('none');
        return;
      }

      console.log('Checking profile for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('owner_uid', user.id)
          .single();

        // console.log('Profile check result:', { data, error });

        if (isMounted) {
          if (error && error.code === 'PGRST116') {
            console.log('No profile found');
            setProfileStatus('none');
          } else if (error) {
            console.error('Error checking profile:', error);
            setProfileStatus('none');
          } else {
            console.log('Profile exists:', data);
            setProfileStatus(data ? 'exists' : 'none');
          }
        }
      } catch (error) {
        console.error('Exception checking profile:', error);
        if (isMounted) {
          setProfileStatus('none');
        }
      }
    }

    // Check immediately
    checkProfile();

    // Set up periodic checks while on CreateProfile screen
    if (user && profileStatus === 'none') {
      timeoutId = setInterval(checkProfile, 2000);
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearInterval(timeoutId);
    };
  }, [user, profileStatus]);

  // Show loading indicator only during initial profile check
  if (user && profileStatus === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Checking profile...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : profileStatus === 'exists' ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen 
            name="CreateProfile" 
            component={CreateProfileScreen}
            options={{ 
              headerShown: true, 
              title: 'Create Profile',
              // Prevent going back
              headerLeft: () => null,
              gestureEnabled: false 
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 