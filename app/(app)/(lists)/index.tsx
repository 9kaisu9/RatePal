import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Button } from '../../components/ui/Button';

// Placeholder data
import { getMockData } from '../../data/mockData';

// Get lists from mock data
const lists = getMockData.getLists();

export default function ListsScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-900">
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
            <Pressable
              key={list.id}
              className="p-4 rounded-lg bg-gray-800 border border-gray-700"
              onPress={() => router.push({
                pathname: '/(app)/(lists)/[id]',
                params: { id: list.id }
              })}
            >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-white">{list.title}</Text>
                    <Text className="text-gray-400">{list.description}</Text>
                    <Text className="text-gray-500 text-sm mt-2">{new Date(list.updatedAt).toLocaleDateString()}</Text>
                  </View>
                  <Button 
                    variant="outline" 
                    className="ml-4"
                    onPress={() => router.push({
                      pathname: '/(app)/(lists)/[id]',
                      params: { id: list.id }
                    })}
                  >
                    View
                  </Button>
                </View>
            </Pressable>
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
