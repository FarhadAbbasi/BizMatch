import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from './types';
import { StyleSheet, Platform, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import SwiperScreen from '../screens/Swiper';
import BusinessDetailsScreen from '../screens/BusinessDetails';
import ChatScreen from '../screens/Chat';
import ConnectionsScreen from '../screens/Connections';
import FiltersScreen from '../screens/Filters';
import ProfileScreen from '../screens/Profile';
import EditProfileScreen from '../screens/EditProfile';
import { useColors } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const window = Dimensions.get('window');
  const isSmallDevice = window.height < 700;

  const tabBarHeight = Platform.OS === 'ios' ? 88 : 64;
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: tabBarHeight + bottomInset,
          paddingBottom: Platform.OS === 'ios' ? 30 + bottomInset : 12 + bottomInset,
          paddingTop: 12,
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[400],
      }}
    >
      <Tab.Screen
        name="SwiperTab"
        component={SwiperScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsTab"
        component={ConnectionsScreen}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FiltersTab"
        component={FiltersScreen}
        options={{
          tabBarLabel: 'Filters',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinessDetails"
        component={BusinessDetailsScreen}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: 'Edit Profile',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
}); 
