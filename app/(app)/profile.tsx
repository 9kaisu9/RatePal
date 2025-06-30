import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';

const MenuItem = ({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center py-4 border-b border-gray-800 active:opacity-80"
  >
    <Text className="mr-3">{icon}</Text>
    <Text className="text-white flex-1">{title}</Text>
    <Text className="text-gray-500">›</Text>
  </Pressable>
);

import { getMockData } from '../data/mockData';

export default function ProfileScreen() {
  const currentUser = getMockData.getCurrentUser();
  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log('Sign out');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          padding: 24,
          paddingBottom: 100
        }}
      >
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-white">{currentUser.name || 'Anonymous'}</Text>
          <Text className="text-gray-400">{currentUser.email}</Text>
        </View>

        {/* Subscription Status */}
        <View className="bg-blue-900/50 p-4 rounded-lg mb-8">
          <Text className="text-white font-semibold">{currentUser.isPremium ? 'Premium Plan' : 'Free Plan'}</Text>
          {!currentUser.isPremium && <Text className="text-gray-400">Upgrade to Premium</Text>}
          <Text className="text-gray-300 mb-4">
            Upgrade to Premium to unlock all features!
          </Text>
          <Button
            onPress={() => console.log('Upgrade to premium')}
            variant="primary"
          >
            Upgrade to Premium
          </Button>
        </View>

        {/* Settings Menu */}
        <View className="bg-gray-800 rounded-lg p-4 mb-8">
          <MenuItem
            title="Edit Profile"
            icon="✏️"
            onPress={() => console.log('Edit profile')}
          />
          <MenuItem
            title="App Settings"
            icon="⚙️"
            onPress={() => console.log('App settings')}
          />
          <MenuItem
            title="Notifications"
            icon="🔔"
            onPress={() => console.log('Notifications')}
          />
          <MenuItem
            title="Help & Support"
            icon="❓"
            onPress={() => console.log('Help & support')}
          />
        </View>

        {/* Sign Out Button */}
        <Button onPress={handleSignOut} variant="outline">
          Sign Out
        </Button>

        <Text className="text-center text-gray-500 mt-6">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
