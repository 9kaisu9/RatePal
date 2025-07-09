import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { ListPicker } from '../components/ListPicker';
import { listService, entryService } from '../services/supabaseService';
import { Tables } from '../lib/supabase';

export default function HomeScreen() {
  const [isListPickerVisible, setIsListPickerVisible] = useState(false);
  const [lists, setLists] = useState<Tables['lists'][]>([]);
  const [recentEntries, setRecentEntries] = useState<(Tables['entries'] & { lists: { id: string, title: string } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState(0);
  
  // Fetch lists and recent entries from Supabase
  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      setError(null);
      
      // Fetch lists
      const listsData = await listService.getLists();
      setLists(listsData);
      
      // Fetch recent entries
      const entriesData = await entryService.getRecentEntries(5);
      setRecentEntries(entriesData);
      
      // Calculate average rating if there are entries
      if (entriesData.length > 0) {
        const validRatings = entriesData.filter(entry => entry.rating !== null);
        const ratingSum = validRatings.reduce((sum, entry) => sum + (entry.rating || 0), 0);
        const avg = validRatings.length > 0 ? ratingSum / validRatings.length : 0;
        setAvgRating(avg);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
    
  const handleSelectList = (listId: string) => {
    setIsListPickerVisible(false);
    router.push({
      pathname: '/(app)/(lists)/[id]/entry/create',
      params: { id: listId }
    });
  };
  
  const handleCreateEntryPress = () => {
    if (lists.length > 0) {
      setIsListPickerVisible(true);
    } else {
      // If no lists exist, navigate to create list screen
      router.push('/(app)/(lists)/create');
    }
  };
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-900">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          padding: 24,
          paddingBottom: 100
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]} // Android
            progressBackgroundColor="#1F2937" // Android
            title="Pull to refresh" // iOS
            titleColor="#3B82F6" // iOS
          />
        }
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">Welcome back!</Text>
          <Text className="text-gray-400">Ready to rate something new?</Text>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-white mb-4">Recent Entries</Text>
          
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-400 mt-2">Loading entries...</Text>
            </View>
          ) : error ? (
            <View className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
              <Text className="text-red-400">{error}</Text>
            </View>
          ) : recentEntries.length === 0 ? (
            <View className="p-4 rounded-lg bg-gray-800 border border-gray-700 items-center">
              <Text className="text-gray-400">No entries yet. Create your first entry!</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {recentEntries.map(entry => (
                <Link
                  key={entry.id}
                  href={{ 
                    pathname: '/(app)/(lists)/[id]/entry/[entryId]',
                    params: { id: entry.list_id, entryId: entry.id }
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
                        <Text className="text-white ml-1">{entry.rating || '-'}</Text>
                      </View>
                    </View>
                    <Text className="text-gray-400">{entry.lists?.title || 'Unknown List'}</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
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
        
      </ScrollView>
      
      {/* Floating Action Button for quick entry creation */}
      <Pressable 
        onPress={handleCreateEntryPress}
        className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-blue-600 items-center justify-center shadow-2xl shadow-blue-900/30 active:scale-95 active:bg-blue-700 transition-all duration-200"
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </Pressable>
        
      {/* List Picker Modal */}
      <ListPicker 
        isVisible={isListPickerVisible} 
        onClose={() => setIsListPickerVisible(false)}
        onSelectList={handleSelectList}
      />
    </SafeAreaView>
  );
}
