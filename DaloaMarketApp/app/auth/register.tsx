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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs'
      });
      return false;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le mot de passe doit contenir au moins 6 caractères'
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Les mots de passe ne correspondent pas'
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { error } = await signUp(email.trim(), password);
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Inscription réussie',
        text2: 'Vérifiez votre email pour confirmer votre compte'
      });
      
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur d\'inscription',
        text2: error.message || 'Une erreur est survenue'
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
              <Ionicons name="person-add" size={48} color="white" />
            </View>
            <Text className="text-3xl font-bold text-grey-900 mb-2">
              Inscription
            </Text>
            <Text className="text-grey-600 text-center">
              Créez votre compte DaloaMarket
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

            <View>
              <Text className="text-base font-medium mb-2 text-grey-700">Confirmer le mot de passe</Text>
              <View className="relative">
                <TextInput
                  className="border border-grey-300 rounded-xl px-4 py-3 pl-12 pr-12 bg-white text-base"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color="#6B7280" 
                  style={{ position: 'absolute', left: 16, top: 14 }}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: 14 }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            className="mb-6"
          />

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text className="text-grey-600">Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text className="text-primary font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}