import { View, Text, Image } from 'react-native';
import { Link, router, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './components/ui/Button';
import { useAuth } from './context/AuthContext';

export default function WelcomeScreen() {
  const { user, loading } = useAuth();
  
  // If loading, show nothing yet
  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }
  
  // If user is authenticated, redirect to lists
  if (user) {
    return <Redirect href="/(app)/(lists)" />;
  }
  
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
          <Link href="/(auth)/login" asChild>
            <Button variant="primary" onPress={() => {}}>Log In</Button>
          </Link>
          
          <Button 
            variant="outline" 
            onPress={() => router.push('/(app)/(lists)')}
          >
            Continue as Guest
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
