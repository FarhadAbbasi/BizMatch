import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeProvider';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatBusiness {
  id: string;
  name: string;
  logo_url?: string;
  industry: string;
}

export default function ChatScreen({ route, navigation }: MainScreenProps<'Chat'>) {
  const { matchId, businessId } = route.params;
  const { user } = useSession();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [business, setBusiness] = useState<ChatBusiness | null>(null);
  const [userBusinessId, setUserBusinessId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchBusinessDetails();
    fetchMessages();
    const channel = setupRealtimeSubscription();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (business) {
      navigation.setOptions({
        headerTitle: () => (
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 mr-3">
              <Image
                source={{ uri: business.logo_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900">
                {business.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {business.industry}
              </Text>
            </View>
          </View>
        ),
      });
    }
  }, [business]);

  const fetchBusinessDetails = async () => {
    try {
      // Get user's business profile first
      const { data: userProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('owner_uid', user?.id)
        .single();

      if (userProfile) {
        setUserBusinessId(userProfile.id);
      }

      // Get chat partner's business details
      const { data: businessData } = await supabase
        .from('business_profiles')
        .select('id, name, logo_url, industry')
        .eq('id', businessId)
        .single();

      if (businessData) {
        setBusiness(businessData);
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
        // Mark messages as read
        if (data.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', matchId)
            .neq('sender_id', userBusinessId);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    return supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark message as read if from other user
          if (newMessage.sender_id !== userBusinessId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userBusinessId) return;

    try {
      setSending(true);
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: matchId,
          sender_id: userBusinessId,
          content: newMessage.trim(),
          type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === userBusinessId;
    
    return (
      <View 
        className={`flex-row mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        <View 
          className={`
            px-4 py-2.5 rounded-2xl max-w-[80%]
            ${isOwnMessage ? 'bg-primary-500' : 'bg-gray-100'}
          `}
        >
          <Text 
            className={`text-base ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}
          >
            {item.content}
          </Text>
          <Text 
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-primary-200' : 'text-gray-500'
            }`}
          >
            {format(new Date(item.created_at), 'h:mm a')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500">No messages yet</Text>
          </View>
        }
      />

      <View className="p-4 border-t border-gray-100">
        <View className="flex-row items-end bg-gray-100 rounded-2xl px-4 py-2">
          <TextInput
            className="flex-1 max-h-24 text-base leading-5 mr-2 py-2"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            style={{ lineHeight: 20 }}
          />
          <TouchableOpacity
            className={`
              p-2 rounded-xl
              ${newMessage.trim() ? 'bg-primary-500' : 'bg-gray-300'}
            `}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color="white"
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
} 