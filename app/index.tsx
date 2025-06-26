import { View, Text, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './components/ui/Button';

export default function WelcomeScreen() {

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 items-center justify-center p-6">
        {/* TODO: Add app logo */}
        <View className="w-32 h-32 bg-gray-800 rounded-full mb-8 items-center justify-center">
          <Text className="text-4xl">🌟</Text>
        </View>
        
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome to RatePal
        </Text>
        <Text className="text-lg text-gray-300 text-center mb-12">
          Your personal companion for rating everything that matters
        </Text>

        <View className="w-full space-y-4">
          <Link href="/(auth)/signin" asChild>
            <Button variant="primary" onPress={() => {}}>Sign In</Button>
          </Link>
          
          <Link href="/(auth)/signup" asChild>
            <Button variant="outline" onPress={() => {}}>Create Account</Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
