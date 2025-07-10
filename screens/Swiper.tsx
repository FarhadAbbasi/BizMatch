import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-deck-swiper';
import { TabScreenProps } from '../navigation/types';
import { useSwipe } from '../stores/useSwipe';
import { useSession } from '../stores/useSession';
import { BusinessCard } from '../components';
import { useColors } from '../theme/ThemeProvider';
import Animated, { 
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const VERTICAL_PADDING = 12;

export default function SwiperScreen({ navigation }: TabScreenProps<'SwiperTab'>) {
  const swiperRef = useRef<Swiper<any>>(null);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const swipeProgress = useSharedValue(0);
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
      navigation.navigate('Chat', {
        matchId: `${user?.id}-${businessId}`,
        businessId: matchBusiness.id,
      });
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: insets.top + 16,
    paddingBottom: Platform.OS === 'ios' ? insets.bottom + 60 : 76
  };

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <BusinessCard isLoading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={containerStyle}>
        <Text className="text-base text-center text-neutral-600 mb-4">
          {error}
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-lg bg-primary-500 self-center"
          onPress={fetchBusinesses}
        >
          <Text className="text-white text-base font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!businesses.length) {
    return (
      <View style={containerStyle}>
        <Text className="text-base text-center text-neutral-600 mb-4">
          No more businesses to show.
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-lg bg-primary-500 self-center"
          onPress={fetchBusinesses}
        >
          <Text className="text-white text-base font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View className="flex-1 -mt-3">
        <Swiper
          ref={swiperRef}
          cards={businesses}
          renderCard={(business, cardIndex) => (
            <BusinessCard
              business={business}
              onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
              swipeProgress={swipeProgress}
              isTop={cardIndex === currentIndex}
            />
          )}
          onSwiped={(cardIndex) => {
            setCurrentIndex(cardIndex + 1);
            swipeProgress.value = 0;
          }}
          onSwipedLeft={(cardIndex) => {
            handleSwipe('left', businesses[cardIndex].id);
          }}
          onSwipedRight={(cardIndex) => {
            handleSwipe('right', businesses[cardIndex].id);
          }}
          onSwiping={(x) => {
            swipeProgress.value = x / 200;
          }}
          cardIndex={currentIndex}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={12}
          cardVerticalMargin={VERTICAL_PADDING}
          cardHorizontalMargin={0}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          verticalSwipe={false}
          containerStyle={{ flex: 1 }}
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: colors.accent.error,
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
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
                  backgroundColor: colors.accent.success,
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
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
    </View>
  );
} 