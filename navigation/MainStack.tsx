import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Import screens (we'll create these next)
import Swiper from '../screens/Swiper';
import BusinessDetails from '../screens/BusinessDetails';
import Filters from '../screens/Filters';
import Chat from '../screens/Chat';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Swiper" 
        component={Swiper}
        options={{ title: 'BizMatch' }}
      />
      <Stack.Screen 
        name="BusinessDetails" 
        component={BusinessDetails}
        options={{ title: 'Business Details' }}
      />
      <Stack.Screen 
        name="Filters" 
        component={Filters}
        options={{ title: 'Search Filters' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={Chat}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={Profile}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
} 