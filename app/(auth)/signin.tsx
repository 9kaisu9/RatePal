import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useState } from 'react';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Implement sign in logic
    console.log('Sign in:', { email, password });
    // Navigate to main app
    router.replace('/(app)');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold text-white mb-8">Welcome Back</Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          className="mb-4"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-8"
        />

        <Button onPress={handleSignIn} variant="primary" className="mb-4">
          Sign In
        </Button>

        <Link href="/(auth)/forgot-password" asChild>
          <Button variant="outline" onPress={() => {}}>Forgot Password?</Button>
        </Link>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Don't have an account? </Text>
          <Link href="/(auth)/signup">
            <Text className="text-blue-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
