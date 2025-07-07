// screens/Home.tsx
import { View, Text, TouchableOpacity } from 'react-native';


export default function Home() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">Welcome to BizMatch</Text>
      <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded">
        <Text className="text-white">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
