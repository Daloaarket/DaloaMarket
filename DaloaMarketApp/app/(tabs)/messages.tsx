import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import Toast from 'react-native-toast-message';

interface Conversation {
  listing_id: string;
  listing_title: string;
  listing_photo: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages'
      }, () => {
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          listing:listings!messages_listing_id_fkey (
            id,
            title,
            photos,
            user_id
          ),
          sender:users!messages_sender_id_fkey (
            full_name
          ),
          receiver:users!messages_receiver_id_fkey (
            full_name
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();
      
      messages?.forEach((message: any) => {
        const isUserSender = message.sender_id === user.id;
        const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
        const otherUserName = isUserSender 
          ? message.receiver.full_name 
          : message.sender.full_name;
        
        const conversationKey = `${message.listing_id}_${otherUserId}`;
        
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            listing_id: message.listing_id,
            listing_title: message.listing.title,
            listing_photo: message.listing.photos[0] || '',
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: message.content,
            last_message_date: message.created_at,
            unread_count: !isUserSender && !message.read ? 1 : 0
          });
        } else if (!isUserSender && !message.read) {
          const conversation = conversationMap.get(conversationKey)!;
          conversation.unread_count += 1;
        }
      });
      
      const conversationList = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());
      
      setConversations(conversationList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les conversations'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/chat/${conversation.listing_id}/${conversation.other_user_id}`);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      className="bg-white p-4 border-b border-grey-100 flex-row items-center"
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.listing_photo || 'https://via.placeholder.com/64' }}
        className="w-16 h-16 rounded-xl mr-4"
        resizeMode="cover"
      />
      
      <View className="flex-1">
        <Text className="font-semibold text-grey-900 mb-1" numberOfLines={1}>
          {item.listing_title}
        </Text>
        <Text className="text-grey-600 text-sm mb-1">
          {item.other_user_name}
        </Text>
        <Text className="text-grey-500 text-sm" numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>
      
      <View className="items-end">
        <Text className="text-grey-400 text-xs mb-1">
          {formatDate(item.last_message_date)}
        </Text>
        {item.unread_count > 0 && (
          <View className="bg-primary rounded-full w-6 h-6 justify-center items-center">
            <Text className="text-white text-xs font-bold">
              {item.unread_count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-grey-50 px-6">
        <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold mt-4 mb-2">Connexion requise</Text>
        <Text className="text-grey-600 text-center mb-6">
          Connectez-vous pour voir vos messages
        </Text>
        <TouchableOpacity 
          className="bg-primary rounded-2xl py-3 px-6"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white font-semibold">Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-grey-50">
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item.listing_id}_${item.other_user_id}`}
          renderItem={renderConversationItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-bold mt-4 mb-2">Aucun message</Text>
          <Text className="text-grey-600 text-center mb-6">
            Vous n'avez pas encore de conversations. Parcourez les annonces et contactez les vendeurs.
          </Text>
          <TouchableOpacity 
            className="bg-primary rounded-2xl py-3 px-6"
            onPress={() => router.push('/search')}
          >
            <Text className="text-white font-semibold">Parcourir les annonces</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}