import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Button } from '../components/ui/Button';

// Placeholder data
const recentEntries = [
  { id: 1, title: 'Sushi Restaurant', rating: 85, list: 'Restaurants' },
  { id: 2, title: 'The Dark Knight', rating: 95, list: 'Movies' },
  { id: 3, title: 'Project Hail Mary', rating: 90, list: 'Books' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          padding: 24,
          paddingBottom: 100
        }}
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">Welcome back!</Text>
          <Text className="text-gray-400">Ready to rate something new?</Text>
        </View>

        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-white">Quick Stats</Text>
          </View>
          <View className="flex-row justify-between bg-gray-800 p-4 rounded-lg">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">3</Text>
              <Text className="text-gray-400">Lists</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">12</Text>
              <Text className="text-gray-400">Entries</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">4.2</Text>
              <Text className="text-gray-400">Avg Rating</Text>
            </View>
          </View>
        </View>

        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-white">Recent Entries</Text>
            <Link href="/lists">
              <Text className="text-blue-500">View All</Text>
            </Link>
          </View>
          {recentEntries.map((entry) => (
            <View
              key={entry.id}
              className="bg-gray-800 p-4 rounded-lg mb-3 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-white font-medium">{entry.title}</Text>
                <Text className="text-gray-400 text-sm">{entry.list}</Text>
              </View>
              <View className="bg-blue-500 px-2 py-1 rounded">
                <Text className="text-white font-medium">{entry.rating}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          onPress={() => console.log('Create new entry')}
          variant="primary"
          className="mt-6"
        >
          Create New Entry
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
