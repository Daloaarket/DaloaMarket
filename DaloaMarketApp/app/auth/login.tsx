import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs'
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email.trim(), password);
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue sur DaloaMarket !'
      });
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.message || 'Vérifiez vos identifiants'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-grey-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-primary rounded-3xl p-6 mb-6">
              <Ionicons name="storefront" size={48} color="white" />
            </View>
            <Text className="text-3xl font-bold text-grey-900 mb-2">
              Connexion
            </Text>
            <Text className="text-grey-600 text-center">
              Connectez-vous à votre compte DaloaMarket
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-base font-medium mb-2 text-grey-700">Email</Text>
              <View className="relative">
                <TextInput
                  className="border border-grey-300 rounded-xl px-4 py-3 pl-12 bg-white text-base"
                  placeholder="votre@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color="#6B7280" 
                  style={{ position: 'absolute', left: 16, top: 14 }}
                />
              </View>
            </View>

            <View>
              <Text className="text-base font-medium mb-2 text-grey-700">Mot de passe</Text>
              <View className="relative">
                <TextInput
                  className="border border-grey-300 rounded-xl px-4 py-3 pl-12 pr-12 bg-white text-base"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color="#6B7280" 
                  style={{ position: 'absolute', left: 16, top: 14 }}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: 14 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            className="mb-6"
          />

          {/* Register Link */}
          <View className="flex-row justify-center">
            <Text className="text-grey-600">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text className="text-primary font-semibold">S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}