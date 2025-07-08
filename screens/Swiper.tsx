import { View, Text, TouchableOpacity } from 'react-native';
import { useSession } from '../stores/useSession';

export default function SwiperScreen() {
  const { signOut } = useSession();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-6">Swiper Screen</Text>
      <TouchableOpacity
        className="bg-red-500 rounded px-4 py-2"
        onPress={signOut}
      >
        <Text className="text-white">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
} 