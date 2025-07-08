import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useSession } from '../../stores/useSession';

export default function ForgotPassword({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { setError } = useSession();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'bizmatch://reset-password',
      });
      if (error) throw error;

      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8">
          Reset Password
        </Text>

        <Text className="text-gray-600 text-center mb-8">
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <TextInput
          className="bg-gray-100 p-4 rounded-lg mb-6"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-4"
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text className="text-center text-gray-600">
            Remember your password?{' '}
            <Text className="text-blue-500 font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 