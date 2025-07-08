import React from 'react';
import { View, Text } from 'react-native';
import { MainScreenProps } from '../navigation/types';

export default function Chat({ route }: MainScreenProps<'Chat'>) {
  const { matchId, businessId } = route.params;

  return (
    <View className="flex-1 bg-white p-4 justify-center items-center">
      <Text className="text-2xl font-bold mb-4">Coming Soon!</Text>
      <Text className="text-gray-600 text-center">
        Chat functionality will be implemented in Phase 2.
      </Text>
      <Text className="text-gray-500 text-sm mt-4">
        Match ID: {matchId}
      </Text>
    </View>
  );
} 