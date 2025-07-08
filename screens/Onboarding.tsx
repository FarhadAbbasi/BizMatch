import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { RootScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';

interface OnboardingForm {
  name: string;
  industry: string;
  location: string;
  services: string[];
  tags: string[];
  linkedin_url: string;
  logo_url: string;
}

export default function Onboarding({ navigation }: RootScreenProps<'Onboarding'>) {
  const { user, setOnboardingComplete, setError } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    name: '',
    industry: '',
    location: '',
    services: [],
    tags: [],
    linkedin_url: '',
    logo_url: '',
  });
  const [newService, setNewService] = useState('');
  const [newTag, setNewTag] = useState('');

  const addService = () => {
    if (newService && !form.services.includes(newService)) {
      setForm(prev => ({
        ...prev,
        services: [...prev.services, newService],
      }));
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service),
    }));
  };

  const addTag = () => {
    if (newTag && !form.tags.includes(newTag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.industry || !form.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('business_profiles')
        .insert({
          owner_uid: user?.id,
          ...form,
        });

      if (error) throw error;

      setOnboardingComplete(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-8">Create Your Business Profile</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-2">Business Name *</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              value={form.name}
              onChangeText={name => setForm(prev => ({ ...prev, name }))}
              placeholder="Enter your business name"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Industry *</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              value={form.industry}
              onChangeText={industry => setForm(prev => ({ ...prev, industry }))}
              placeholder="e.g., Technology, Manufacturing, etc."
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Location *</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              value={form.location}
              onChangeText={location => setForm(prev => ({ ...prev, location }))}
              placeholder="City, Country"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Services</Text>
            <View className="flex-row mb-2">
              <TextInput
                className="flex-1 bg-gray-100 p-4 rounded-lg mr-2"
                value={newService}
                onChangeText={setNewService}
                placeholder="Add a service"
              />
              <TouchableOpacity
                className="bg-blue-500 px-4 rounded-lg justify-center"
                onPress={addService}
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {form.services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  onPress={() => removeService(service)}
                >
                  <Text className="text-blue-800">{service} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Tags</Text>
            <View className="flex-row mb-2">
              <TextInput
                className="flex-1 bg-gray-100 p-4 rounded-lg mr-2"
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag"
              />
              <TouchableOpacity
                className="bg-blue-500 px-4 rounded-lg justify-center"
                onPress={addTag}
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {form.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  onPress={() => removeTag(tag)}
                >
                  <Text className="text-blue-800">{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2">LinkedIn URL</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-lg"
              value={form.linkedin_url}
              onChangeText={linkedin_url => setForm(prev => ({ ...prev, linkedin_url }))}
              placeholder="https://linkedin.com/company/..."
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg mt-8"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold">
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 