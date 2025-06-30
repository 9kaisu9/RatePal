import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { useState, useEffect } from 'react';

// Placeholder data - replace with real data from backend
const entryData = {
  id: '1',
  name: 'Sushi Place',
  rating: '4.5',
  details: {
    cuisine: 'Japanese',
    price: '4',
    location: 'Downtown',
    notes: 'Great sashimi, nice atmosphere. A bit pricey but worth it for special occasions.',
  },
};

const listTemplate = {
  id: '1',
  name: 'Restaurants',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'cuisine', type: 'text', required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'location', type: 'text', required: false },
    { name: 'rating', type: 'number', required: true },
    { name: 'notes', type: 'text', required: false },
  ],
};

export default function EditEntryScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    // TODO: Fetch real entry data
    setFormData({
      name: entryData.name,
      rating: entryData.rating,
      ...entryData.details,
    });
  }, []);

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Save entry:', formData);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">Edit Entry</Text>
          <Button variant="outline" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>

        <View className="space-y-4 mb-8">
          {listTemplate.fields.map((field) => (
            <Input
              key={field.name}
              label={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
              placeholder={`Enter ${field.name}`}
              value={formData[field.name] || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, [field.name]: text }))
              }
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              required={field.required}
            />
          ))}
        </View>

        <Button
          variant="primary"
          onPress={handleSave}
          className="mb-4"
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
