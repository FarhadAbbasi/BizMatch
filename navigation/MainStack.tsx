import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList, MainTabParamList } from './types';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import Swiper from '../screens/Swiper';
import BusinessDetails from '../screens/BusinessDetails';
import Filters from '../screens/Filters';
import Chat from '../screens/Chat';
import ChatList from '../screens/ChatList';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import { useColors } from '../theme/ThemeProvider';

// Import icons
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function TabNavigator() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + (Platform.OS === 'ios' ? insets.bottom : 16),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
            backgroundColor: 'white',
            marginBottom: Platform.OS === 'ios' ? 0 : 16,
          }
        ],
        tabBarActiveTintColor: colors.primary[700],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarShowLabel: true,
        tabBarLabelStyle: [
          styles.tabLabel,
          { color: colors.neutral[700] }
        ],
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="SwiperTab"
        component={Swiper}
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FiltersTab"
        component={Filters}
        options={{
          title: 'Filters',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatList}
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          title: 'Profile',
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetails} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
}); 