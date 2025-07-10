import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '../theme/ThemeProvider';
import type { RootScreenProps } from '../navigation/types';

const AnimatedScrollView = Animated.createAnimatedComponent(Animated.ScrollView);

const ONBOARDING_DATA = [
  {
    title: 'Find Your Perfect Match',
    description: 'Discover businesses that align with your goals and vision. Swipe right to connect, left to pass.',
    image: require('../assets/logo.png'),
  },
  {
    title: 'Instant Business Chat',
    description: 'When you match with a business, start a conversation instantly to explore collaboration opportunities.',
    image: require('../assets/logo.png'),
  },
  {
    title: 'Smart Recommendations',
    description: 'Our AI-powered system learns your preferences to suggest the most relevant business matches.',
    image: require('../assets/logo.png'),
  },
];

export default function OnboardingScreen({ navigation }: RootScreenProps<'Onboarding'>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const renderDot = (index: number) => {
    const dotStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ];
      const dotWidth = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );
      return {
        width: dotWidth,
        opacity,
      };
    });

    return (
      <Animated.View
        key={index}
        className="h-2 rounded-full bg-primary-500"
        style={dotStyle}
      />
    );
  };

  const renderSlide = (item: typeof ONBOARDING_DATA[0], index: number) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const imageStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ scale }],
        opacity,
      };
    });

    const textStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [20, 0, 20],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    return (
      <View
        key={index}
        style={{ width }}
        className="items-center justify-center"
      >
        <Animated.View
          className="w-72 h-72 items-center justify-center mb-8"
          style={imageStyle}
        >
          <Image
            source={item.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          className="px-8 items-center"
          style={textStyle}
        >
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            {item.title}
          </Text>
          <Text className="text-base text-gray-600 text-center">
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  return (
    <View 
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <TouchableOpacity
        className="absolute right-4 z-10"
        style={{ top: insets.top + 16 }}
        onPress={handleSkip}
      >
        <Text className="text-base font-medium text-neutral-500">Skip</Text>
      </TouchableOpacity>

      <AnimatedScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {ONBOARDING_DATA.map(renderSlide)}
      </AnimatedScrollView>

      <View className="flex-row justify-center items-center space-x-2 mb-8">
        {ONBOARDING_DATA.map((_, index) => renderDot(index))}
      </View>

      <View 
        className="px-8 pb-8"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          className="w-full py-4 bg-primary-500 rounded-xl items-center"
          onPress={handleNext}
        >
          <Text className="text-white text-base font-semibold">
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 