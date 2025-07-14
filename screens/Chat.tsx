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
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { MainScreenProps } from '../navigation/types';
import { supabase } from '../services/supabase';
import { useSession } from '../stores/useSession';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeProvider';
import { ScreenContainer } from '../components/ScreenContainer';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [business, setBusiness] = useState<ChatBusiness | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchBusinessDetails();
    fetchMessages();
    const subscription = setupRealtimeSubscription();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (business) {
      navigation.setOptions({
        headerStyle: Platform.select({
          ios: {
            backgroundColor: 'white',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
          },
          android: {
            backgroundColor: 'white',
            elevation: 2,
          },
        }),
        headerTitle: () => (
          <TouchableOpacity 
            className="flex-row items-center py-2"
            onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
          >
            <View className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 mr-3 shadow-sm">
              {business.logo_url ? (
                <Image
                  source={{ uri: business.logo_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-primary-100 items-center justify-center">
                  <Text className="text-xl font-semibold text-primary-500">
                    {business.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text className="text-lg font-semibold text-neutral-900">
                {business.name}
              </Text>
              <Text className="text-sm text-neutral-500 font-medium">
                {business.industry}
              </Text>
            </View>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
            className="mr-2 p-2 bg-neutral-50 rounded-full"
          >
            <Ionicons name="business-outline" size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
        ),
      });
    }
  }, [business]);

  const fetchBusinessDetails = async () => {
    try {
      const { data: businessData, error } = await supabase
        .from('business_profiles')
        .select('id, name, logo_url, industry')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      if (businessData) {
        setBusiness(businessData);
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      Alert.alert('Error', 'Failed to load business details');
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    return supabase
      .channel('messages')
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
          // Only add the message if it's not already in the list
          // and it's not a temporary message we created
          setMessages(prev => {
            // Check if we already have this message
            const messageExists = prev.some(msg => 
              msg.id === newMessage.id || // Same real message
              (msg.id.startsWith('temp-') && msg.content === newMessage.content && msg.sender_id === newMessage.sender_id) // Our temp message
            );

            if (messageExists) {
              // If it exists and was temporary, replace it
              return prev.map(msg => 
                (msg.id.startsWith('temp-') && msg.content === newMessage.content && msg.sender_id === newMessage.sender_id)
                  ? newMessage 
                  : msg
              );
            }

            // If it's a new message, add it
            return [...prev, newMessage];
          });

          // Scroll to bottom for new messages from others
          if (newMessage.sender_id !== user?.id) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      setSending(true);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: 'temp-' + Date.now(),
        content: messageContent,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        conversation_id: matchId
      };

      // Update UI immediately
      setMessages(prev => {
        // Check for any duplicate temporary messages first
        const hasDuplicate = prev.some(msg => 
          msg.content === messageContent && 
          msg.sender_id === user.id &&
          Date.now() - new Date(msg.created_at).getTime() < 1000 // Within last second
        );

        if (hasDuplicate) return prev;
        return [...prev, optimisticMessage];
      });
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);

      // Actually send the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: matchId,
          sender_id: user.id,
          content: messageContent,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      if (data) {
        setMessages(prev => 
          prev.map(msg => 
            (msg.id === optimisticMessage.id || 
             (msg.content === messageContent && 
              msg.sender_id === user.id && 
              msg.id.startsWith('temp-')))
              ? data 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      Alert.alert('Error', 'Failed to send message');
      // Put the failed message back in the input
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const messageTime = format(new Date(item.created_at), 'h:mm a');
    const isOptimistic = item.id.startsWith('temp-');
    
    return (
      <View 
        className={`flex-row mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'} px-4`}
      >
        <View 
          className={`
            px-4 py-3 rounded-2xl max-w-[85%]
            ${isOwnMessage 
              ? 'bg-blue-600 rounded-tr-none' 
              : 'bg-gray-100 rounded-tl-none border border-gray-200'
            }
            ${isOptimistic ? 'opacity-70' : ''}
          `}
          style={Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOwnMessage ? 0.15 : 0,
              shadowRadius: 2,
            },
            android: {
              elevation: isOwnMessage ? 2 : 0,
            },
          })}
        >
          <Text 
            className={`text-base ${
              isOwnMessage ? 'text-white' : 'text-gray-800'
            }`}
          >
            {item.content}
          </Text>
          <Text 
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {isOptimistic ? 'Sending...' : messageTime}
          </Text>
        </View>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-4">
                <Text className="text-gray-600 text-center text-base">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}

        <View className="px-4 pt-2 pb-4 border-t border-gray-200 bg-white">
          <View className="flex-row items-end space-x-2">
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
              <TextInput
                className="text-base text-gray-900 max-h-24"
                placeholder="Type a message..."
                placeholderTextColor="#6B7280"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
            </View>
            <TouchableOpacity
              className={`p-3 rounded-xl ${
                newMessage.trim() && !sending ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newMessage.trim() ? '#ffffff' : '#6B7280'} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
} 