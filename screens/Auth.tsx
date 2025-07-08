import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useSession } from '../stores/useSession';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function AuthScreen() {
  const { session, loading, init, signInWithProvider } = useSession();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);

  useEffect(() => {
    if (session) {
      navigation.replace('Main');
    }
  }, [session]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-6">Sign in</Text>
      <TouchableOpacity
        className="bg-blue-500 rounded px-4 py-2 mb-4"
        onPress={() => signInWithProvider('google')}
      >
        <Text className="text-white">Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-[#0a66c2] rounded px-4 py-2"
        onPress={() => signInWithProvider('linkedin')}
      >
        <Text className="text-white">Continue with LinkedIn</Text>
      </TouchableOpacity>
    </View>
  );
} 