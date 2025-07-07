import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { entryService, fieldValueService, customFieldService } from '../../../../services/supabaseService';
import { Tables } from '../../../../lib/supabase';

export default function EntryDetailScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState<Tables['entries'] | null>(null);
  const [fieldValues, setFieldValues] = useState<Tables['field_values'][]>([]);
  const [customFields, setCustomFields] = useState<Tables['custom_fields'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch entry data and field values
  useEffect(() => {
    const fetchEntryData = async () => {
      if (!entryId || typeof entryId !== 'string') {
        setError('Invalid entry ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch entry details
        const entryData = await entryService.getEntryById(entryId);
        setEntry(entryData);

        // Fetch field values for this entry
        const fieldValueData = await fieldValueService.getFieldValuesByEntryId(entryId);
        setFieldValues(fieldValueData);

        // Fetch custom fields for the list to get field names and types
        if (id && typeof id === 'string') {
          const customFieldsData = await customFieldService.getCustomFieldsByListId(id);
          setCustomFields(customFieldsData);
        }
      } catch (err: any) {
        console.error('Error fetching entry data:', err);
        setError(err.message || 'Failed to load entry data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryData();
  }, [entryId, id]);

  const handleDelete = async () => {
    if (!entryId || typeof entryId !== 'string') return;

    try {
      // First confirm with the user
      Alert.alert(
        'Delete Entry',
        'Are you sure you want to delete this entry? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              await entryService.deleteEntry(entryId);
              router.back();
            } 
          },
        ]
      );
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      Alert.alert('Error', err.message || 'Failed to delete entry');
      setIsLoading(false);
    }
  };

  // Helper function to get field name by ID
  const getFieldName = (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    return field?.name || 'Unknown Field';
  };

  // Helper function to get field type by ID
  const getFieldType = (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    return field?.field_type_id || null;
  };

  // Helper function to format field value based on type
  const formatFieldValue = (fieldValue: Tables['field_values']) => {
    const fieldType = getFieldType(fieldValue.field_id);
    
    // Handle multi-select fields (type 6)
    if (fieldType === 6 && fieldValue.value_text !== null) {
      return (
        <View className="flex-row flex-wrap">
          {fieldValue.value_text.split(',').map((tag, index) => (
            <View 
              key={index} 
              className="bg-blue-600/30 border border-blue-500/30 rounded-full px-2 py-1 mr-2 mb-1"
            >
              <Text className="text-white text-sm">{tag}</Text>
            </View>
          ))}
        </View>
      );
    }
    
    // Handle other field types
    if (fieldValue.value_text !== null) return fieldValue.value_text;
    if (fieldValue.value_number !== null) return fieldValue.value_number.toString();
    if (fieldValue.value_boolean !== null) return fieldValue.value_boolean ? 'Yes' : 'No';
    if (fieldValue.value_date !== null) {
      return new Date(fieldValue.value_date).toLocaleDateString();
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-400 mt-4">Loading entry details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !entry) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">Error</Text>
          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
        </View>
        <View className="bg-red-900/20 p-4 rounded-lg border border-red-800/30">
          <Text className="text-red-400">{error || 'Entry not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">{entry.title}</Text>
          <Button variant="outline" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-8">
          <View className="flex-row items-center mb-6">
            <MaterialCommunityIcons name="star" size={24} color="#FCD34D" />
            <Text className="text-2xl text-white font-bold ml-2">
              {entry.rating || 'Not rated'}
            </Text>
          </View>
          
          {entry.description && (
            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-1">Description</Text>
              <Text className="text-white">{entry.description}</Text>
            </View>
          )}

          {fieldValues.length > 0 && (
            <View className="space-y-4">
              {fieldValues.map(fieldValue => (
                <View key={fieldValue.id}>
                  <Text className="text-gray-400 text-sm mb-1">
                    {getFieldName(fieldValue.field_id)}
                  </Text>
                  <Text className="text-white">
                    {formatFieldValue(fieldValue)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text className="text-gray-400 mt-6">Added on {new Date(entry.created_at).toLocaleDateString()}</Text>
        </View>

        <View className="space-y-4">
          <Button
            variant="outline"
            onPress={() => router.push(`/(app)/(lists)/${id}/entry/${entryId}/edit`)}
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
