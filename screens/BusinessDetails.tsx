import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { BusinessProfile } from '../stores/useSwipe';

export default function BusinessDetails({ route, navigation }: MainScreenProps<'BusinessDetails'>) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_view_count', { business_id: businessId });

      // Fetch business details
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInPress = async () => {
    if (business?.linkedin_url) {
      try {
        await Linking.openURL(business.linkedin_url);
      } catch (error) {
        console.error('Error opening LinkedIn URL:', error);
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!business) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-xl text-center text-gray-600">
          Business not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">{business.name}</Text>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-600 mb-1">Industry</Text>
            <Text className="text-lg">{business.industry}</Text>
          </View>

          <View>
            <Text className="text-gray-600 mb-1">Location</Text>
            <Text className="text-lg">{business.location}</Text>
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Services</Text>
            <View className="flex-row flex-wrap">
              {business.services.map((service, index) => (
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
              {business.tags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 m-1"
                >
                  <Text className="text-blue-800">{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {business.linkedin_url && (
            <TouchableOpacity
              className="bg-[#0077B5] p-4 rounded-lg"
              onPress={handleLinkedInPress}
            >
              <Text className="text-white text-center font-semibold">
                View on LinkedIn
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
} 