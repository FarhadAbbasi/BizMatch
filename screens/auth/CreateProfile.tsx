import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { RootScreenProps } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useSession } from '../../stores/useSession';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { BusinessHighlight } from '../../stores/useSwipe';
import { Card } from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CommonActions } from '@react-navigation/native';

interface CreateProfileForm {
  name: string;
  description: string;
  industry: string;
  location: string;
  services: string[];
  tags: string[];
  linkedin_url: string;
  logo_url: string;
  founded_date: string;
  company_size: string;
  website_url: string;
  banner_image_url: string;
  headquarters: string;
  funding_stage: string;
  revenue_range: string;
  tech_stack: string[];
  looking_for: string[];
  highlights: BusinessHighlight[];
}

export default function CreateProfileScreen({ navigation }: RootScreenProps<'CreateProfile'>) {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateProfileForm>({
    name: '',
    description: '',
    industry: '',
    location: '',
    services: [],
    tags: [],
    linkedin_url: '',
    logo_url: '',
    founded_date: '',
    company_size: '',
    website_url: '',
    banner_image_url: '',
    headquarters: '',
    funding_stage: '',
    revenue_range: '',
    tech_stack: [],
    looking_for: [],
    highlights: [],
  });

  // Input states for array fields
  const [newService, setNewService] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTechStack, setNewTechStack] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');
  const [newHighlight, setNewHighlight] = useState<BusinessHighlight>({ title: '', content: '' });

  // Array field handlers
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

  const addTechStack = () => {
    if (newTechStack && !form.tech_stack.includes(newTechStack)) {
      setForm(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTechStack],
      }));
      setNewTechStack('');
    }
  };

  const removeTechStack = (tech: string) => {
    setForm(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech),
    }));
  };

  const addLookingFor = () => {
    if (newLookingFor && !form.looking_for.includes(newLookingFor)) {
      setForm(prev => ({
        ...prev,
        looking_for: [...prev.looking_for, newLookingFor],
      }));
      setNewLookingFor('');
    }
  };

  const removeLookingFor = (item: string) => {
    setForm(prev => ({
      ...prev,
      looking_for: prev.looking_for.filter(i => i !== item),
    }));
  };

  const addHighlight = () => {
    if (newHighlight.title && newHighlight.content) {
      setForm(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight],
      }));
      setNewHighlight({ title: '', content: '' });
    }
  };

  const removeHighlight = (index: number) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProfile = async () => {
    if (!user) {
      console.error('No user found when creating profile');
      Alert.alert('Error', 'You must be logged in to create a profile');
      return;
    }

    if (!form.name || !form.industry || !form.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating profile for user:', user.id);
      
      // Clean up the form data before sending
      const profile = {
        owner_uid: user.id,
        name: form.name.trim(),
        description: form.description.trim(),
        industry: form.industry.trim(),
        location: form.location.trim(),
        headquarters: form.headquarters.trim() || null,
        company_size: form.company_size.trim() || null,
        founded_date: form.founded_date.trim() || null,
        funding_stage: form.funding_stage.trim() || null,
        revenue_range: form.revenue_range.trim() || null,
        website_url: form.website_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        logo_url: form.logo_url.trim() || null,
        banner_image_url: form.banner_image_url.trim() || null,
        services: form.services,
        tags: form.tags,
        tech_stack: form.tech_stack,
        looking_for: form.looking_for,
        highlights: form.highlights,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Profile data:', profile);

      const { data, error } = await supabase
        .from('business_profiles')
        .insert(profile)
        .select()
        .single();

      console.log('Create profile result:', { data, error });

      if (error) throw error;

      // Navigate to Main screen and reset navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
      
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert(
        'Error',
        error instanceof Error && error.message.includes('date') 
          ? 'Founded date must be in YYYY-MM-DD format or left empty'
          : 'Failed to create profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <Input
              value={form.name}
              onChangeText={name => setForm(prev => ({ ...prev, name }))}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <Input
              value={form.description}
              onChangeText={description => setForm(prev => ({ ...prev, description }))}
              placeholder="Describe your business"
              multiline
              numberOfLines={4}
              className="h-24"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry *</Text>
            <Input
              value={form.industry}
              onChangeText={industry => setForm(prev => ({ ...prev, industry }))}
              placeholder="e.g. Technology, Retail, Services"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <Input
              value={form.location}
              onChangeText={location => setForm(prev => ({ ...prev, location }))}
              placeholder="City, Country"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Headquarters</Text>
            <Input
              value={form.headquarters}
              onChangeText={headquarters => setForm(prev => ({ ...prev, headquarters }))}
              placeholder="Main office location"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Company Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Size</Text>
            <Input
              value={form.company_size}
              onChangeText={company_size => setForm(prev => ({ ...prev, company_size }))}
              placeholder="e.g. 1-10, 11-50, 51-200"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Founded Date</Text>
            <Input
              value={form.founded_date}
              onChangeText={founded_date => setForm(prev => ({ ...prev, founded_date }))}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.hint}>Format: YYYY-MM-DD (e.g. 2020-01-31) or leave empty</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Funding Stage</Text>
            <Input
              value={form.funding_stage}
              onChangeText={funding_stage => setForm(prev => ({ ...prev, funding_stage }))}
              placeholder="e.g. Seed, Series A, Bootstrapped"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Revenue Range</Text>
            <Input
              value={form.revenue_range}
              onChangeText={revenue_range => setForm(prev => ({ ...prev, revenue_range }))}
              placeholder="e.g. $0-100K, $100K-1M"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Online Presence</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website URL</Text>
            <Input
              value={form.website_url}
              onChangeText={website_url => setForm(prev => ({ ...prev, website_url }))}
              placeholder="https://example.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn URL</Text>
            <Input
              value={form.linkedin_url}
              onChangeText={linkedin_url => setForm(prev => ({ ...prev, linkedin_url }))}
              placeholder="https://linkedin.com/company/..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Logo URL</Text>
            <Input
              value={form.logo_url}
              onChangeText={logo_url => setForm(prev => ({ ...prev, logo_url }))}
              placeholder="https://example.com/logo.png"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banner Image URL</Text>
            <Input
              value={form.banner_image_url}
              onChangeText={banner_image_url => setForm(prev => ({ ...prev, banner_image_url }))}
              placeholder="https://example.com/banner.png"
            />
          </View>
        </View>

        <Button
          onPress={handleCreateProfile}
          loading={loading}
          disabled={loading || !form.name || !form.industry || !form.location}
          className="mt-6"
        >
          Create Profile
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
}); 