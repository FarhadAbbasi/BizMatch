import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from './types';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import SwiperScreen from '../screens/Swiper';
import BusinessDetailsScreen from '../screens/BusinessDetails';
import ChatScreen from '../screens/Chat';
import ChatListScreen from '../screens/ChatList';
import FiltersScreen from '../screens/Filters';
import ProfileScreen from '../screens/Profile';
import EditProfileScreen from '../screens/EditProfile';
import { useColors } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 12,
            backgroundColor: 'white',
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 5,
            marginBottom: Platform.select({
              android: insets.bottom > 0 ? 0 : 16,
              ios: 0
            }),
            paddingHorizontal: 16
          }
        ],
        tabBarActiveTintColor: colors.primary[800],
        tabBarInactiveTintColor: colors.neutral[300],
        tabBarShowLabel: true,
        tabBarLabelStyle: [
          styles.tabLabel,
          Platform.OS === 'android' && { marginBottom: 4 }
        ],
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="SwiperTab"
        component={SwiperScreen}
        options={{ 
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="grid" size={size} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="FiltersTab"
        component={FiltersScreen}
        options={{ 
          title: 'Filters',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="options" size={size} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatListScreen}
        options={{ 
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={size} color={color} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={size} color={color} />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
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
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
}); 
