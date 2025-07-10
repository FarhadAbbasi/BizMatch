import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { TabScreenProps } from '../navigation/types';
import { useSwipe } from '../stores/useSwipe';

export default function FiltersScreen({ navigation }: TabScreenProps<'FiltersTab'>) {
  const { filters, setFilters, fetchBusinesses } = useSwipe();
  const [newIndustry, setNewIndustry] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newService, setNewService] = useState('');
  const [newTag, setNewTag] = useState('');

  const addIndustry = () => {
    if (newIndustry && !filters.industries.includes(newIndustry)) {
      setFilters({
        ...filters,
        industries: [...filters.industries, newIndustry],
      });
      setNewIndustry('');
    }
  };

  const removeIndustry = (industry: string) => {
    setFilters({
      ...filters,
      industries: filters.industries.filter(i => i !== industry),
    });
  };

  const addLocation = () => {
    if (newLocation && !filters.locations.includes(newLocation)) {
      setFilters({
        ...filters,
        locations: [...filters.locations, newLocation],
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setFilters({
      ...filters,
      locations: filters.locations.filter(l => l !== location),
    });
  };

  const addService = () => {
    if (newService && !filters.services.includes(newService)) {
      setFilters({
        ...filters,
        services: [...filters.services, newService],
      });
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setFilters({
      ...filters,
      services: filters.services.filter(s => s !== service),
    });
  };

  const addTag = () => {
    if (newTag && !filters.tags.includes(newTag)) {
      setFilters({
        ...filters,
        tags: [...filters.tags, newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.filter(t => t !== tag),
    });
  };

  const handleApplyFilters = async () => {
    await fetchBusinesses();
    navigation.goBack();
  };

  const handleClearFilters = () => {
    setFilters({
      industries: [],
      locations: [],
      services: [],
      tags: [],
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-8">Search Filters</Text>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-600 mb-2">Industries</Text>
            <View className="flex-row mb-2">
              <TextInput
                className="flex-1 bg-gray-100 p-4 rounded-lg mr-2"
                value={newIndustry}
                onChangeText={setNewIndustry}
                placeholder="Add an industry"
              />
              <TouchableOpacity
                className="bg-blue-500 px-4 rounded-lg justify-center"
                onPress={addIndustry}
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {filters.industries.map((industry, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  onPress={() => removeIndustry(industry)}
                >
                  <Text className="text-blue-800">{industry} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Locations</Text>
            <View className="flex-row mb-2">
              <TextInput
                className="flex-1 bg-gray-100 p-4 rounded-lg mr-2"
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="Add a location"
              />
              <TouchableOpacity
                className="bg-blue-500 px-4 rounded-lg justify-center"
                onPress={addLocation}
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {filters.locations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-blue-100 rounded-full px-3 py-1 m-1"
                  onPress={() => removeLocation(location)}
                >
                  <Text className="text-blue-800">{location} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
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
              {filters.services.map((service, index) => (
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
              {filters.tags.map((tag, index) => (
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

          <View className="flex-row space-x-4 mt-8">
            <TouchableOpacity
              className="flex-1 bg-gray-500 p-4 rounded-lg"
              onPress={handleClearFilters}
            >
              <Text className="text-white text-center font-semibold">
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-blue-500 p-4 rounded-lg"
              onPress={handleApplyFilters}
            >
              <Text className="text-white text-center font-semibold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 