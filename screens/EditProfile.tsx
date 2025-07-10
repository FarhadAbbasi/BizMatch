import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { BusinessProfile, BusinessHighlight } from '../stores/useSwipe';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileForm extends Omit<BusinessProfile, 'id' | 'owner_uid' | 'created_at' | 'updated_at'> {
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

export default function EditProfile({ navigation }: MainScreenProps<'EditProfile'>) {
  const { user, setError } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<EditProfileForm>({
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
      if (data) {
        const { id, owner_uid, created_at, updated_at, ...profileData } = data;
        setProfileId(id);
        setForm(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    if (!form.name || !form.industry || !form.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!profileId) {
      Alert.alert('Error', 'Could not find existing profile');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('business_profiles')
        .update({
          ...form,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={name => setForm(prev => ({ ...prev, name }))}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={description => setForm(prev => ({ ...prev, description }))}
              placeholder="Describe your business"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Industry *</Text>
            <TextInput
              style={styles.input}
              value={form.industry}
              onChangeText={industry => setForm(prev => ({ ...prev, industry }))}
              placeholder="e.g., Technology, Manufacturing, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={location => setForm(prev => ({ ...prev, location }))}
              placeholder="City, Country"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Headquarters</Text>
            <TextInput
              style={styles.input}
              value={form.headquarters}
              onChangeText={headquarters => setForm(prev => ({ ...prev, headquarters }))}
              placeholder="Main office location"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Company Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Founded Date</Text>
            <TextInput
              style={styles.input}
              value={form.founded_date}
              onChangeText={founded_date => setForm(prev => ({ ...prev, founded_date }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Size</Text>
            <TextInput
              style={styles.input}
              value={form.company_size}
              onChangeText={company_size => setForm(prev => ({ ...prev, company_size }))}
              placeholder="e.g., 1-10, 11-50, 51-200"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Funding Stage</Text>
            <TextInput
              style={styles.input}
              value={form.funding_stage}
              onChangeText={funding_stage => setForm(prev => ({ ...prev, funding_stage }))}
              placeholder="e.g., Seed, Series A, Bootstrapped"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Revenue Range</Text>
            <TextInput
              style={styles.input}
              value={form.revenue_range}
              onChangeText={revenue_range => setForm(prev => ({ ...prev, revenue_range }))}
              placeholder="e.g., $0-1M, $1M-5M"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Online Presence</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website URL</Text>
            <TextInput
              style={styles.input}
              value={form.website_url}
              onChangeText={website_url => setForm(prev => ({ ...prev, website_url }))}
              placeholder="https://example.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn URL</Text>
            <TextInput
              style={styles.input}
              value={form.linkedin_url}
              onChangeText={linkedin_url => setForm(prev => ({ ...prev, linkedin_url }))}
              placeholder="https://linkedin.com/company/..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Logo URL</Text>
            <TextInput
              style={styles.input}
              value={form.logo_url}
              onChangeText={logo_url => setForm(prev => ({ ...prev, logo_url }))}
              placeholder="https://example.com/logo.png"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Banner Image URL</Text>
            <TextInput
              style={styles.input}
              value={form.banner_image_url}
              onChangeText={banner_image_url => setForm(prev => ({ ...prev, banner_image_url }))}
              placeholder="https://example.com/banner.png"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.inputGroup}>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexGrow]}
                value={newService}
                onChangeText={setNewService}
                placeholder="Add a service"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addService}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {form.services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeService(service)}
                >
                  <Text style={styles.tagText}>{service} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tech Stack</Text>
          <View style={styles.inputGroup}>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexGrow]}
                value={newTechStack}
                onChangeText={setNewTechStack}
                placeholder="Add a technology"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addTechStack}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {form.tech_stack.map((tech, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTechStack(tech)}
                >
                  <Text style={styles.tagText}>{tech} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.inputGroup}>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexGrow]}
                value={newLookingFor}
                onChangeText={setNewLookingFor}
                placeholder="Add what you're looking for"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addLookingFor}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {form.looking_for.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeLookingFor(item)}
                >
                  <Text style={styles.tagText}>{item} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={newHighlight.title}
              onChangeText={title => setNewHighlight(prev => ({ ...prev, title }))}
              placeholder="Highlight title"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newHighlight.content}
              onChangeText={content => setNewHighlight(prev => ({ ...prev, content }))}
              placeholder="Highlight content"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addHighlight}
            >
              <Text style={styles.addButtonText}>Add Highlight</Text>
            </TouchableOpacity>
            <View style={styles.highlightsContainer}>
              {form.highlights.map((highlight, index) => (
                <Card key={index} variant="outlined" style={styles.highlightCard}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightContent}>{highlight.content}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeHighlight(index)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.inputGroup}>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexGrow]}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addTag}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {form.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.submitButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Add extra padding at the bottom
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  flexGrow: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#4b5563',
    fontSize: 14,
  },
  highlightsContainer: {
    gap: 12,
    marginTop: 8,
  },
  highlightCard: {
    padding: 16,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightContent: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 32,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 