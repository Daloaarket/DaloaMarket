import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { CATEGORIES, CONDITIONS, DISTRICTS } from '../../lib/utils';
import Toast from 'react-native-toast-message';

interface ListingForm {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  district: string;
}

export default function CreateScreen() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState<ListingForm>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    district: userProfile?.district || '',
  });

  const pickImage = async () => {
    if (photos.length >= 5) {
      Toast.show({
        type: 'error',
        text1: 'Limite atteinte',
        text2: 'Maximum 5 photos autorisées'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 5) {
      Toast.show({
        type: 'error',
        text1: 'Limite atteinte',
        text2: 'Maximum 5 photos autorisées'
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const showImagePicker = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une option',
      [
        { text: 'Appareil photo', onPress: takePhoto },
        { text: 'Galerie', onPress: pickImage },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le titre est requis' });
      return false;
    }
    if (!form.description.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'La description est requise' });
      return false;
    }
    if (!form.price || parseInt(form.price) < 200) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le prix minimum est de 200 FCFA' });
      return false;
    }
    if (!form.category) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Sélectionnez une catégorie' });
      return false;
    }
    if (!form.condition) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Sélectionnez un état' });
      return false;
    }
    if (!form.district) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Sélectionnez un quartier' });
      return false;
    }
    if (photos.length === 0) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Ajoutez au moins une photo' });
      return false;
    }
    return true;
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;
      
      // Convert URI to blob for upload
      const response = await fetch(photo);
      const blob = await response.blob();
      
      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, blob);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Vous devez être connecté' });
      return;
    }

    setLoading(true);
    
    try {
      // Upload photos
      const photoUrls = await uploadPhotos();
      
      // Create listing
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseInt(form.price),
          category: form.category,
          condition: form.condition,
          district: form.district,
          photos: photoUrls,
          status: 'pending' // Will be activated after payment
        })
        .select()
        .single();

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Annonce créée ! Procédez au paiement.'
      });

      // Navigate to payment
      router.push(`/payment?listingId=${data.id}&amount=200`);
      
    } catch (error) {
      console.error('Error creating listing:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de créer l\'annonce'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-grey-50 px-6">
        <Ionicons name="person-outline\" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold mt-4 mb-2">Connexion requise</Text>
        <Text className="text-grey-600 text-center mb-6">
          Vous devez être connecté pour publier une annonce
        </Text>
        <Button
          title="Se connecter"
          onPress={() => router.push('/auth/login')}
        />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-grey-50 px-6">
        <Ionicons name="person-add-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold mt-4 mb-2">Profil incomplet</Text>
        <Text className="text-grey-600 text-center mb-6">
          Complétez votre profil pour publier une annonce
        </Text>
        <Button
          title="Compléter mon profil"
          onPress={() => router.push('/auth/complete-profile')}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-grey-50">
      <View className="p-6">
        {/* Photos Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Photos (max 5)</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {photos.map((photo, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri: photo }} className="w-24 h-24 rounded-xl" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {photos.length < 5 && (
                <TouchableOpacity
                  className="w-24 h-24 bg-grey-200 rounded-xl justify-center items-center border-2 border-dashed border-grey-400"
                  onPress={showImagePicker}
                >
                  <Ionicons name="camera" size={24} color="#6B7280" />
                  <Text className="text-xs text-grey-600 mt-1">Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-base font-medium mb-2">Titre</Text>
            <TextInput
              className="border border-grey-300 rounded-xl px-4 py-3 bg-white"
              placeholder="Ex: iPhone 12 en excellent état"
              value={form.title}
              onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
              maxLength={100}
            />
          </View>

          <View>
            <Text className="text-base font-medium mb-2">Description</Text>
            <TextInput
              className="border border-grey-300 rounded-xl px-4 py-3 bg-white h-24"
              placeholder="Décrivez votre article en détail..."
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-base font-medium mb-2">Prix (FCFA)</Text>
            <TextInput
              className="border border-grey-300 rounded-xl px-4 py-3 bg-white"
              placeholder="Ex: 150000"
              value={form.price}
              onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />
          </View>

          <View>
            <Text className="text-base font-medium mb-2">Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`px-4 py-2 rounded-full border ${
                      form.category === category.id ? 'bg-primary border-primary' : 'border-grey-300 bg-white'
                    }`}
                    onPress={() => setForm(prev => ({ ...prev, category: category.id }))}
                  >
                    <Text className={form.category === category.id ? 'text-white' : 'text-grey-700'}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text className="text-base font-medium mb-2">État</Text>
            <View className="flex-row flex-wrap gap-3">
              {CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  className={`px-4 py-2 rounded-full border ${
                    form.condition === condition.id ? 'bg-primary border-primary' : 'border-grey-300 bg-white'
                  }`}
                  onPress={() => setForm(prev => ({ ...prev, condition: condition.id }))}
                >
                  <Text className={form.condition === condition.id ? 'text-white' : 'text-grey-700'}>
                    {condition.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-base font-medium mb-2">Quartier</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {DISTRICTS.map((district) => (
                  <TouchableOpacity
                    key={district}
                    className={`px-4 py-2 rounded-full border ${
                      form.district === district ? 'bg-primary border-primary' : 'border-grey-300 bg-white'
                    }`}
                    onPress={() => setForm(prev => ({ ...prev, district }))}
                  >
                    <Text className={form.district === district ? 'text-white' : 'text-grey-700'}>
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Submit Button */}
        <View className="mt-8">
          <Button
            title="Publier l'annonce (200 FCFA)"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* Info */}
        <View className="mt-4 bg-primary-50 rounded-xl p-4">
          <Text className="text-primary-800 text-sm">
            💡 Votre annonce sera publiée après validation du paiement de 200 FCFA.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}