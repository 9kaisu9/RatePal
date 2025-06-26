import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    console.log('Reset password for:', email);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold text-white mb-4">Reset Password</Text>
        <Text className="text-gray-400 mb-8">
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          className="mb-8"
        />

        <Button onPress={handleResetPassword} variant="primary" className="mb-4">
          Send Reset Link
        </Button>

        <Button onPress={() => router.back()} variant="outline">
          Back to Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}
