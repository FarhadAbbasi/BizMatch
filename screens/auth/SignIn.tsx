import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useSession } from '../../stores/useSession';
// OAuth imports temporarily disabled
// import { useGoogleAuth } from '../../services/google';
// import { useLinkedInAuth } from '../../services/linkedin';

export default function SignIn({ navigation }: AuthScreenProps<'SignIn'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setError } = useSession();
  // OAuth hooks temporarily disabled
  // const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  // const { signInWithLinkedIn, isLoading: isLinkedInLoading } = useLinkedInAuth();

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // OAuth handlers temporarily disabled
  /*
  const handleGoogleSignIn = async () => {
    try {
      const data = await signInWithGoogle();
      if (!data) {
        Alert.alert('Error', 'Google sign in failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
      setError(message);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      const data = await signInWithLinkedIn();
      if (!data) {
        Alert.alert('Error', 'LinkedIn sign in failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', message);
      setError(message);
    }
  };
  */

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Image
          source={require('../../assets/logo.png')}
          className="w-32 h-32 self-center mb-8"
          resizeMode="contain"
        />
        
        <Text className="text-3xl font-bold text-center mb-8">
          Welcome to BizMatch
        </Text>

        <TextInput
          className="bg-gray-100 p-4 rounded-lg mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="bg-gray-100 p-4 rounded-lg mb-6"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-4"
          onPress={handleEmailSignIn}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* OAuth buttons temporarily disabled
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">or continue with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity
          className="bg-white border border-gray-300 p-4 rounded-lg mb-4 flex-row justify-center items-center"
          onPress={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          <Text className="text-gray-700 font-semibold ml-2">
            {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#0077B5] p-4 rounded-lg mb-4 flex-row justify-center items-center"
          onPress={handleLinkedInSignIn}
          disabled={isLinkedInLoading}
        >
          <Text className="text-white font-semibold ml-2">
            {isLinkedInLoading ? 'Connecting...' : 'Continue with LinkedIn'}
          </Text>
        </TouchableOpacity>
        */}

        <TouchableOpacity
          className="mt-4"
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text className="text-center text-gray-600">
            Don't have an account?{' '}
            <Text className="text-blue-500 font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-center text-gray-600">
            Forgot your password?{' '}
            <Text className="text-blue-500 font-semibold">Reset it here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 