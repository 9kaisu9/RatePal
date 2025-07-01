import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function LoginScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
    
    // If no error, redirect to main app
    if (!error) {
      router.replace('/(app)/(lists)');
    } else {
      Alert.alert('Login Error', error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900">
      <StyledView className="flex-1 justify-center px-8">
        <StyledText className="text-3xl font-bold text-white mb-8 text-center">RatePal</StyledText>
        <StyledText className="text-xl text-white mb-6 text-center">Log in to your account</StyledText>
        
        <StyledView className="mb-4">
          <StyledText className="text-white mb-2">Email</StyledText>
          <StyledTextInput
            className="bg-gray-800 text-white p-4 rounded-lg"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </StyledView>
        
        <StyledView className="mb-6">
          <StyledText className="text-white mb-2">Password</StyledText>
          <StyledTextInput
            className="bg-gray-800 text-white p-4 rounded-lg"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#6b7280"
            secureTextEntry
          />
        </StyledView>
        
        <StyledTouchableOpacity
          className="bg-blue-600 p-4 rounded-lg"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <StyledText className="text-white text-center font-bold">Log In</StyledText>
          )}
        </StyledTouchableOpacity>
        
        {error && (
          <StyledText className="text-red-500 mt-4 text-center">{error}</StyledText>
        )}
        
        <StyledText className="text-gray-400 mt-8 text-center">
          Default test account is pre-filled.
        </StyledText>
      </StyledView>
    </StyledSafeAreaView>
  );
}
