import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import Onboarding from '../screens/Onboarding';
import { useSession } from '../stores/useSession';
import { supabase } from '../services/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, hasCompletedOnboarding, setUser, setLoading, isLoading } = useSession();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  if (isLoading) {
    // You can return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={Onboarding} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 