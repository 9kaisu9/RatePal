import { View, Text, ScrollView, ActivityIndicator, Alert, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { listService, customFieldService, ratingSystemService, listRatingSettingsService } from '../../services/supabaseService';
import { Tables } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { styled } from 'nativewind';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Default guest user ID - use this instead of null for databases that don't allow null user_id
// This is a valid UUID format that can be used for guest users
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

// Field type options with properly typed icons
type IconName = 'text' | 'numeric' | 'calendar' | 'checkbox-marked-outline' | 'format-list-bulleted' | 'format-list-checks' | 'close' | 'checkbox-marked' | 'checkbox-blank-outline' | 'format-list-text';

const fieldTypes = [
  { id: 1, name: 'text', label: 'Text', icon: 'text' as IconName },
  { id: 2, name: 'number', label: 'Number', icon: 'numeric' as IconName },
  { id: 3, name: 'date', label: 'Date', icon: 'calendar' as IconName },
  { id: 4, name: 'boolean', label: 'Yes/No', icon: 'checkbox-marked-outline' as IconName },
  { id: 5, name: 'select', label: 'Select', icon: 'format-list-bulleted' as IconName },
  { id: 6, name: 'multi-select', label: 'Multi-Select', icon: 'format-list-checks' as IconName },
];

// Interface for custom field
interface CustomField {
  name: string;
  field_type_id: number;
  is_required: boolean;
  options?: string[];
  position: number;
}

export default function CreateListScreen() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState(1); // Default to text
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [selectOptions, setSelectOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rating system states
  const [ratingSystems, setRatingSystems] = useState<Tables['rating_systems'][]>([]);
  const [selectedRatingSystem, setSelectedRatingSystem] = useState<Tables['rating_systems'] | null>(null);
  const [showRatingSystemModal, setShowRatingSystemModal] = useState(false);
  const [isLoadingRatingSystems, setIsLoadingRatingSystems] = useState(true);

  // Fetch rating systems
  useEffect(() => {
    const fetchRatingSystems = async () => {
      try {
        setIsLoadingRatingSystems(true);
        const systems = await ratingSystemService.getRatingSystems();
        setRatingSystems(systems);
        
        // Default to the first rating system (Five Stars)
        if (systems.length > 0) {
          setSelectedRatingSystem(systems[0]);
        }
      } catch (err: any) {
        console.error('Error fetching rating systems:', err);
        setError('Failed to load rating systems');
      } finally {
        setIsLoadingRatingSystems(false);
      }
    };
    
    fetchRatingSystems();
  }, []);

  // Handle adding a select option
  const handleAddOption = () => {
    if (!newOption.trim()) {
      return;
    }
    setSelectOptions([...selectOptions, newOption.trim()]);
    setNewOption('');
  };

  // Handle removing a select option
  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...selectOptions];
    updatedOptions.splice(index, 1);
    setSelectOptions(updatedOptions);
  };

  // Add a new custom field
  const handleAddField = () => {
    if (!newFieldName.trim()) {
      Alert.alert('Error', 'Field name cannot be empty');
      return;
    }

    // For select or multi-select type, validate that there are options
    if ((newFieldType === 5 || newFieldType === 6) && selectOptions.length === 0) {
      Alert.alert('Error', 'Select fields must have at least one option');
      return;
    }

    const newField: CustomField = {
      name: newFieldName,
      field_type_id: newFieldType,
      is_required: newFieldRequired,
      position: customFields.length + 1,
      // Add options for select and multi-select fields
      options: (newFieldType === 5 || newFieldType === 6) ? selectOptions : undefined
    };

    setCustomFields([...customFields, newField]);
    setNewFieldName('');
    setNewFieldType(1);
    setNewFieldRequired(false);
    setSelectOptions([]);
  };

  // Remove a field
  const handleRemoveField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    
    // Update positions
    const reorderedFields = updatedFields.map((field, idx) => ({
      ...field,
      position: idx + 1
    }));
    
    setCustomFields(reorderedFields);
  };

  // Create the list in Supabase
  const handleCreateList = async () => {
    // Debug logging for custom fields
    console.log('Custom fields before creation:', customFields);
    if (!title.trim()) {
      Alert.alert('Error', 'List title cannot be empty');
      return;
    }

    if (!selectedRatingSystem) {
      Alert.alert('Error', 'Please select a rating system');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Create the list
      const newList = await listService.createList({
        title,
        description: description || null,
        user_id: session?.user?.id || GUEST_USER_ID,  // Use default guest ID instead of null
        is_public: false,
      });

      // Create list rating settings
      await listRatingSettingsService.createListRatingSettings({
        list_id: newList.id,
        rating_system_id: selectedRatingSystem.id,
        is_required: true,
        display_position: 0
      });

      // Create custom fields for the list
      if (customFields.length > 0) {
        const fieldPromises = customFields.map(field => {
          return customFieldService.createCustomField({
            list_id: newList.id,
            name: field.name,
            field_type_id: field.field_type_id,
            is_required: field.is_required,
            position: field.position,
            options: field.options ? JSON.stringify(field.options) : null,
          });
        });

        await Promise.all(fieldPromises);
      }

      // Navigate back to lists
      router.replace('/(app)/(lists)');
    } catch (err: any) {
      console.error('Error creating list:', err);
      
      // Check for specific database errors
      if (err.code === '22P02' && err.message?.includes('uuid')) {
        setError('User ID format error. Please make sure you\'re signed in or the database allows guest users.');
        Alert.alert(
          'Database Configuration Issue',
          'The database needs to be configured to allow guest users. Please update the "user_id" column in the "lists" table to allow NULL values.'
        );
      } else if (err.code === '23502') { // not-null violation
        setError('The database requires a user ID. Please sign in or update the database configuration.');
        Alert.alert(
          'Database Configuration Issue',
          'The database needs to be configured to allow guest users. Please update the "user_id" column in the "lists" table to allow NULL values.'
        );
      } else if (err.code === '23503') { // foreign key violation
        setError('Foreign key constraint violation. The user ID does not exist in the users table.');
        Alert.alert(
          'Database Configuration Issue',
          'The guest user needs to be created in the users table. Run the createGuestUser.js script to fix this.'
        );
      } else if (err.code === '42501') { // permission denied
        setError('Permission denied. Row-Level Security policy is preventing list creation.');
        Alert.alert(
          'Database Configuration Issue',
          'Update the RLS policies in Supabase to allow list creation for guest users.'
        );
      } else {
        // Show detailed error information for debugging
        const errorDetails = JSON.stringify(err, null, 2);
        setError(`Failed to create list: ${err.message || 'Unknown error'}`);
        console.log('Detailed error:', errorDetails);
        Alert.alert(
          'Error Creating List',
          `Error Code: ${err.code || 'Unknown'}
Message: ${err.message || 'Unknown'}
Details: ${err.details || 'None'}`
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900">
      <StyledScrollView className="flex-1 p-6">
        <StyledView className="flex-row items-center justify-between mb-8">
          <StyledText className="text-2xl font-bold text-white">Create New List</StyledText>
          <Button variant="outline" onPress={() => router.back()}>Cancel</Button>
        </StyledView>

        {/* List details */}
        <StyledView className="mb-6">
          <StyledText className="text-lg font-bold mb-2 text-white">List Details</StyledText>
          <Input
            placeholder="List Title"
            value={title}
            onChangeText={setTitle}
            className="mb-3"
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="mb-3"
          />
          
          {/* Rating System Selection */}
          <StyledText className="text-base font-medium mb-2 text-white">Rating System</StyledText>
          {isLoadingRatingSystems ? (
            <ActivityIndicator size="small" color="#0ea5e9" />
          ) : (
            <StyledPressable 
              className="flex-row items-center justify-between p-3 bg-gray-800 rounded-md mb-3"
              onPress={() => setShowRatingSystemModal(true)}
            >
              <StyledText className="text-white">
                {selectedRatingSystem ? selectedRatingSystem.name : 'Select a rating system'}
              </StyledText>
              <MaterialCommunityIcons name="chevron-down" size={24} color="#ffffff" />
            </StyledPressable>
          )}
          
          {selectedRatingSystem && (
            <StyledView className="bg-gray-800 p-3 rounded-md mb-3">
              <StyledText className="text-white mb-1">Range: {selectedRatingSystem.min_value} to {selectedRatingSystem.max_value}</StyledText>
              <StyledText className="text-white mb-1">Step: {selectedRatingSystem.step_value}</StyledText>
              <StyledText className="text-white">Display: {selectedRatingSystem.display_type}</StyledText>
            </StyledView>
          )}
        </StyledView>

        {/* Custom Fields Section */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold text-white mb-4">
            Custom Fields
          </StyledText>

          {/* Existing fields */}
          {customFields.length > 0 ? (
            <StyledView className="space-y-3 mb-6">
              {customFields.map((field, index) => (
                <StyledView 
                  key={`${field.name}-${index}`} 
                  className="p-4 rounded-lg border border-gray-700 bg-gray-800 flex-row justify-between items-center"
                >
                  <StyledView className="flex-1">
                    <StyledView className="flex-row items-center">
                      <MaterialCommunityIcons 
                        name={(fieldTypes.find(t => t.id === field.field_type_id)?.icon || 'text') as IconName} 
                        size={18} 
                        color="#60A5FA" 
                      />
                      <StyledText className="text-white font-medium text-base ml-2">
                        {field.name}
                      </StyledText>
                      {field.is_required && (
                        <StyledView className="ml-2 px-2 py-0.5 bg-blue-500/20 rounded">
                          <StyledText className="text-blue-400 text-xs">Required</StyledText>
                        </StyledView>
                      )}
                    </StyledView>
                    <StyledText className="text-gray-400 text-sm mt-1">
                      {fieldTypes.find(t => t.id === field.field_type_id)?.label}
                    </StyledText>
                    {(field.field_type_id === 5 || field.field_type_id === 6) && field.options && field.options.length > 0 && (
                      <StyledView className="mt-2 pl-2 border-l-2 border-gray-700">
                        <StyledText className="text-gray-500 text-xs mb-1">Options:</StyledText>
                        {field.options.map((option, idx) => (
                          <StyledText key={idx} className="text-gray-400 text-xs">
                            • {option}
                          </StyledText>
                        ))}
                      </StyledView>
                    )}
                  </StyledView>
                  <StyledPressable 
                    className="p-2 rounded-full bg-red-500/20" 
                    onPress={() => handleRemoveField(index)}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="#F87171" />
                  </StyledPressable>
                </StyledView>
              ))}
            </StyledView>
          ) : (
            <StyledView className="p-6 rounded-lg border border-gray-700 bg-gray-800/50 items-center justify-center mb-6">
              <MaterialCommunityIcons name="format-list-text" size={32} color="#4B5563" />
              <StyledText className="text-gray-400 text-center mt-2 mb-1">
                No custom fields added yet
              </StyledText>
              <StyledText className="text-gray-500 text-center text-sm">
                Add fields to collect specific information
              </StyledText>
            </StyledView>
          )}

          {/* Add new field */}
          <StyledView className="p-4 rounded-lg border border-gray-700 bg-gray-800/70">
            <StyledText className="text-white font-medium mb-3">Add New Field</StyledText>
            
            <Input
              label="Field Name"
              placeholder="Enter field name"
              value={newFieldName}
              onChangeText={setNewFieldName}
              className="mb-3"
            />

            <StyledText className="text-gray-300 text-sm mb-2">Field Type</StyledText>
            <StyledView className="flex-row flex-wrap mb-3">
              {fieldTypes.map(type => (
                <StyledPressable
                  key={type.id}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg flex-row items-center ${newFieldType === type.id ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onPress={() => setNewFieldType(type.id)}
                >
                  <MaterialCommunityIcons name={type.icon as IconName} size={16} color="white" />
                  <StyledText className="text-white ml-1">{type.label}</StyledText>
                </StyledPressable>
              ))}
            </StyledView>

            <StyledPressable 
              className="flex-row items-center mb-4" 
              onPress={() => setNewFieldRequired(!newFieldRequired)}
            >
              <MaterialCommunityIcons 
                name={newFieldRequired ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                size={24} 
                color={newFieldRequired ? '#60A5FA' : '#6B7280'} 
              />
              <StyledText className="text-gray-300 ml-2">Required Field</StyledText>
            </StyledPressable>

            {/* Select/Multi-Select Options UI - Only show when Select or Multi-Select field type is chosen */}
            {(newFieldType === 5 || newFieldType === 6) && (
              <StyledView className="mb-4 p-3 rounded-lg border border-gray-700 bg-gray-800/50">
                <StyledText className="text-white font-medium mb-2">{newFieldType === 6 ? 'Multi-Select Options' : 'Select Options'}</StyledText>
                
                {/* Display existing options */}
                {selectOptions.length > 0 && (
                  <StyledView className="mb-3">
                    {selectOptions.map((option, index) => (
                      <StyledView key={index} className="flex-row justify-between items-center py-2 border-b border-gray-700">
                        <StyledText className="text-gray-300">{option}</StyledText>
                        <StyledPressable 
                          className="p-1 rounded-full bg-red-500/20" 
                          onPress={() => handleRemoveOption(index)}
                        >
                          <MaterialCommunityIcons name="close" size={14} color="#F87171" />
                        </StyledPressable>
                      </StyledView>
                    ))}
                  </StyledView>
                )}
                
                {/* Add new option */}
                <StyledView className="flex-row items-center">
                  <TextInput
                    value={newOption}
                    onChangeText={setNewOption}
                    placeholder="Add an option"
                    placeholderTextColor="#6B7280"
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg mr-2"
                    onSubmitEditing={handleAddOption}
                  />
                  <Button
                    variant="outline"
                    onPress={handleAddOption}
                    className="px-3 py-1"
                  >
                    Add
                  </Button>
                </StyledView>
              </StyledView>
            )}

            <Button
              variant="outline"
              onPress={handleAddField}
              className="self-end"
            >
              Add Field
            </Button>
          </StyledView>
        </StyledView>

        {error && (
          <StyledView className="mb-4 p-3 bg-red-500/20 rounded-lg">
            <StyledText className="text-red-400">{error}</StyledText>
          </StyledView>
        )}

        {isCreating ? (
          <Button
            variant="primary"
            onPress={handleCreateList}
            disabled={true}
            className="mb-8"
          >
            <StyledView className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <StyledText className="text-white ml-2">Creating...</StyledText>
            </StyledView>
          </Button>
        ) : (
          <Button
            variant="primary"
            onPress={handleCreateList}
            disabled={!title.trim()}
            className="mb-8"
          >
            Create List
          </Button>
        )}
      </StyledScrollView>

      {/* Rating System Selection Modal */}
      <Modal
        visible={showRatingSystemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingSystemModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Select Rating System</Text>
              <Pressable onPress={() => setShowRatingSystemModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </Pressable>
            </View>
            
            <ScrollView className="max-h-96">
              {ratingSystems.map((system) => (
                <Pressable
                  key={system.id}
                  className={`p-4 border-b border-gray-800 ${selectedRatingSystem?.id === system.id ? 'bg-blue-900/30' : ''}`}
                  onPress={() => {
                    setSelectedRatingSystem(system);
                    setShowRatingSystemModal(false);
                  }}
                >
                  <Text className="text-white font-medium mb-1">{system.name}</Text>
                  <Text className="text-gray-400 text-sm">
                    Range: {system.min_value} to {system.max_value}, Step: {system.step_value}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Display Type: {system.display_type}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            
            <Button 
              variant="primary" 
              onPress={() => setShowRatingSystemModal(false)}
              className="mt-4"
            >
              Done
            </Button>
          </View>
        </View>
      </Modal>
    </StyledSafeAreaView>
  );
}
