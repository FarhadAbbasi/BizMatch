// screens/Home.tsx
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../services/supabase';

export default function Home() {
  // const testSupabase = async () => {
  //   try {
  //     // First try to fetch existing drivers
  //     const { data: fetchData, error: fetchError } = await supabase
  //       .from('drivers')
  //       .select('name, status')
  //       .limit(5);

  //     if (fetchError) {
  //       Alert.alert('Fetch Error', fetchError.message);
  //       console.error('Fetch error:', fetchError);
  //       return;
  //     }

  //     console.log('Fetched drivers:', fetchData);

  //   } catch (error) {
  //     Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
  //     console.error('Supabase error:', error);
  //   }
  // };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">Welcome to BizMatch</Text>
      <TouchableOpacity 
        className="mt-4 bg-blue-500 px-4 py-2 rounded"
        // onPress={testSupabase}
      >
        <Text className="text-white">Get Started </Text>
      </TouchableOpacity>
    </View>
  );
}
