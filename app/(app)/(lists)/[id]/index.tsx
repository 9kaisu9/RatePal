import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Placeholder data - replace with real data from backend
const listData = {
  id: '1',
  name: 'Favorite Restaurants',
  description: 'My go-to places to eat',
  entries: [
    {
      id: '1',
      name: 'Sushi Place',
      rating: 4.5,
      date: '2025-06-30',
      details: {
        cuisine: 'Japanese',
        price: 4,
        location: 'Downtown',
      },
    },
    {
      id: '2',
      name: 'Pizza Corner',
      rating: 4.0,
      date: '2025-06-29',
      details: {
        cuisine: 'Italian',
        price: 2,
        location: 'Uptown',
      },
    },
  ],
};

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const list = listData; // TODO: Fetch real list data using id

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-white">{list.name}</Text>
            <Text className="text-gray-400">{list.description}</Text>
          </View>
          <Link href={{ pathname: '/(app)/(lists)/[id]/entry/create', params: { id } }} asChild>
            <Button variant="primary">Add Entry</Button>
          </Link>
        </View>

        <View className="space-y-4">
          {list.entries.map((entry) => (
            <Link
              key={entry.id}
              href={{ pathname: '/(app)/(lists)/[id]/entry/[entryId]', params: { id, entryId: entry.id } }}
              asChild
            >
              <Pressable
                className="p-4 rounded-lg bg-gray-800 border border-gray-700"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-white">
                    {entry.name}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color="#FCD34D"
                    />
                    <Text className="text-white ml-1">{entry.rating}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-400">
                    {entry.details.cuisine} • {'•'.repeat(entry.details.price)}
                  </Text>
                  <Text className="text-gray-400">{entry.date}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
