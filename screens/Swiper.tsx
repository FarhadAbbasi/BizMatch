import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { MainScreenProps } from '../navigation/types';
import { useSwipe } from '../stores/useSwipe';
import { useSession } from '../stores/useSession';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

export default function SwiperScreen({ navigation }: MainScreenProps<'Swiper'>) {
  const swiperRef = useRef<Swiper<any>>(null);
  const {
    businesses,
    currentIndex,
    isLoading,
    error,
    setCurrentIndex,
    fetchBusinesses,
    createSwipe,
  } = useSwipe();
  const { user } = useSession();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right', businessId: string) => {
    const { match, matchBusiness } = await createSwipe(businessId, direction);
    
    if (match && matchBusiness) {
      // Navigate to chat or show match modal
      navigation.navigate('Chat', {
        matchId: `${user?.id}-${businessId}`,
        businessId: matchBusiness.id,
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={fetchBusinesses}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!businesses.length) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-xl text-center mb-4">
          No more businesses to show.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={fetchBusinesses}
        >
          <Text className="text-white">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded-full"
          onPress={() => navigation.navigate('Profile')}
        >
          <Text className="text-lg">👤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded-full"
          onPress={() => navigation.navigate('Filters')}
        >
          <Text className="text-lg">🔍</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Swiper
          ref={swiperRef}
          cards={businesses}
          renderCard={(business) => (
            <TouchableOpacity
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              style={{ width: CARD_WIDTH }}
              onPress={() => navigation.navigate('BusinessDetails', { businessId: business.id })}
            >
              <View className="p-4">
                <Text className="text-2xl font-bold mb-2">{business.name}</Text>
                <Text className="text-gray-600 mb-4">{business.industry}</Text>
                
                <Text className="text-gray-600 mb-2">Services:</Text>
                <View className="flex-row flex-wrap mb-4">
                  {business.services.slice(0, 3).map((service, index) => (
                    <View
                      key={index}
                      className="bg-blue-100 rounded-full px-3 py-1 m-1"
                    >
                      <Text className="text-blue-800">{service}</Text>
                    </View>
                  ))}
                  {business.services.length > 3 && (
                    <Text className="text-gray-500 ml-2">+{business.services.length - 3} more</Text>
                  )}
                </View>

                <Text className="text-gray-600">{business.location}</Text>
              </View>
            </TouchableOpacity>
          )}
          onSwiped={(cardIndex) => {
            setCurrentIndex(cardIndex + 1);
          }}
          onSwipedLeft={(cardIndex) => {
            handleSwipe('left', businesses[cardIndex].id);
          }}
          onSwipedRight={(cardIndex) => {
            handleSwipe('right', businesses[cardIndex].id);
          }}
          cardIndex={currentIndex}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          cardVerticalMargin={20}
          cardHorizontalMargin={10}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: 'red',
                  color: 'white',
                  fontSize: 24,
                  borderRadius: 4,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  fontSize: 24,
                  borderRadius: 4,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>

      <View className="flex-row justify-around items-center p-4">
        <TouchableOpacity
          className="bg-red-100 w-16 h-16 rounded-full items-center justify-center"
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text className="text-2xl">👎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-100 w-16 h-16 rounded-full items-center justify-center"
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text className="text-2xl">👍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 