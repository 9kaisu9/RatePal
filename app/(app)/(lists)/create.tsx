import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useState } from 'react';

const templates = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    fields: [
      { name: 'cuisine', type: 'text', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'location', type: 'text', required: false },
    ],
  },
  {
    id: 'movies',
    name: 'Movies',
    fields: [
      { name: 'genre', type: 'text', required: true },
      { name: 'director', type: 'text', required: true },
      { name: 'year', type: 'number', required: true },
    ],
  },
  {
    id: 'books',
    name: 'Books',
    fields: [
      { name: 'author', type: 'text', required: true },
      { name: 'genre', type: 'text', required: true },
      { name: 'year', type: 'number', required: false },
    ],
  },
];

export default function CreateListScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleCreate = () => {
    // TODO: Implement list creation logic
    console.log('Create list:', { name, description, selectedTemplate });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-2xl font-bold text-white">Create New List</Text>
          <Button variant="outline" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>

        <Input
          label="List Name"
          placeholder="Enter list name"
          value={name}
          onChangeText={setName}
          className="mb-4"
        />

        <Input
          label="Description (Optional)"
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          className="mb-8"
        />

        <Text className="text-lg font-semibold text-white mb-4">
          Choose a Template
        </Text>

        <View className="space-y-4 mb-8">
          {templates.map((template) => (
            <View
              key={template.id}
              className={`p-4 rounded-lg border ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-medium text-lg">
                    {template.name}
                  </Text>
                  <Text className="text-gray-400">
                    {template.fields.length} fields
                  </Text>
                </View>
                <Button
                  variant={selectedTemplate === template.id ? 'primary' : 'outline'}
                  onPress={() => setSelectedTemplate(template.id)}
                >
                  {selectedTemplate === template.id ? 'Selected' : 'Select'}
                </Button>
              </View>
            </View>
          ))}
        </View>

        <Button
          variant="primary"
          onPress={handleCreate}
          className="mb-4"
        >
          Create List
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
