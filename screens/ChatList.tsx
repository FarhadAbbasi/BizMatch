import React from 'react';
import { View, Text } from 'react-native';
import { TabScreenProps } from '../navigation/types';

export default function ChatListScreen({ navigation }: TabScreenProps<'ChatsTab'>) {
  return (
    <View className="flex-1 bg-white p-4 justify-center items-center">
      <Text className="text-2xl font-bold mb-4">Chats</Text>
      <Text className="text-gray-600 text-center">
        Your matches and conversations will appear here.
      </Text>
    </View>
  );
} 
 