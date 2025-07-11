import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
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
      className="flex-row items-center p-3 mx-4 mb-3 bg-white rounded-xl shadow-sm border border-neutral-100"
      onPress={onPress}
    >
      {/* Logo/Image */}
      <View className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 mr-3">
        <Image
          source={{ uri: business.logo_url }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-neutral-900">{business.name}</Text>
          {business.last_message_at && (
            <Text className="text-xs text-neutral-500">
              {format(new Date(business.last_message_at), 'MMM d')}
            </Text>
          )}
        </View>
        
        <View className="flex-row items-center mb-1">
          <Text className="text-sm text-neutral-500 mr-2">{business.industry}</Text>
          {business.is_match && (
            <View className="px-2 py-0.5 bg-accent-success/10 rounded-full">
              <Text className="text-xs text-accent-success font-medium">Match</Text>
            </View>
          )}
        </View>

        {business.last_message && (
          <View className="flex-row items-center justify-between">
            <Text 
              className="text-sm text-neutral-500 flex-1"
              numberOfLines={1}
            >
              {business.last_message}
            </Text>
            {business.unread_count ? (
              <View className="w-5 h-5 rounded-full bg-primary-500 ml-2 items-center justify-center">
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
  const [potentialConnections, setPotentialConnections] = useState<ConnectionBusiness[]>([]);
  const [matches, setMatches] = useState<ConnectionBusiness[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      // First get the user's business profile
      const { data: userProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('owner_uid', user?.id)
        .single();

      if (!userProfile) return;

      // Fetch potential connections (right swipes)
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
        .eq('direction', 'right');

      // Fetch matches with last message
      const { data: matchesData } = await supabase
        .from('conversation_details')
        .select('*')
        .or(`business_a_id.eq.${userProfile.id},business_b_id.eq.${userProfile.id}`)
        .order('last_message_at', { ascending: false });

      // Transform the data
      const potential = (potentialData?.map(item => ({
        id: item.target_business.id,
        name: item.target_business.name,
        industry: item.target_business.industry,
        logo_url: item.target_business.logo_url,
        description: item.target_business.description,
        is_match: false
      })) || []) as ConnectionBusiness[];

      const matchedBusinesses = (matchesData?.map(conv => {
        const isBusinessA = conv.business_a_id === userProfile.id;
        return {
          id: isBusinessA ? conv.business_b_id : conv.business_a_id,
          name: isBusinessA ? conv.business_b_name : conv.business_a_name,
          logo_url: isBusinessA ? conv.business_b_logo : conv.business_a_logo,
          industry: isBusinessA ? conv.business_b_industry : conv.business_a_industry,
          last_message: conv.last_message_content,
          last_message_at: conv.last_message_at || conv.conversation_created_at,
          is_match: true,
          conversation_id: conv.conversation_id
        } as ConnectionBusiness;
      }) || []) as ConnectionBusiness[];

      setPotentialConnections(potential);
      setMatches(matchedBusinesses);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionPress = (business: ConnectionBusiness) => {
    if (business.is_match && business.conversation_id) {
      navigation.navigate('Chat', { 
        matchId: business.conversation_id,
        businessId: business.id
      });
    } else {
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