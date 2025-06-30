import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { getMockData } from '../../../data/mockData';



export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const list = getMockData.getListById(id as string);
  const entries = getMockData.getEntriesByListId(id as string);
  const customFields = getMockData.getCustomFieldsByListId(id as string);
  const ratingSettings = getMockData.getListRatingSettings(id as string);

  if (!list) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg">List not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-bold text-white">{list.title}</Text>
            {list.description && (
              <Text className="text-gray-400 mt-1">{list.description}</Text>
            )}
            <View className="flex-row items-center mt-2">
              <MaterialCommunityIcons name="clock-outline" size={16} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm ml-1">
                Updated {new Date(list.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              onPress={() => router.push({ 
                pathname: '/(app)/(lists)/[id]/index',
                params: { id }
              })}
            >
              Settings
            </Button>
            <Link href={{ pathname: '/(app)/(lists)/[id]/entry/create', params: { id } }} asChild>
              <Button variant="primary">
                Add Entry
              </Button>
            </Link>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <Text className="text-2xl font-bold text-white">{entries.length}</Text>
            <Text className="text-gray-400">Entries</Text>
          </View>
          {ratingSettings && (
            <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <Text className="text-2xl font-bold text-white">
                {(entries
                  .filter(e => e.rating !== null)
                  .reduce((sum, e) => sum + (e.rating || 0), 0) / entries.length || 0
                ).toFixed(1)}
              </Text>
              <Text className="text-gray-400">Avg Rating</Text>
            </View>
          )}
        </View>

        {/* Entries */}
        {entries.length > 0 ? (
          <View className="space-y-4">
            {entries.map((entry) => {
              const fieldValues = getMockData.getFieldValuesByEntryId(entry.id);
              const customFieldsWithValues = customFields.map(field => ({
                field,
                value: fieldValues.find(v => v.fieldId === field.id)
              }));
              
              return (
                <Link
                  key={entry.id}
                  href={{ pathname: '/(app)/(lists)/[id]/entry/[entryId]', params: { id, entryId: entry.id } }}
                  asChild
                >
                  <Pressable className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-white">
                        {entry.title}
                      </Text>
                      {entry.rating !== null && (
                        <View className="flex-row items-center bg-gray-700 px-3 py-1 rounded-full">
                          <MaterialCommunityIcons
                            name="star"
                            size={16}
                            color="#FCD34D"
                          />
                          <Text className="text-white text-sm ml-1">{entry.rating}</Text>
                        </View>
                      )}
                    </View>

                    {entry.description && (
                      <Text className="text-gray-400 mb-2" numberOfLines={2}>
                        {entry.description}
                      </Text>
                    )}

                    <View className="flex-row flex-wrap gap-2 mt-2">
                      {customFieldsWithValues.map(({ field, value }) => {
                        if (!value) return null;
                        let displayValue = '';
                        
                        if (value.valueText) displayValue = value.valueText;
                        else if (value.valueNumber) {
                          if (field.name === 'Price Range') {
                            displayValue = '•'.repeat(value.valueNumber);
                          } else {
                            displayValue = value.valueNumber.toString();
                          }
                        }
                        
                        if (!displayValue) return null;
                        
                        return (
                          <View key={field.id} className="bg-gray-700 px-2 py-1 rounded">
                            <Text className="text-gray-300 text-sm">
                              {field.name}: {displayValue}
                            </Text>
                          </View>
                        );
                      })}
                      <View className="bg-gray-700 px-2 py-1 rounded">
                        <Text className="text-gray-300 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <MaterialCommunityIcons name="notebook-plus" size={48} color="#4B5563" />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              No entries yet.
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Tap the + button to add your first entry.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
