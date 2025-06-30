import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Button } from '../../components/ui/Button';

// Placeholder data
const lists = [
  {
    id: '1',
    name: 'Favorite Restaurants',
    entriesCount: 12,
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    name: 'Movies to Watch',
    entriesCount: 8,
    lastUpdated: '1 week ago',
  },
  {
    id: '3',
    name: 'Books Read in 2025',
    entriesCount: 4,
    lastUpdated: '3 days ago',
  },
];

export default function ListsScreen() {
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          padding: 24,
          paddingBottom: 100
        }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">My Lists</Text>
          <Link href="/(app)/(lists)/create" asChild>
            <Button variant="primary">New List</Button>
          </Link>
        </View>

        <View className="space-y-4 mb-8">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={{ pathname: '/[id]/index', params: { id: list.id } }}
              asChild
            >
              <Pressable
                className="p-4 rounded-lg bg-gray-800 border border-gray-700"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-white">
                      {list.name}
                    </Text>
                    <Text className="text-gray-400">
                      {list.entriesCount} entries • {list.lastUpdated}
                    </Text>
                  </View>
                  <Link href={{ pathname: '/[id]/index', params: { id: list.id } }} asChild>
                    <Button variant="outline">View</Button>
                  </Link>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        {/* Premium upgrade banner */}
        <View className="p-6 rounded-lg bg-blue-500/20 border border-blue-500">
          <Text className="text-lg font-semibold text-white mb-2">
            Upgrade to Premium
          </Text>
          <Text className="text-gray-300 mb-4">
            Create unlimited lists and unlock advanced features
          </Text>
          <Button variant="primary" className="bg-blue-500 border-blue-500" onPress={() => console.log('Show premium info')}>
            Learn More
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
