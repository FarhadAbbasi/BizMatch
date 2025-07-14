import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, RefreshControl, Alert, Platform } from 'react-native';
import { TabScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { BusinessProfile } from '../stores/useSwipe';
import { format } from 'date-fns';
import { ScreenContainer } from '../components/ScreenContainer';
import { useColors } from '../theme/ThemeProvider';

interface ConnectionBusiness extends Partial<BusinessProfile> {
  id: string;
  name: string;
  industry: string;
  logo_url?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  is_match: boolean;
  conversation_id?: string;
}

interface SegmentedControlProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

interface SwipeData {
  target_business: {
    id: string;
    name: string;
    industry: string;
    logo_url?: string;
    description?: string;
  };
}

interface MatchData {
  business_b: {
    id: string;
    name: string;
    industry: string;
    logo_url?: string;
    description?: string;
  };
  owner_uid: string;
}

interface MatchResponse {
  business_b: {
    id: string;
    name: string;
    industry: string;
    logo_url?: string;
    description?: string;
    owner_uid: string;
  };
}

interface SwipeResponse {
  target_business: {
    id: string;
    name: string;
    industry: string;
    logo_url?: string;
    description?: string;
  };
}

function SegmentedControl({ selectedIndex, onSelect }: SegmentedControlProps) {
  const colors = useColors();
  
  return (
    <View className="flex-row bg-neutral-100 p-1 rounded-xl mx-4 mb-4">
      <TouchableOpacity
        className={`flex-1 py-2.5 rounded-lg ${selectedIndex === 0 ? 'bg-white' : ''}`}
        onPress={() => onSelect(0)}
      >
        <Text 
          className={`text-center font-medium ${
            selectedIndex === 0 ? 'text-neutral-900' : 'text-neutral-500'
          }`}
        >
          Potential
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 py-2.5 rounded-lg ${selectedIndex === 1 ? 'bg-white' : ''}`}
        onPress={() => onSelect(1)}
      >
        <Text 
          className={`text-center font-medium ${
            selectedIndex === 1 ? 'text-neutral-900' : 'text-neutral-500'
          }`}
        >
          Matches
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ConnectionCard({ business, onPress }: { business: ConnectionBusiness; onPress: () => void }) {
  return (
    <TouchableOpacity 
      className="flex-row items-center p-3 mx-4 mb-3 bg-white rounded-xl"
      style={Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        }
      })}
      onPress={onPress}
    >
      {/* Logo/Image */}
      <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 mr-3">
        {business.logo_url ? (
          <Image
            source={{ uri: business.logo_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center">
            <Text className="text-xl font-semibold text-gray-400">
              {business.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-gray-900">{business.name}</Text>
          {business.last_message_at && (
            <Text className="text-xs text-gray-500">
              {format(new Date(business.last_message_at), 'MMM d')}
            </Text>
          )}
        </View>
        
        <View className="flex-row items-center mb-1">
          <Text className="text-sm text-gray-500 mr-2">{business.industry}</Text>
          {business.is_match && (
            <View className="px-2 py-0.5 bg-green-50 rounded-full">
              <Text className="text-xs text-green-600 font-medium">Match</Text>
            </View>
          )}
        </View>

        {business.last_message && (
          <View className="flex-row items-center justify-between">
            <Text 
              className="text-sm text-gray-500 flex-1"
              numberOfLines={1}
            >
              {business.last_message}
            </Text>
            {business.unread_count ? (
              <View className="w-5 h-5 rounded-full bg-blue-500 ml-2 items-center justify-center">
                <Text className="text-xs text-white font-medium">
                  {business.unread_count}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ConnectionsScreen({ navigation }: TabScreenProps<'ConnectionsTab'>) {
  const { user } = useSession();
  const colors = useColors();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [potentialConnections, setPotentialConnections] = useState<ConnectionBusiness[]>([]);
  const [matches, setMatches] = useState<ConnectionBusiness[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConnections();
    setRefreshing(false);
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      // First get the user's business profile
      const { data: userProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('owner_uid', user?.id)
        .single();

      console.log('User profile:', userProfile);
      if (!userProfile) return;

      // Fetch matches first
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          business_b:business_b (
            id,
            name,
            industry,
            logo_url,
            description,
            owner_uid
          )
        `)
        .eq('user_a', user?.id)
        .order('matched_at', { ascending: false }) as { data: MatchResponse[] | null };

      console.log('Matches data:', matchesData);

      // Get all matched business IDs
      const matchedBusinessIds = (matchesData || []).map(match => match.business_b.id);
      console.log('Matched business IDs:', matchedBusinessIds);

      // Fetch potential matches (right swipes that aren't matches)
      const { data: potentialData } = await supabase
        .from('swipes')
        .select(`
          target_business:target_business_id (
            id,
            name,
            industry,
            logo_url,
            description
          )
        `)
        .eq('swiper_uid', user?.id)
        .eq('direction', 'right')
        .not('target_business_id', 'eq', userProfile.id) as { data: SwipeResponse[] | null }; // Exclude our own business

      console.log('Raw potential data:', potentialData);

      // Filter out matched businesses from potential matches manually
      const potentialFiltered = (potentialData || []).filter(
        item => !matchedBusinessIds.includes(item.target_business.id)
      );
      console.log('Filtered potential data:', potentialFiltered);

      // Transform the potential matches data
      const potential = potentialFiltered.map((item: SwipeResponse) => ({
        id: item.target_business.id,
        name: item.target_business.name,
        industry: item.target_business.industry,
        logo_url: item.target_business.logo_url,
        description: item.target_business.description,
        is_match: false
      }));

      // Transform matches data - business_b is always the other business
      const matchedBusinesses = (matchesData || []).map((match: MatchResponse) => ({
        id: match.business_b.id,
        name: match.business_b.name,
        industry: match.business_b.industry,
        logo_url: match.business_b.logo_url,
        description: match.business_b.description,
        owner_uid: match.business_b.owner_uid,
        is_match: true
      }));

      console.log('Final potential connections:', potential);
      console.log('Final matched businesses:', matchedBusinesses);

      setPotentialConnections(potential);
      setMatches(matchedBusinesses);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionPress = async (business: ConnectionBusiness) => {
    console.log('Pressed business:', business);
    
    if (business.is_match) {
      try {
        // Get our business profile
        const { data: userProfile, error: profileError } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('owner_uid', user?.id)
          .single();

        if (profileError) throw profileError;

        // Check if conversation exists - check both directions
        const { data: existingConversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(
            `and(user_a.eq.${user?.id},user_b.eq.${business.owner_uid},business_a.eq.${userProfile.id},business_b.eq.${business.id}),` +
            `and(user_b.eq.${user?.id},user_a.eq.${business.owner_uid},business_b.eq.${userProfile.id},business_a.eq.${business.id})`
          )
          .single();

        console.log('Existing conversation check:', { existingConversation, convError });

        if (convError && convError.code !== 'PGRST116') {
          throw convError;
        }

        let conversationId = existingConversation?.id;

        // If no conversation exists, create one
        if (!conversationId) {
          console.log('No existing conversation found, creating new one');

          // Create new conversation
          const { data: newConversation, error: conversationError } = await supabase
            .from('conversations')
            .insert({
              user_a: user?.id,
              user_b: business.owner_uid,
              business_a: userProfile.id,
              business_b: business.id
            })
            .select('id')
            .single();

          if (conversationError) throw conversationError;
          
          console.log('Created new conversation:', newConversation.id);
          conversationId = newConversation.id;
        } else {
          console.log('Using existing conversation:', conversationId);
        }

        // Navigate to chat with the conversation ID
        navigation.navigate('Chat', { 
          matchId: conversationId,
          businessId: business.id
        });
      } catch (error) {
        console.error('Error handling conversation:', error);
        Alert.alert('Error', 'Failed to open conversation');
      }
    } else {
      // For potential matches, show business details
      navigation.navigate('BusinessDetails', { id: business.id });
    }
  };

  const renderConnection = ({ item }: { item: ConnectionBusiness }) => (
    <ConnectionCard
      business={item}
      onPress={() => handleConnectionPress(item)}
    />
  );

  return (
    <ScreenContainer scrollable={false}>
      <View className="flex-1">
        <Text className="text-2xl font-bold text-neutral-900 mb-6 px-4 pt-4">
          Connections
        </Text>

        <SegmentedControl
          selectedIndex={selectedSegment}
          onSelect={setSelectedSegment}
        />

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-neutral-500">Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={selectedSegment === 0 ? potentialConnections : matches}
            renderItem={renderConnection}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary[500]]}
                tintColor={colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center pt-8">
                <Text className="text-neutral-500">
                  {selectedSegment === 0 
                    ? "No potential connections yet"
                    : "No matches yet"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
} 