import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, Linking } from 'react-native';
import { BusinessProfile } from '../stores/useSwipe';
import { Card } from './Card';
import { Badge } from './Badge';
import { Skeleton, SkeletonGroup } from './Skeleton';
import { useColors } from '../theme/ThemeProvider';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.92;
// Dynamic height based on screen size
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, SCREEN_WIDTH * 1.5);

export interface BusinessCardProps {
  business?: BusinessProfile;
  isLoading?: boolean;
  onPress?: () => void;
}

export function BusinessCard({ business, isLoading, onPress }: BusinessCardProps) {
  const colors = useColors();

  if (isLoading || !business) {
    return (
      <Card variant="elevated" style={styles.card}>
        <SkeletonGroup>
          <Skeleton height={200} width="100%" borderRadius={12} />
          <View style={{ padding: 16 }}>
            <Skeleton height={32} width="70%" />
            <View style={{ height: 8 }} />
            <Skeleton height={20} width="40%" />
            <View style={{ height: 16 }} />
            <Skeleton height={20} width="100%" />
            <View style={{ height: 16 }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Skeleton height={24} width={80} borderRadius={12} />
              <Skeleton height={24} width={80} borderRadius={12} />
              <Skeleton height={24} width={80} borderRadius={12} />
            </View>
          </View>
        </SkeletonGroup>
      </Card>
    );
  }

  const handleWebsitePress = () => {
    if (business.website_url) {
      Linking.openURL(business.website_url);
    }
  };

  const handleLinkedInPress = () => {
    if (business.linkedin_url) {
      Linking.openURL(business.linkedin_url);
    }
  };

  return (
    <Card
      variant="elevated"
      style={styles.card}
      onPress={onPress}
    >
      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: business.banner_image_url || business.logo_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: business.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{business.name}</Text>
            <Text style={styles.industry}>{business.industry}</Text>
          </View>
          <View style={styles.metaContainer}>
            <Badge
              variant="subtle"
              status="success"
              label={business.funding_stage || 'Established'}
            />
            <View style={styles.companySizeContainer}>
              <Text style={styles.companyIcon}>👥</Text>
              <Text style={styles.companySize}>{business.company_size || 'Growing Team'}</Text>
            </View>
          </View>
        </View>

        {/* Location and Founded Date */}
        <View style={styles.locationContainer}>
          <Text style={styles.location}>📍 {business.headquarters || business.location}</Text>
          {business.founded_date && (
            <Text style={styles.foundedDate}>
              Founded {format(new Date(business.founded_date), 'MMM yyyy')}
            </Text>
          )}
        </View>

        {/* Looking For */}
        {business.looking_for?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.badgeContainer}>
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

        {/* Tech Stack */}
        {business.tech_stack?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tech Stack</Text>
            <View style={styles.badgeContainer}>
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

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={3}>
            {business.description}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.actions}>
            {business.website_url && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
                onPress={handleWebsitePress}
              >
                <Text style={styles.actionButtonText}>Website</Text>
              </TouchableOpacity>
            )}
            {business.linkedin_url && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#0077B5' }]}
                onPress={handleLinkedInPress}
              >
                <Text style={styles.actionButtonText}>LinkedIn</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: SCREEN_WIDTH * 0.04,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerContainer: {
    height: CARD_HEIGHT * 0.25,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -32,
    left: 16,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 24,
    marginBottom: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  industry: {
    fontSize: 16,
    color: '#666',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  companyIcon: {
    fontSize: 14,
  },
  companySize: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  foundedDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  descriptionContainer: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 