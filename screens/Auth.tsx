import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { useColors } from '../theme/ThemeProvider';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

export default function AuthScreen({ navigation }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });

  const handleAuth = async () => {
    if (loading) return;

    // Validation
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              company_name: formData.companyName,
            },
          },
        });
        if (error) throw error;
        Alert.alert(
          'Success',
          'Please check your email for verification instructions'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="py-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </Text>
          <Text className="text-base text-gray-600">
            {isLogin
              ? 'Sign in to continue matching with businesses'
              : 'Start finding your perfect business matches'}
          </Text>
        </View>

        <Animated.View
          key={isLogin ? 'login' : 'signup'}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="space-y-4"
        >
          {!isLogin && (
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Company Name
              </Text>
              <TextInput
                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChangeText={(text) =>
                  setFormData({ ...formData, companyName: text })
                }
                autoCapitalize="words"
              />
            </View>
          )}

          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Email Address
            </Text>
            <TextInput
              className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) =>
                setFormData({ ...formData, email: text })
              }
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">Password</Text>
            <TextInput
              className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Confirm Password
              </Text>
              <TextInput
                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                secureTextEntry
              />
            </View>
          )}

          {isLogin && (
            <TouchableOpacity className="self-end">
              <Text className="text-sm text-primary-500 font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="w-full h-12 bg-primary-500 rounded-xl items-center justify-center mt-4"
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={toggleAuthMode}>
            <Text className="text-primary-500 font-medium">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 
 
 