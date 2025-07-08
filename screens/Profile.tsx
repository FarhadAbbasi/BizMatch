import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { BusinessProfile } from '../stores/useSwipe';

export default function Profile({ navigation }: MainScreenProps<'Profile'>) {
  const { user, signOut } = useSession();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_uid', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold">My Profile</Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text className="text-white">Edit</Text>
          </TouchableOpacity>
        </View>

        {profile ? (
          <View className="space-y-6">
            <View>
              <Text className="text-gray-600 mb-1">Business Name</Text>
              <Text className="text-lg font-semibold">{profile.name}</Text>
            </View>

            <View>
              <Text className="text-gray-600 mb-1">Industry</Text>
              <Text className="text-lg">{profile.industry}</Text>
            </View>

            <View>
              <Text className="text-gray-600 mb-1">Location</Text>
              <Text className="text-lg">{profile.location}</Text>
            </View>

            <View>
              <Text className="text-gray-600 mb-2">Services</Text>
              <View className="flex-row flex-wrap">
                {profile.services.map((service, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  >
                    <Text className="text-blue-800">{service}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-600 mb-2">Tags</Text>
              <View className="flex-row flex-wrap">
                {profile.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  >
                    <Text className="text-blue-800">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {profile.linkedin_url && (
              <View>
                <Text className="text-gray-600 mb-1">LinkedIn</Text>
                <Text className="text-blue-500">{profile.linkedin_url}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="items-center py-8">
            <Text className="text-gray-600 mb-4">No profile found</Text>
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg"
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text className="text-white font-semibold">Create Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg mt-12"
          onPress={signOut}
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 