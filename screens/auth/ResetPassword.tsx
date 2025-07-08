import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useSession } from '../../stores/useSession';

export default function ResetPassword({ navigation }: AuthScreenProps<'ResetPassword'>) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setError } = useSession();

  const handlePasswordReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SignIn'),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8">
          Create New Password
        </Text>

        <Text className="text-gray-600 text-center mb-8">
          Enter your new password below.
        </Text>

        <TextInput
          className="bg-gray-100 p-4 rounded-lg mb-4"
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="bg-gray-100 p-4 rounded-lg mb-6"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg"
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 