import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, Linking } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  Extrapolate,
  interpolateColor
} from 'react-native-reanimated';
import { BusinessProfile } from '../stores/useSwipe';
import { Card } from './Card';
import { Badge } from './Badge';
import { Skeleton, SkeletonGroup } from './Skeleton';
import { useColors } from '../theme/ThemeProvider';
import { format } from 'date-fns';

export interface BusinessCardProps {
  business?: BusinessProfile;
  isLoading?: boolean;
  onPress?: () => void;
  swipeProgress?: Animated.SharedValue<number>;
  isTop?: boolean;
}

export function BusinessCard({ 
  business, 
  isLoading, 
  onPress,
  swipeProgress,
  isTop = true
}: BusinessCardProps) {
  const colors = useColors();

  const cardAnimatedStyle = useAnimatedStyle(() => {
    let borderColor = 'transparent';
    let borderWidth = 0;
    
    if (swipeProgress) {
      // Add border color based on swipe direction with lighter colors
      if (swipeProgress.value > 0) {
        borderColor = interpolateColor(
          swipeProgress.value,
          [0, 0.3, 0.8],
          ['transparent', 'rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.7)']
        );
        borderWidth = interpolate(swipeProgress.value, [0, 0.3, 0.8], [0, 2, 3], Extrapolate.CLAMP);
      } else if (swipeProgress.value < 0) {
        borderColor = interpolateColor(
          Math.abs(swipeProgress.value),
          [0, 0.3, 0.8],
          ['transparent', 'rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.7)']
        );
        borderWidth = interpolate(Math.abs(swipeProgress.value), [0, 0.3, 0.8], [0, 2, 3], Extrapolate.CLAMP);
      }
    }

    return {
      borderColor,
      borderWidth
    };
  });

  const handleWebsitePress = () => {
    if (business?.website_url) {
      Linking.openURL(business.website_url);
    }
  };

  const handleLinkedInPress = () => {
    if (business?.linkedin_url) {
      Linking.openURL(business.linkedin_url);
    }
  };

  if (isLoading || !business) {
    return (
      <View className="w-[92%] h-[95%] mx-auto rounded-2xl overflow-hidden bg-white shadow-lg">
        <SkeletonGroup>
          <Skeleton height={200} width="100%" borderRadius={12} />
          <View className="p-4">
            <Skeleton height={32} width="70%" />
            <View className="h-2" />
            <Skeleton height={20} width="40%" />
            <View className="h-4" />
            <Skeleton height={20} width="100%" />
            <View className="h-4" />
            <View className="flex-row gap-2">
              <Skeleton height={24} width={80} borderRadius={12} />
              <Skeleton height={24} width={80} borderRadius={12} />
              <Skeleton height={24} width={80} borderRadius={12} />
            </View>
          </View>
        </SkeletonGroup>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      className="w-[92%] h-[90%] mx-auto rounded-2xl overflow-hidden bg-white shadow-lg"
      onPress={onPress}
      activeOpacity={0.98}
    >
      <Animated.View className="w-full h-full" style={cardAnimatedStyle}>
        {/* Banner Image */}
        <View className="h-1/4 w-full bg-gray-100">
          <Image
            source={{ uri: business.banner_image_url || business.logo_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute -bottom-8 left-4 w-16 h-16 rounded-2xl bg-white p-2 shadow-md">
            <Image
              source={{ uri: business.logo_url }}
              className="w-full h-full rounded-lg"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          {/* Header */}
          <View className="mt-6 mb-3">
            <View className="mb-2">
              <Text className="text-2xl font-bold text-gray-900 mb-1">{business.name}</Text>
              <Text className="text-base text-gray-600">{business.industry}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Badge 
                variant="subtle"
                status="success"
                label={business.funding_stage || 'Established'}
              />
              <View className="flex-row items-center gap-1 bg-gray-100 px-2.5 py-1.5 rounded-xl">
                <Text className="text-sm">👥</Text>
                <Text className="text-sm text-gray-600 font-medium">
                  {business.company_size || 'Growing Team'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {business.description && (
            <View className="mb-3">
              {/* <Text className="text-base text-gray-500 leading-6">{business.description}</Text> */}
              <Text className="text-base text-gray-500 leading-6">
              Financial technology solutions for modern banking and transactions.

              </Text>
            </View>
          )}

          {/* Location */}
          <View className="mb-1.5 bg-[#f5f8f8] p-1 rounded-2xl">
            <Text className="text-sm text-gray-600">📍 {business.headquarters || business.location}</Text>
          </View>

          {/* Founded Date */}
          <View className="mb-1.5 bg-[#f5f8f8] p-1 rounded-2xl">
            {business.founded_date && (
              <Text className="text-sm text-gray-600">
                Since: {format(new Date(business.founded_date), 'MMM yyyy')}
              </Text>
            )}
          </View>

          {/* Looking For */}
          {business.looking_for?.length > 0 && (
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Looking For
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {business.looking_for.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    status="warning"
                    label={item}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Services */}
          {business.services?.length > 0 && (
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Services
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {business.services.map((service, index) => (
                  <Badge
                    key={index}
                    variant="subtle"
                    status="success"
                    label={service}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Tech Stack */}
          {business.tech_stack?.length > 0 && (
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Tech Stack
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {business.tech_stack.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="subtle"
                    status="info"
                    label={tech}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <View className="mt-3 pt-3 border-t border-gray-200">
            {/* External Links */}
            <View className="flex-row gap-3 mb-3">
              {business.website_url && (
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-[#4438ff]"
                  onPress={handleWebsitePress}
                >
                  <Text className="text-sm font-semibold text-white">Website</Text>
                </TouchableOpacity>
              )}
              {business.linkedin_url && (
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-[#0077B5]"
                  onPress={handleLinkedInPress}
                >
                  <Text className="text-sm font-semibold text-white">LinkedIn</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
} 