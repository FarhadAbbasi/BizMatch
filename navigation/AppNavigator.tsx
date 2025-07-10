import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './types';
import OnboardingScreen from '../screens/Onboarding';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ session }: { session: Session | null }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Group>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Auth" component={AuthStack} />
            </Stack.Group>
          ) : (
            <Stack.Screen name="Main" component={MainStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
} 