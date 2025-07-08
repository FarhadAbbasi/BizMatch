import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { BusinessProfile } from '../stores/useSwipe';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Profile({ navigation }: MainScreenProps<'Profile'>) {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_uid', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Banner and Logo */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: profile?.banner_image_url || profile?.logo_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: profile?.logo_url }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Header with Edit Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.industry}>{profile?.industry}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <Badge
            variant="subtle"
            status="success"
            label={profile?.funding_stage || 'Established'}
          />
          <View style={styles.companySizeContainer}>
            <Text style={styles.companyIcon}>👥</Text>
            <Text style={styles.companySize}>{profile?.company_size || 'Growing Team'}</Text>
          </View>
        </View>

        {/* Location and Founded */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Location</Text>
            <Text style={styles.infoValue}>{profile?.headquarters || profile?.location}</Text>
          </View>
          {profile?.founded_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Founded</Text>
              <Text style={styles.infoValue}>
                {format(new Date(profile.founded_date), 'MMMM yyyy')}
              </Text>
            </View>
          )}
          {profile?.revenue_range && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰 Revenue</Text>
              <Text style={styles.infoValue}>{profile.revenue_range}</Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{profile?.description}</Text>
        </View>

        {/* Looking For */}
        {profile?.looking_for && profile.looking_for.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.badgeContainer}>
              {profile.looking_for.map((item, index) => (
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
        {profile?.tech_stack && profile.tech_stack.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tech Stack</Text>
            <View style={styles.badgeContainer}>
              {profile.tech_stack.map((tech, index) => (
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
        {profile?.services && profile.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.badgeContainer}>
              {profile.services.map((service, index) => (
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
        {profile?.highlights && profile.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightsContainer}>
              {profile.highlights.map((highlight, index) => (
                <Card key={index} variant="outlined" style={styles.highlightCard}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightContent}>{highlight.content}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
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
    marginBottom: 4,
  },
  highlightContent: {
    fontSize: 14,
    color: '#4b5563',
  },
}); 