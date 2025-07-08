import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { MainScreenProps } from '../navigation/types';
import { useSwipe } from '../stores/useSwipe';
import { useSession } from '../stores/useSession';
import { BusinessCard } from '../components';
import { useColors } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VERTICAL_PADDING = 20;

export default function SwiperScreen({ navigation }: MainScreenProps<'Swiper'>) {
  const swiperRef = useRef<Swiper<any>>(null);
  const colors = useColors();
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
      <View style={styles.container}>
        <BusinessCard isLoading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
          onPress={fetchBusinesses}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!businesses.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          No more businesses to show.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
          onPress={fetchBusinesses}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.neutral[100] }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.iconText}>👤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.neutral[100] }]}
          onPress={() => navigation.navigate('Filters')}
        >
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={businesses}
          renderCard={(business) => (
            <BusinessCard
              business={business}
              onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
            />
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
          cardVerticalMargin={VERTICAL_PADDING}
          cardHorizontalMargin={0}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          verticalSwipe={false}
          containerStyle={styles.swiperContainer}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary[100] }]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.actionButtonText}>👎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary[100] }]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.actionButtonText}>👍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -VERTICAL_PADDING,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 