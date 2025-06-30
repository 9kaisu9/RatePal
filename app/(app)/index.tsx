import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { getMockData } from '../data/mockData';

export default function HomeScreen() {
  const lists = getMockData.getLists();
  const allEntries = lists.flatMap(list => getMockData.getEntriesByListId(list.id));
  const recentEntries = lists
    .flatMap(list => getMockData.getEntriesByListId(list.id)
      .map(entry => ({ ...entry, listTitle: list.title })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
    
  const avgRating = allEntries
    .filter(entry => entry.rating !== null)
    .reduce((sum, entry) => sum + (entry.rating || 0), 0) / allEntries.length || 0;
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-900">
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
          <Text className="text-xl font-bold text-white mb-4">Recent Entries</Text>
          <View className="space-y-4">
            {recentEntries.map(entry => (
              <Link
                key={entry.id}
                href={{ 
                  pathname: '/(app)/(lists)/[id]/entry/[entryId]',
                  params: { id: entry.listId, entryId: entry.id }
                }}
                asChild
              >
                <Pressable className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold text-white">{entry.title}</Text>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="star"
                        size={20}
                        color="#FCD34D"
                      />
                      <Text className="text-white ml-1">{entry.rating}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400">{entry.listTitle}</Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* Quick Stats - Commented out for now
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-white">Quick Stats</Text>
          </View>
          <View className="flex-row flex-wrap gap-4">
            <View className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex-1">
              <Text className="text-lg font-semibold text-white">
                {lists.length}
              </Text>
              <Text className="text-gray-400">Lists</Text>
            </View>
            <View className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex-1">
              <Text className="text-lg font-semibold text-white">
                {lists.reduce((sum, list) => sum + list.entryCount, 0)}
              </Text>
              <Text className="text-gray-400">Total Entries</Text>
            </View>
            <View className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex-1">
              <Text className="text-lg font-semibold text-white">
                {avgRating.toFixed(1)}
              </Text>
              <Text className="text-gray-400">Avg Rating</Text>
            </View>
          </View>
        </View>
        */}

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
