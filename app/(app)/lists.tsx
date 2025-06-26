import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';

// Placeholder data
const lists = [
  {
    id: 1,
    title: 'Restaurants',
    entries: 5,
    lastUpdated: '2025-06-25',
  },
  {
    id: 2,
    title: 'Movies',
    entries: 4,
    lastUpdated: '2025-06-24',
  },
  {
    id: 3,
    title: 'Books',
    entries: 3,
    lastUpdated: '2025-06-23',
  },
];

export default function ListsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-white">Your Lists</Text>
          <Button
            onPress={() => console.log('Create new list')}
            variant="primary"
          >
            New List
          </Button>
        </View>

        {lists.map((list) => (
          <Pressable
            key={list.id}
            className="bg-gray-800 p-4 rounded-lg mb-4 active:opacity-80"
            onPress={() => console.log('View list:', list.id)}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-semibold text-white">
                {list.title}
              </Text>
              <View className="bg-gray-700 px-2 py-1 rounded">
                <Text className="text-gray-300">{list.entries} entries</Text>
              </View>
            </View>
            <Text className="text-gray-400">
              Last updated: {new Date(list.lastUpdated).toLocaleDateString()}
            </Text>
          </Pressable>
        ))}

        {/* Premium upgrade banner */}
        <View className="bg-blue-900/50 p-4 rounded-lg mt-6">
          <Text className="text-white font-semibold mb-2">
            Unlock Unlimited Lists
          </Text>
          <Text className="text-gray-300 mb-4">
            Upgrade to Premium to create unlimited lists and unlock more features!
          </Text>
          <Button
            onPress={() => console.log('Upgrade to premium')}
            variant="primary"
          >
            Upgrade to Premium
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
