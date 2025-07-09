import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, Switch, Pressable, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useState, useEffect } from 'react';
import { listService, customFieldService, entryService, fieldValueService, listRatingSettingsService, ratingSystemService } from '../../../../services/supabaseService';
import { Tables } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { styled } from 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Default guest user ID
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Field type IDs
const FIELD_TYPES = {
  TEXT: 1,
  NUMBER: 2,
  DATE: 3,
  BOOLEAN: 4,
  SELECT: 5,
  MULTI_SELECT: 6  // New field type for multi-select/tags
};

interface FormErrors {
  [key: string]: string;
}

type FormData = {
  title: string;
  description: string;
  rating: string;
  [key: string]: string | boolean | null;
};

export default function CreateEntryScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [list, setList] = useState<Tables['lists'] | null>(null);
  const [customFields, setCustomFields] = useState<Tables['custom_fields'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Record<string, string>>({});
  const [showSelectOptions, setShowSelectOptions] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  
  // Rating system states
  const [ratingSystem, setRatingSystem] = useState<Tables['rating_systems'] | null>(null);
  const [listRatingSettings, setListRatingSettings] = useState<Tables['list_rating_settings'] | null>(null);
  
  // Handle date selection
  const handleDateChange = (fieldId: string, date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    setSelectedDate(prev => ({ ...prev, [fieldId]: formattedDate }));
    setFormData(prev => ({ ...prev, [fieldId]: formattedDate }));
    setShowDatePicker(null);
    
    // Clear any errors for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    rating: '3',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch list and custom fields data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof id !== 'string') {
          throw new Error('Invalid list ID');
        }
        
        // Fetch list details
        const listData = await listService.getListById(id);
        setList(listData);
        
        // Fetch custom fields for this list
        const fieldsData = await customFieldService.getCustomFieldsByListId(id);
        setCustomFields(fieldsData);
        
        // Fetch list rating settings
        const ratingSettingsData = await listRatingSettingsService.getListRatingSettings(id);
        setListRatingSettings(ratingSettingsData);
        
        // Fetch rating system
        if (ratingSettingsData) {
          const ratingSystemData = await ratingSystemService.getRatingSystemById(ratingSettingsData.rating_system_id);
          setRatingSystem(ratingSystemData);
          
          // Initialize rating with middle value
          const minValue = ratingSystemData.min_value;
          const maxValue = ratingSystemData.max_value;
          const middleValue = (minValue + maxValue) / 2;
          const roundedMiddleValue = Math.round(middleValue / ratingSystemData.step_value) * ratingSystemData.step_value;
          
          setFormData(prev => ({
            ...prev,
            rating: roundedMiddleValue.toString()
          }));
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load list data');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  // Render rating input based on rating system type
  const renderRatingInput = () => {
    if (!ratingSystem) {
      return (
        <Input
          label="Rating (1-5)"
          placeholder="Enter rating"
          value={formData.rating}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, rating: text }));
            if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
          }}
          keyboardType="numeric"
          error={errors.rating}
          className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl px-4 py-3"
        />
      );
    }
    
    const { min_value, max_value, step_value, display_type } = ratingSystem;
    const currentValue = parseFloat(formData.rating) || min_value;
    
    switch (display_type) {
      case 'stars':
        // Star rating display
        return (
          <View className="mb-4">
            <Text className="text-white text-base font-medium mb-2">Rating</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = min_value + (index * ((max_value - min_value) / 4));
                  const isFilled = currentValue >= starValue;
                  return (
                    <Pressable 
                      key={index}
                      onPress={() => {
                        const newValue = starValue;
                        setFormData(prev => ({ ...prev, rating: newValue.toString() }));
                        if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
                      }}
                      className="p-1"
                    >
                      <MaterialCommunityIcons 
                        name={isFilled ? "star" : "star-outline"} 
                        size={32} 
                        color={isFilled ? "#F59E0B" : "#6B7280"} 
                      />
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-white text-lg">{currentValue}</Text>
            </View>
            {errors.rating && <Text className="text-red-500 text-sm mt-1">{errors.rating}</Text>}
          </View>
        );
        
      case 'emoji':
        // Emoji rating display
        const emojis = ['😢', '😕', '😐', '🙂', '😄'];
        return (
          <View className="mb-4">
            <Text className="text-white text-base font-medium mb-2">Rating</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row">
                {emojis.map((emoji, index) => {
                  const emojiValue = min_value + (index * ((max_value - min_value) / 4));
                  const isSelected = Math.abs(currentValue - emojiValue) < step_value;
                  return (
                    <Pressable 
                      key={index}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, rating: emojiValue.toString() }));
                        if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
                      }}
                      className={`p-2 rounded-full ${isSelected ? 'bg-blue-500/30' : ''}`}
                    >
                      <Text className="text-3xl">{emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-white text-lg">{currentValue}</Text>
            </View>
            {errors.rating && <Text className="text-red-500 text-sm mt-1">{errors.rating}</Text>}
          </View>
        );
        
      case 'slider':
      case 'percentage':
      default:
        // Slider or numeric input
        return (
          <View className="mb-4">
            <Text className="text-white text-base font-medium mb-2">Rating ({min_value} to {max_value})</Text>
            <Slider
              minimumValue={min_value}
              maximumValue={max_value}
              step={step_value}
              value={currentValue}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, rating: value.toString() }));
                if (errors.rating) setErrors(prev => ({ ...prev, rating: '' }));
              }}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="#4B5563"
              thumbTintColor="#60A5FA"
              className="mb-2"
            />
            <View className="flex-row justify-between">
              <Text className="text-gray-400">{min_value}</Text>
              <Text className="text-white font-medium">{currentValue}</Text>
              <Text className="text-gray-400">{max_value}</Text>
            </View>
            {errors.rating && <Text className="text-red-500 text-sm mt-1">{errors.rating}</Text>}
          </View>
        );
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Validate rating
    if (!formData.rating) {
      newErrors.rating = 'Rating is required';
    } else if (ratingSystem) {
      const ratingValue = parseFloat(formData.rating);
      if (isNaN(ratingValue) || ratingValue < ratingSystem.min_value || ratingValue > ratingSystem.max_value) {
        newErrors.rating = `Rating must be between ${ratingSystem.min_value} and ${ratingSystem.max_value}`;
      }
    } else {
      const ratingValue = parseFloat(formData.rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        newErrors.rating = 'Rating must be between 1 and 5';
      }
    }

    // Validate custom fields
    customFields.forEach((field) => {
      const fieldId = field.id;
      const fieldValue = formData[fieldId];
      
      if (field.is_required) {
        // Check if field is empty based on its type
        let isEmpty = false;
        
        if (field.field_type_id === FIELD_TYPES.TEXT) {
          isEmpty = !fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim());
        } else if (field.field_type_id === FIELD_TYPES.NUMBER) {
          isEmpty = fieldValue === null || fieldValue === undefined || fieldValue === '';
        } else if (field.field_type_id === FIELD_TYPES.DATE) {
          isEmpty = !fieldValue;
        } else if (field.field_type_id === FIELD_TYPES.BOOLEAN) {
          isEmpty = fieldValue === null || fieldValue === undefined;
        } else if (field.field_type_id === FIELD_TYPES.SELECT) {
          isEmpty = !fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim());
        }
        
        if (isEmpty) {
          newErrors[fieldId] = `${field.name} is required`;
        }
      }
      
      // Additional type-specific validations
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        if (field.field_type_id === FIELD_TYPES.NUMBER && typeof fieldValue === 'string') {
          const numValue = Number(fieldValue);
          if (isNaN(numValue)) {
            newErrors[fieldId] = `${field.name} must be a valid number`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      if (!list) {
        throw new Error('List data not available');
      }
      
      // Create entry
      // Always use the guest user ID for now until RLS policies are properly set up
      const userId = GUEST_USER_ID;
      console.log('Creating entry with user ID:', userId);
      
      const entryData = {
        user_id: userId,
        list_id: list.id,
        title: formData.title,
        description: formData.description || null,
        rating: Number(formData.rating),
      };
      
      console.log('Entry data:', entryData);
      const entry = await entryService.createEntry(entryData);
      console.log('Entry created:', entry);
      
      // Create field values for each custom field
      const fieldValuePromises = customFields.map(async (field) => {
        const fieldId = field.id;
        const fieldValue = formData[fieldId];
        
        // Skip undefined values
        if (fieldValue === undefined) return null;
        
        // Prepare field value based on field type
        const fieldValueData = {
          entry_id: entry.id,
          field_id: fieldId,
          value_text: null as string | null,
          value_number: null as number | null,
          value_date: null as string | null,
          value_boolean: null as boolean | null,
          value_json: null as any
        };
        
        if (field.field_type_id === FIELD_TYPES.TEXT) {
          fieldValueData.value_text = typeof fieldValue === 'string' ? fieldValue : null;
        } else if (field.field_type_id === FIELD_TYPES.NUMBER) {
          fieldValueData.value_number = fieldValue ? Number(fieldValue) : null;
        } else if (field.field_type_id === FIELD_TYPES.DATE) {
          fieldValueData.value_date = typeof fieldValue === 'string' ? fieldValue : null;
        } else if (field.field_type_id === FIELD_TYPES.BOOLEAN) {
          fieldValueData.value_boolean = typeof fieldValue === 'boolean' ? fieldValue : null;
        } else if (field.field_type_id === FIELD_TYPES.SELECT) {
          fieldValueData.value_text = typeof fieldValue === 'string' ? fieldValue : null;
        } else if (field.field_type_id === FIELD_TYPES.MULTI_SELECT) {
          // For multi-select, we store the selected tags as a comma-separated string
          // We could also store it as a JSON array, but using a simple string for compatibility
          const tags = selectedTags[fieldId] || [];
          fieldValueData.value_text = tags.length > 0 ? tags.join(',') : null;
        }
        
        console.log('Creating field value:', fieldValueData);
        return fieldValueService.createFieldValue(fieldValueData);
      });
      
      await Promise.all(fieldValuePromises.filter(Boolean) as Promise<any>[]);
      console.log('All field values created successfully');
      
      // Show success message
      Alert.alert(
        'Success',
        'Entry created successfully!',
        [{ text: 'OK', onPress: () => {
          // Navigate back to list detail
          if (list) {
            router.replace(`/(app)/(lists)/${list.id}`);
          }
        }}]
      );
      
    } catch (err: any) {
      console.error('Error creating entry:', err);
      Alert.alert(
        'Error', 
        `Failed to create entry: ${err.message || 'Unknown error'}. Please run the RLS policy script in Supabase.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAIProcessing = () => {
    // In a real implementation, this would navigate to the AI processing screen
    // For now, we'll just log this action
    console.log('AI processing requested');
    alert('AI processing would start here (feature coming soon)');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center" edges={['top']}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="text-white mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !list) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center p-4" edges={['top']}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-white text-lg mt-4 text-center">{error || 'List not found'}</Text>
        <Button 
          variant="primary" 
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all px-4 py-3"
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }
  
  // Date picker for date fields
  const renderDatePickerModal = () => {
    if (!showDatePicker) return null;
    
    const field = customFields.find(f => f.id === showDatePicker);
    if (!field) return null;
    
    // Get the current date value or default to today
    const currentDateValue = formData[showDatePicker] ? new Date(formData[showDatePicker] as string) : new Date();
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!showDatePicker}
        onRequestClose={() => setShowDatePicker(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-800 rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <StyledText className="text-white text-lg font-bold">
                Select {field.name}
              </StyledText>
              <StyledPressable onPress={() => setShowDatePicker(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </StyledPressable>
            </View>
            
            {/* Date picker component */}
            <View className="bg-gray-700 rounded-xl p-4 mb-4 items-center">
              <DateTimePicker
                value={currentDateValue}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date && event.type === 'set') {
                    handleDateChange(showDatePicker, date);
                  }
                }}
                themeVariant="dark"
                textColor="#ffffff"
                accentColor="#3b82f6"
                style={{ width: 320 }}
              />
            </View>
            
            <Button
              variant="primary"
              onPress={() => setShowDatePicker(null)}
              className="rounded-xl bg-blue-600 py-3"
            >
              Done
            </Button>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
      {renderDatePickerModal()}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-bold text-white tracking-tight mb-2">Add Entry</Text>
              <Text className="text-gray-400">to {list?.title}</Text>
            </View>
            <Button 
              variant="outline" 
              onPress={() => router.back()}
              className="rounded-xl border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all px-4 py-2"
            >
              Cancel
            </Button>
          </View>

          <View className="space-y-6 mb-8">
            {/* Basic Fields */}
            <Input
              label="Title"
              placeholder="Enter title"
              value={formData.title}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, title: text }));
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              error={errors.title}
              className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl px-4 py-3"
            />

            <Input
              label="Description"
              placeholder="Enter description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl px-4 py-3"
            />

            {renderRatingInput()}

            {/* Custom Fields */}
            {customFields.map((field) => {
              const fieldId = field.id;
              const fieldValue = formData[fieldId];
              const fieldError = errors[fieldId];
              const isRequired = field.is_required;
              const fieldName = field.name;
              
              // Render different input components based on field type
              switch (field.field_type_id) {
                case FIELD_TYPES.TEXT:
                  return (
                    <Input
                      key={fieldId}
                      label={fieldName}
                      placeholder={`Enter ${fieldName.toLowerCase()}`}
                      value={typeof fieldValue === 'string' ? fieldValue : ''}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, [fieldId]: text }));
                        if (fieldError) setErrors(prev => ({ ...prev, [fieldId]: '' }));
                      }}
                      error={fieldError}
                      required={isRequired}
                      className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl px-4 py-3"
                    />
                  );
                  
                case FIELD_TYPES.NUMBER:
                  return (
                    <Input
                      key={fieldId}
                      label={fieldName}
                      placeholder={`Enter ${fieldName.toLowerCase()}`}
                      value={typeof fieldValue === 'string' ? fieldValue : ''}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, [fieldId]: text }));
                        if (fieldError) setErrors(prev => ({ ...prev, [fieldId]: '' }));
                      }}
                      keyboardType="numeric"
                      error={fieldError}
                      required={isRequired}
                      className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl px-4 py-3"
                    />
                  );
                  
                case FIELD_TYPES.DATE:
                  return (
                    <View key={fieldId} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {fieldName}{isRequired && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable 
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        onPress={() => {
                          console.log('Opening date picker for field:', fieldId);
                          setShowDatePicker(fieldId);
                        }}
                      >
                        <StyledText className="text-white">
                          {formData[fieldId] || selectedDate[fieldId] || `Select ${fieldName.toLowerCase()}`}
                        </StyledText>
                        <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                    </View>
                  );
                  
                case FIELD_TYPES.BOOLEAN:
                  return (
                    <View key={fieldId} className="mb-4">
                      <View className="flex-row justify-between items-center">
                        <StyledText className="text-white text-base">
                          {fieldName}{isRequired && <StyledText className="text-red-500">*</StyledText>}
                        </StyledText>
                        
                        <Switch
                          value={Boolean(fieldValue)}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, [fieldId]: value }));
                            if (fieldError) setErrors(prev => ({ ...prev, [fieldId]: '' }));
                          }}
                          trackColor={{ false: '#3f3f46', true: '#3b82f6' }}
                          thumbColor={Boolean(fieldValue) ? '#60a5fa' : '#d4d4d8'}
                        />
                      </View>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                    </View>
                  );
                  
                case FIELD_TYPES.SELECT:
                  // Parse options for select fields
                  let options: string[] = [];
                  if (field.options) {
                    try {
                      // If options is a string, try to parse it as JSON
                      if (typeof field.options === 'string') {
                        try {
                          const parsedOptions = JSON.parse(field.options);
                          if (Array.isArray(parsedOptions)) {
                            options = parsedOptions;
                          } else if (typeof parsedOptions === 'object' && parsedOptions !== null && Array.isArray(parsedOptions.options)) {
                            // Handle legacy format where options might be stored as { options: [...] }
                            options = parsedOptions.options;
                          } else {
                            // Fallback to comma-separated string
                            options = field.options.split(',').map(opt => opt.trim());
                          }
                        } catch (e) {
                          console.log('JSON parse error for select field:', e);
                          // If JSON parsing fails, treat as comma-separated string
                          options = field.options.split(',').map(opt => opt.trim());
                        }
                      } 
                      // If options is already an array, use it directly
                      else if (Array.isArray(field.options)) {
                        options = field.options;
                      }
                    } catch (e) {
                      console.error('Error parsing select options:', e);
                    }
                  }
                  
                  // Debug output
                  console.log('Field options type for select:', typeof field.options);
                  console.log('Field options value for select:', field.options);
                  console.log('Parsed select options:', options);
                  return (
                    <View key={fieldId} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {fieldName}{isRequired && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable 
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowSelectOptions(fieldId)}
                      >
                        <StyledText className="text-white">
                          {typeof fieldValue === 'string' && fieldValue ? fieldValue : `Select ${fieldName.toLowerCase()}`}
                        </StyledText>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" />
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                      
                      {showSelectOptions === fieldId && (
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={showSelectOptions === fieldId}
                          onRequestClose={() => setShowSelectOptions(null)}
                        >
                          <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-gray-800 rounded-t-xl p-4">
                              <View className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-white text-lg font-bold">
                                  Select {fieldName}
                                </StyledText>
                                <StyledPressable onPress={() => setShowSelectOptions(null)}>
                                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </StyledPressable>
                              </View>
                              
                              <View className="bg-gray-700 rounded-xl mb-4 max-h-80 overflow-hidden">
                                <ScrollView>
                                  {options.map((option) => (
                                    <StyledPressable 
                                      key={option}
                                      className={`px-4 py-4 border-b border-gray-600/30 ${fieldValue === option ? 'bg-blue-600' : ''}`}
                                      onPress={() => {
                                        setFormData(prev => ({ ...prev, [fieldId]: option }));
                                        setShowSelectOptions(null);
                                        if (fieldError) setErrors(prev => ({ ...prev, [fieldId]: '' }));
                                      }}
                                    >
                                      <View className="flex-row justify-between items-center">
                                        <StyledText className="text-white text-base">{option}</StyledText>
                                        {fieldValue === option && (
                                          <MaterialCommunityIcons name="check" size={20} color="#fff" />
                                        )}
                                      </View>
                                    </StyledPressable>
                                  ))}
                                </ScrollView>
                              </View>
                              
                              <Button
                                variant="primary"
                                onPress={() => setShowSelectOptions(null)}
                                className="rounded-xl bg-blue-600 py-3"
                              >
                                Cancel
                              </Button>
                            </View>
                          </View>
                        </Modal>
                      )}
                    </View>
                  );
                  
                case FIELD_TYPES.MULTI_SELECT:
                  // Ensure tagOptions is always an array
                  let tagOptions: string[] = [];
                  if (field.options) {
                    try {
                      // If options is a string, try to parse it as JSON
                      if (typeof field.options === 'string') {
                        try {
                          const parsedOptions = JSON.parse(field.options);
                          if (Array.isArray(parsedOptions)) {
                            tagOptions = parsedOptions;
                          } else if (typeof parsedOptions === 'object' && parsedOptions !== null && Array.isArray(parsedOptions.options)) {
                            // Handle legacy format where options might be stored as { options: [...] }
                            tagOptions = parsedOptions.options;
                          } else {
                            // Fallback to comma-separated string
                            tagOptions = field.options.split(',').map(opt => opt.trim());
                          }
                        } catch (e) {
                          console.log('JSON parse error:', e);
                          // If JSON parsing fails, treat as comma-separated string
                          tagOptions = field.options.split(',').map(opt => opt.trim());
                        }
                      } 
                      // If options is already an array, use it directly
                      else if (Array.isArray(field.options)) {
                        tagOptions = field.options;
                      }
                    } catch (e) {
                      console.error('Error parsing multi-select options:', e);
                    }
                  }
                  
                  // Debug output
                  console.log('Field options type:', typeof field.options);
                  console.log('Field options value:', field.options);
                  console.log('Parsed tag options:', tagOptions);
                  const selectedTagsForField = selectedTags[fieldId] || [];
                  
                  return (
                    <View key={fieldId} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {fieldName}{isRequired && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable 
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowSelectOptions(fieldId)}
                      >
                        <View className="flex-1 flex-row flex-wrap">
                          {selectedTagsForField.length > 0 ? (
                            selectedTagsForField.map((tag, index) => (
                              <View 
                                key={index} 
                                className="bg-blue-600/30 border border-blue-500/30 rounded-full px-2 py-1 mr-2 mb-1 flex-row items-center"
                              >
                                <StyledText className="text-white text-sm">{tag}</StyledText>
                              </View>
                            ))
                          ) : (
                            <StyledText className="text-gray-400">{`Select ${fieldName.toLowerCase()}`}</StyledText>
                          )}
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" />
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                      
                      {showSelectOptions === fieldId && (
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={showSelectOptions === fieldId}
                          onRequestClose={() => setShowSelectOptions(null)}
                        >
                          <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-gray-800 rounded-t-xl p-4">
                              <View className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-white text-lg font-bold">
                                  Select {fieldName}
                                </StyledText>
                                <StyledPressable onPress={() => setShowSelectOptions(null)}>
                                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </StyledPressable>
                              </View>
                              
                              {selectedTagsForField.length > 0 && (
                                <View className="flex-row flex-wrap mb-4">
                                  {selectedTagsForField.map((tag, index) => (
                                    <View 
                                      key={index} 
                                      className="bg-blue-600 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                                    >
                                      <StyledText className="text-white text-sm mr-1">{tag}</StyledText>
                                      <StyledPressable 
                                        onPress={() => {
                                          const updatedTags = selectedTagsForField.filter(t => t !== tag);
                                          setSelectedTags(prev => ({ ...prev, [fieldId]: updatedTags }));
                                          setFormData(prev => ({ ...prev, [fieldId]: updatedTags.join(',') }));
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                      >
                                        <MaterialCommunityIcons name="close" size={16} color="#fff" />
                                      </StyledPressable>
                                    </View>
                                  ))}
                                </View>
                              )}
                              
                              <View className="bg-gray-700 rounded-xl mb-4 max-h-80 overflow-hidden">
                                <ScrollView>
                                  {/* Debug log for tag options */}
                                  {(() => { console.log('Rendering tag options:', tagOptions); return null; })()}
                                  {tagOptions && tagOptions.length > 0 ? tagOptions.map((option) => {
                                    const isSelected = selectedTagsForField.includes(option);
                                    return (
                                      <StyledPressable 
                                        key={option}
                                        className={`px-4 py-4 border-b border-gray-600/30 ${isSelected ? 'bg-blue-600/30' : ''}`}
                                        onPress={() => {
                                          let updatedTags;
                                          if (isSelected) {
                                            // Remove tag if already selected
                                            updatedTags = selectedTagsForField.filter(tag => tag !== option);
                                          } else {
                                            // Add tag if not selected
                                            updatedTags = [...selectedTagsForField, option];
                                          }
                                          setSelectedTags(prev => ({ ...prev, [fieldId]: updatedTags }));
                                          setFormData(prev => ({ ...prev, [fieldId]: updatedTags.join(',') }));
                                          if (fieldError) setErrors(prev => ({ ...prev, [fieldId]: '' }));
                                        }}
                                      >
                                        <View className="flex-row justify-between items-center">
                                          <StyledText className="text-white text-base">{option}</StyledText>
                                          {isSelected && (
                                            <MaterialCommunityIcons name="check" size={20} color="#fff" />
                                          )}
                                        </View>
                                      </StyledPressable>
                                    );
                                  }) : (
                                    <View className="p-4">
                                      <StyledText className="text-gray-400 text-center">No options available</StyledText>
                                    </View>
                                  )}
                                </ScrollView>
                              </View>
                              
                              <Button
                                variant="primary"
                                onPress={() => setShowSelectOptions(null)}
                                className="rounded-xl bg-blue-600 py-3"
                              >
                                Done
                              </Button>
                            </View>
                          </View>
                        </Modal>
                      )}
                    </View>
                  );
                  
                default:
                  return null;
              }
            })}
          </View>

          <View className="flex-row justify-between space-x-4 mb-8">
            <Button
              variant="outline"
              onPress={handleAIProcessing}
              className="flex-1 rounded-xl border-purple-600/50 hover:bg-purple-700/20 hover:border-purple-500/50 transition-all px-4 py-3"
            >
              Use AI Assistant ✨
            </Button>
            
            <Button
              variant="primary"
              onPress={handleCreate}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all px-4 py-3 shadow-lg shadow-blue-900/20"
            >
              Create Entry
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Render date picker modal */}
      {renderDatePickerModal()}
    </SafeAreaView>
  );
}
