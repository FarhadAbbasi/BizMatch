import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, StyleSheet, Dimensions, Platform } from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { BusinessProfile } from '../stores/useSwipe';
import { Badge, Button, Card, Skeleton, SkeletonGroup } from '../components';
import { useColors } from '../theme/ThemeProvider';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bannerContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  industry: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  companySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  companyIcon: {
    fontSize: 16,
  },
  companySize: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: 24,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightsContainer: {
    gap: 12,
  },
  highlightCard: {
    padding: 16,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  highlightContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default function BusinessDetails({ route, navigation }: MainScreenProps<'BusinessDetails'>) {
  const { id } = route.params;
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useColors();

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_view_count', { business_id: id });

      // Fetch business details
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsitePress = async () => {
    if (business?.website_url) {
      try {
        await Linking.openURL(business.website_url);
      } catch (error) {
        console.error('Error opening website URL:', error);
      }
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
      <ScrollView className="flex-1 bg-white">
        <SkeletonGroup>
          <Skeleton height={250} width="100%" />
          <View className="p-4">
            <Skeleton height={40} width="80%" />
            <View style={{ height: 24 }} />
            <Skeleton height={24} width="40%" />
            <View style={{ height: 8 }} />
            <Skeleton height={20} width="60%" />
            <View style={{ height: 24 }} />
            <Skeleton height={100} width="100%" />
          </View>
        </SkeletonGroup>
      </ScrollView>
    );
  }

  if (!business) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-xl text-center text-gray-600">
          Business not found
        </Text>
        <Button
          variant="primary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Banner and Logo */}
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

      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.name}>{business.name}</Text>
        <Text style={styles.industry}>{business.industry}</Text>

        {/* Meta Information */}
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

        {/* Location and Founded */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Location</Text>
            <Text style={styles.infoValue}>{business.headquarters || business.location}</Text>
          </View>
          {business.founded_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Founded</Text>
              <Text style={styles.infoValue}>
                {format(new Date(business.founded_date), 'MMMM yyyy')}
              </Text>
            </View>
          )}
          {business.revenue_range && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰 Revenue</Text>
              <Text style={styles.infoValue}>{business.revenue_range}</Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{business.description}</Text>
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

        {/* Services */}
        {business.services?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.badgeContainer}>
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

        {/* Highlights */}
        {business.highlights?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightsContainer}>
              {business.highlights.map((highlight, index) => (
                <Card key={index} variant="outlined" style={styles.highlightCard}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightContent}>{highlight.content}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {business.website_url && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
              onPress={handleWebsitePress}
            >
              <Text style={styles.actionButtonText}>Visit Website</Text>
            </TouchableOpacity>
          )}
          {business.linkedin_url && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#0077B5' }]}
              onPress={handleLinkedInPress}
            >
              <Text style={styles.actionButtonText}>LinkedIn Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
} 