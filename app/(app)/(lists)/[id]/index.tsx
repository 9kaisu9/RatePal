import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { useState, useEffect } from 'react';
import { listService, customFieldService, entryService, fieldValueService } from '../../../services/supabaseService';
import { Tables } from '../../../lib/supabase';



export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const [list, setList] = useState<Tables['lists'] | null>(null);
  const [entries, setEntries] = useState<Tables['entries'][]>([]);
  const [customFields, setCustomFields] = useState<Tables['custom_fields'][]>([]);
  const [fieldValues, setFieldValues] = useState<Tables['field_values'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch list data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch list
        const listData = await listService.getListById(id as string);
        if (!listData) throw new Error('List not found');
        setList(listData);
        
        // Fetch entries
        const entriesData = await entryService.getEntriesByListId(id as string);
        setEntries(entriesData || []);
        
        // Fetch custom fields
        const fieldsData = await customFieldService.getCustomFieldsByListId(id as string);
        setCustomFields(fieldsData || []);
        
        // Fetch field values for all entries
        if (entriesData && entriesData.length > 0) {
          const entryIds = entriesData.map((entry: Tables['entries']) => entry.id);
          const valuesData = await fieldValueService.getFieldValuesByEntryIds(entryIds);
          setFieldValues(valuesData || []);
        }
      } catch (err: any) {
        console.error('Error loading list data:', err);
        setError(err.message || 'An error occurred loading the list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white text-lg mt-4">Loading list...</Text>
      </View>
    );
  }
  
  if (error || !list) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg">{error || 'List not found'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-3 tracking-tight">{list.title}</Text>
            <Text className="text-gray-300 text-lg leading-relaxed mb-3">{list.description}</Text>
            <Text className="text-gray-500 text-sm font-medium">Last updated {new Date(list.updated_at).toLocaleDateString()}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-8">
            <Button
              variant="outline"
              className="rounded-xl border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all px-4 py-2"
              onPress={() => router.push({ 
                pathname: '/(app)/(lists)/[id]/settings',
                params: { id: id.toString() }
              })}
            >
              Settings
            </Button>
            <Link href={{ pathname: '/(app)/(lists)/[id]/entry/create', params: { id } }} asChild>
              <Button 
                variant="primary"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all px-6 py-2.5 shadow-lg shadow-blue-900/20"
              >
                Add Entry
              </Button>
            </Link>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <Text className="text-xl font-semibold text-white mb-2 tracking-tight">{entries.length}</Text>
            <Text className="text-gray-300 mb-4 leading-relaxed">Entries</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <Text className="text-2xl font-bold text-white">
              {(entries
                .filter(e => e.rating !== null)
                .reduce((sum, e) => sum + (e.rating || 0), 0) / entries.length || 0
              ).toFixed(1)}
            </Text>
            <Text className="text-gray-300 mb-4 leading-relaxed">Avg Rating</Text>
          </View>
        </View>

        {/* Entries */}
        {entries.length > 0 ? (
          <View className="space-y-4">
            {entries.map((entry) => {
              const entryFieldValues = fieldValues.filter(fv => fv.entry_id === entry.id);
              const customFieldsWithValues = customFields.map(field => ({
                field,
                value: entryFieldValues.find((v: Tables['field_values']) => v.field_id === field.id)
              }));
              
              return (
                <Link
                  key={entry.id}
                  href={{ pathname: '/(app)/(lists)/[id]/entry/[entryId]', params: { id: id.toString(), entryId: entry.id.toString() } }}
                  asChild
                >
                  <Pressable 
                    className="p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200 mb-4 active:scale-[0.99]"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-white">
                        {entry.title}
                      </Text>
                      {entry.rating !== null && (
                        <View className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-4 py-1.5 rounded-full self-start border border-blue-500/30 backdrop-blur-sm">
                          <Text className="text-sm font-medium text-blue-200">{entry.rating}/5 ⭐️</Text>
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
                        
                        if (value.value_text) displayValue = value.value_text;
                        else if (value.value_number) {
                          if (field.name === 'Price Range') {
                            displayValue = '•'.repeat(value.value_number);
                          } else {
                            displayValue = value.value_number.toString();
                          }
                        }
                        
                        if (!displayValue) return null;
                        
                        return (
                          <View key={field.id} className="bg-gray-700/50 backdrop-blur-sm px-4 py-1.5 rounded-full mr-2 mb-2 border border-gray-600/30">
                            <Text className="text-sm font-medium text-gray-200">{field.name}: {displayValue}</Text>
                          </View>
                        );
                      })}
                      <View className="bg-gray-700/50 backdrop-blur-sm px-4 py-1.5 rounded-full mr-2 mb-2 border border-gray-600/30">
                        <Text className="text-sm font-medium text-gray-200">{new Date(entry.created_at).toLocaleDateString()}</Text>
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
