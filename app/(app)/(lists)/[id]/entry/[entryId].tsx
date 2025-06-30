import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Placeholder data - replace with real data from backend
const entryData = {
  id: '1',
  name: 'Sushi Place',
  rating: 4.5,
  date: '2025-06-30',
  details: {
    cuisine: 'Japanese',
    price: 4,
    location: 'Downtown',
    notes: 'Great sashimi, nice atmosphere. A bit pricey but worth it for special occasions.',
  },
};

export default function EntryDetailScreen() {
  const { id, entryId } = useLocalSearchParams();
  const entry = entryData; // TODO: Fetch real entry data using entryId

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Delete entry:', entryId);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">{entry.name}</Text>
          <Button variant="outline" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-8">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="star" size={24} color="#FCD34D" />
            <Text className="text-2xl text-white font-bold ml-2">
              {entry.rating}
            </Text>
          </View>

          <View className="space-y-4">
            {Object.entries(entry.details).map(([key, value]) => (
              <View key={key}>
                <Text className="text-gray-400 text-sm mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text className="text-white">
                  {key === 'price' ? '\u2022'.repeat(Number(value)) : value}
                </Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-400 mt-4">Added on {entry.date}</Text>
        </View>

        <View className="space-y-4">
          <Button
            variant="outline"
            onPress={() => router.push(`/lists/${id}/entry/${entryId}/edit`)}
          >
            Edit Entry
          </Button>
          <Button
            variant="outline"
            onPress={handleDelete}
            className="bg-red-500/10 border-red-500"
          >
            <Text className="text-red-500 font-medium">Delete Entry</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
