import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, Switch, Pressable, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useRefresh } from '../../../../../../lib/RefreshContext';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { useState, useEffect } from 'react';
import { listService, customFieldService, entryService, fieldValueService, listRatingSettingsService, ratingSystemService } from '../../../../../services/supabaseService';
import { Tables } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../context/AuthContext';
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
  MULTI_SELECT: 6
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

export default function EditEntryScreen() {
  const { id, entryId } = useLocalSearchParams();
  const { session } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [entry, setEntry] = useState<Tables['entries'] | null>(null);
  const [list, setList] = useState<Tables['lists'] | null>(null);
  const [customFields, setCustomFields] = useState<Tables['custom_fields'][]>([]);
  const [fieldValues, setFieldValues] = useState<Tables['field_values'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showSelectOptions, setShowSelectOptions] = useState<string | null>(null);
  const [showMultiSelectOptions, setShowMultiSelectOptions] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Record<string, string>>({});
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rating system states
  const [ratingSystem, setRatingSystem] = useState<Tables['rating_systems'] | null>(null);
  const [listRatingSettings, setListRatingSettings] = useState<Tables['list_rating_settings'] | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    rating: '3',
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  // Fetch entry data and field values
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof id !== 'string' || typeof entryId !== 'string') {
          throw new Error('Invalid list or entry ID');
        }
        
        // Fetch list details
        const listData = await listService.getListById(id);
        setList(listData);
        
        // Fetch entry details
        const entryData = await entryService.getEntryById(entryId);
        setEntry(entryData);
        
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
        }
        
        // Fetch field values for this entry
        const valuesData = await fieldValueService.getFieldValuesByEntryId(entryId);
        setFieldValues(valuesData);
        
        // Initialize form data with entry values
        const initialFormData: FormData = {
          title: entryData.title || '',
          description: entryData.description || '',
          rating: entryData.rating?.toString() || '3',
        };
        
        // Add field values to form data
        valuesData.forEach(value => {
          const field = fieldsData.find(f => f.id === value.field_id);
          if (field) {
            if (field.field_type_id === FIELD_TYPES.BOOLEAN) {
              initialFormData[field.id] = value.value_boolean === true;
            } else if (field.field_type_id === FIELD_TYPES.MULTI_SELECT) {
              // For multi-select, store the comma-separated values
              initialFormData[field.id] = value.value_text || '';
              
              // Also initialize the selectedTags state
              if (value.value_text) {
                const tags = value.value_text.split(',').map((tag: string) => tag.trim()).filter(Boolean);
                setSelectedTags(prev => ({ ...prev, [field.id]: tags }));
              }
            } else if (field.field_type_id === FIELD_TYPES.DATE) {
              initialFormData[field.id] = value.value_date || '';
              
              // For date fields, also set the selectedDate state
              if (value.value_date) {
                setSelectedDate(prev => ({ ...prev, [field.id]: value.value_date || '' }));
              }
            } else if (field.field_type_id === FIELD_TYPES.NUMBER) {
              initialFormData[field.id] = value.value_number?.toString() || '';
            } else {
              initialFormData[field.id] = value.value_text || '';
            }
          }
        });
        
        setFormData(initialFormData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load entry data');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, entryId]);

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
    customFields.forEach(field => {
      if (field.is_required) {
        const fieldValue = formData[field.id];
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          newErrors[field.id] = `${field.name} is required`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (typeof id !== 'string' || typeof entryId !== 'string') {
        throw new Error('Invalid list or entry ID');
      }
      
      // Update entry basic details
      await entryService.updateEntry(entryId, {
        id: entryId,
        title: formData.title,
        description: formData.description || '',
        rating: parseFloat(formData.rating),
        list_id: id,
        user_id: session?.user?.id || GUEST_USER_ID,
      });
      
      // Update field values
      const fieldValuePromises = customFields.map(async field => {
        // Find existing field value if any
        const existingFieldValue = fieldValues.find(fv => fv.field_id === field.id);
        
        // Prepare field value data based on field type
        let valueData: any = {};
        
        switch (field.field_type_id) {
          case FIELD_TYPES.TEXT:
          case FIELD_TYPES.SELECT:
          case FIELD_TYPES.MULTI_SELECT:
            valueData.value_text = formData[field.id] ? String(formData[field.id]) : null;
            valueData.value_number = null;
            valueData.value_boolean = null;
            valueData.value_date = null;
            break;
            
          case FIELD_TYPES.NUMBER:
            valueData.value_text = null;
            valueData.value_number = formData[field.id] ? parseFloat(formData[field.id] as string) : null;
            valueData.value_boolean = null;
            valueData.value_date = null;
            break;
            
          case FIELD_TYPES.DATE:
            valueData.value_text = null;
            valueData.value_number = null;
            valueData.value_boolean = null;
            valueData.value_date = formData[field.id] as string || null;
            break;
            
          case FIELD_TYPES.BOOLEAN:
            valueData.value_text = null;
            valueData.value_number = null;
            valueData.value_boolean = formData[field.id] as boolean || false;
            valueData.value_date = null;
            break;
        }
        
        if (existingFieldValue) {
          // Update existing field value
          return fieldValueService.updateFieldValue(existingFieldValue.id, {
            id: existingFieldValue.id,
            entry_id: entryId,
            field_id: field.id,
            ...valueData
          });
        } else {
          // Create new field value
          return fieldValueService.createFieldValue({
            entry_id: entryId,
            field_id: field.id,
            ...valueData
          });
        }
      });
      
      await Promise.all(fieldValuePromises);
    
    setIsSubmitting(false);
    
    // Trigger a refresh for all screens using the refresh context
    triggerRefresh();
    console.log('Triggered refresh after saving entry');
    
    router.back();
    } catch (err: any) {
      console.error('Error saving entry:', err);
      setIsSubmitting(false);
      Alert.alert('Error', err.message || 'Failed to save entry');
    }
  };

  // Render date picker modal for date fields
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

  if (loading) {
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
    <StyledSafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledScrollView className="flex-1 p-6">
          <View className="flex-row items-center justify-between mb-8">
            <StyledText className="text-2xl font-bold text-white">Edit Entry</StyledText>
            <Button variant="outline" onPress={() => router.back()}>
              Cancel
            </Button>
          </View>

          {/* Basic entry fields */}
          <View className="space-y-4 mb-8">
            <Input
              label="Title"
              placeholder="Enter title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              error={errors.title}
              required
            />
            
            <Input
              label="Description"
              placeholder="Enter description (optional)"
              value={formData.description || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            {renderRatingInput()}
          </View>

          {/* Custom fields */}
          <View className="space-y-6 mb-8">
            <StyledText className="text-xl font-bold text-white">Details</StyledText>
            
            {customFields.map((field) => {
              const fieldError = errors[field.id];
              
              switch (field.field_type_id) {
                case FIELD_TYPES.TEXT:
                  return (
                    <View key={field.id} className="mb-4">
                      <Input
                        label={field.name}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        value={String(formData[field.id] || '')}
                        onChangeText={(text) => {
                          setFormData(prev => ({ ...prev, [field.id]: text }));
                          if (fieldError) setErrors(prev => ({ ...prev, [field.id]: '' }));
                        }}
                        error={fieldError}
                        required={field.is_required}
                      />
                    </View>
                  );
                  
                case FIELD_TYPES.NUMBER:
                  return (
                    <View key={field.id} className="mb-4">
                      <Input
                        label={field.name}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        value={String(formData[field.id] || '')}
                        onChangeText={(text) => {
                          setFormData(prev => ({ ...prev, [field.id]: text }));
                          if (fieldError) setErrors(prev => ({ ...prev, [field.id]: '' }));
                        }}
                        keyboardType="numeric"
                        error={fieldError}
                        required={field.is_required}
                      />
                    </View>
                  );
                  
                case FIELD_TYPES.DATE:
                  return (
                    <View key={field.id} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {field.name}{field.is_required && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable
                        onPress={() => setShowDatePicker(field.id)}
                        className={`bg-gray-800 border ${fieldError ? 'border-red-500' : 'border-gray-700'} rounded-xl p-4`}
                      >
                        <StyledText className="text-white">
                          {formData[field.id] ? new Date(String(formData[field.id])).toLocaleDateString() : 'Select date'}
                        </StyledText>
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                    </View>
                  );
                  
                case FIELD_TYPES.BOOLEAN:
                  return (
                    <View key={field.id} className="mb-4">
                      <View className="flex-row justify-between items-center bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <StyledText className="text-white text-base">
                          {field.name}{field.is_required && <StyledText className="text-red-500">*</StyledText>}
                        </StyledText>
                        
                        <Switch
                          value={Boolean(formData[field.id])}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, [field.id]: value }));
                            if (fieldError) setErrors(prev => ({ ...prev, [field.id]: '' }));
                          }}
                          trackColor={{ false: '#4B5563', true: '#2563EB' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                    </View>
                  );
                  
                case FIELD_TYPES.SELECT:
                  // Parse options for select fields
                  let selectOptions: string[] = [];
                  if (field.options) {
                    try {
                      // If options is a string, try to parse it as JSON
                      if (typeof field.options === 'string') {
                        try {
                          const parsedOptions = JSON.parse(field.options);
                          if (Array.isArray(parsedOptions)) {
                            selectOptions = parsedOptions;
                          } else if (typeof parsedOptions === 'object' && parsedOptions !== null && Array.isArray(parsedOptions.options)) {
                            // Handle legacy format where options might be stored as { options: [...] }
                            selectOptions = parsedOptions.options;
                          } else {
                            // Fallback to comma-separated string
                            selectOptions = field.options.split(',').map(opt => opt.trim());
                          }
                        } catch (e) {
                          console.log('JSON parse error for select field:', e);
                          // If JSON parsing fails, treat as comma-separated string
                          selectOptions = field.options.split(',').map(opt => opt.trim());
                        }
                      } 
                      // If options is already an array, use it directly
                      else if (Array.isArray(field.options)) {
                        selectOptions = field.options;
                      }
                    } catch (e) {
                      console.error('Error parsing select options:', e);
                    }
                  }
                  
                  // Debug output
                  console.log('Field options type for select:', typeof field.options);
                  console.log('Field options value for select:', field.options);
                  console.log('Parsed select options:', selectOptions);
                  
                  return (
                    <View key={field.id} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {field.name}{field.is_required && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable
                        onPress={() => setShowSelectOptions(field.id)}
                        className={`bg-gray-800 border ${fieldError ? 'border-red-500' : 'border-gray-700'} rounded-xl p-4`}
                      >
                        <StyledText className="text-white">
                          {formData[field.id] ? String(formData[field.id]) : 'Select option'}
                        </StyledText>
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                      
                      {showSelectOptions === field.id && (
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={showSelectOptions === field.id}
                          onRequestClose={() => setShowSelectOptions(null)}
                        >
                          <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-gray-800 rounded-t-xl p-4">
                              <View className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-white text-lg font-bold">
                                  Select {field.name}
                                </StyledText>
                                <StyledPressable onPress={() => setShowSelectOptions(null)}>
                                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </StyledPressable>
                              </View>
                              
                              <View className="bg-gray-700 rounded-xl mb-4 max-h-80">
                                <ScrollView>
                                  {/* Debug log for select options */}
                                  {(() => { console.log('Rendering select options in modal:', selectOptions); return null; })()}
                                  {selectOptions && selectOptions.length > 0 ? selectOptions.map((option: string, index: number) => (
                                    <StyledPressable
                                      key={index}
                                      onPress={() => {
                                        setFormData(prev => ({ ...prev, [field.id]: option.trim() }));
                                        setShowSelectOptions(null);
                                        if (fieldError) setErrors(prev => ({ ...prev, [field.id]: '' }));
                                      }}
                                      className={`p-4 border-b border-gray-600 ${index === selectOptions.length - 1 ? 'border-b-0' : ''}`}
                                    >
                                      <StyledText className="text-white">{option.trim()}</StyledText>
                                    </StyledPressable>
                                  )) : (
                                    <View className="p-4">
                                      <StyledText className="text-gray-400 text-center">No options available</StyledText>
                                    </View>
                                  )}
                                </ScrollView>
                              </View>
                              
                              <Button
                                variant="outline"
                                onPress={() => setShowSelectOptions(null)}
                                className="rounded-xl border border-gray-600 py-3"
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
                  // Ensure multiSelectOptions is always an array
                  let multiSelectOptions: string[] = [];
                  if (field.options) {
                    try {
                      // If options is a string, try to parse it as JSON
                      if (typeof field.options === 'string') {
                        try {
                          const parsedOptions = JSON.parse(field.options);
                          if (Array.isArray(parsedOptions)) {
                            multiSelectOptions = parsedOptions;
                          } else if (typeof parsedOptions === 'object' && parsedOptions !== null && Array.isArray(parsedOptions.options)) {
                            // Handle legacy format where options might be stored as { options: [...] }
                            multiSelectOptions = parsedOptions.options;
                          } else {
                            // Fallback to comma-separated string
                            multiSelectOptions = field.options.split(',').map(opt => opt.trim());
                          }
                        } catch (e) {
                          console.log('JSON parse error:', e);
                          // If JSON parsing fails, treat as comma-separated string
                          multiSelectOptions = field.options.split(',').map(opt => opt.trim());
                        }
                      } 
                      // If options is already an array, use it directly
                      else if (Array.isArray(field.options)) {
                        multiSelectOptions = field.options;
                      }
                    } catch (e) {
                      console.error('Error parsing multi-select options:', e);
                    }
                  }
                  
                  // Debug output
                  console.log('Field options type:', typeof field.options);
                  console.log('Field options value:', field.options);
                  console.log('Parsed multi-select options:', multiSelectOptions);
                  
                  // Get selected options as array
                  const selectedOptions = formData[field.id] ? 
                    (typeof formData[field.id] === 'string' ? String(formData[field.id]).split(',').map(opt => opt.trim()) : []) : 
                    [];
                  
                  return (
                    <View key={field.id} className="mb-4">
                      <StyledText className="text-white text-base mb-2">
                        {field.name}{field.is_required && <StyledText className="text-red-500">*</StyledText>}
                      </StyledText>
                      
                      <StyledPressable
                        onPress={() => setShowMultiSelectOptions(field.id)}
                        className={`bg-gray-800 border ${fieldError ? 'border-red-500' : 'border-gray-700'} rounded-xl p-4`}
                      >
                        {selectedOptions.length > 0 ? (
                          <View className="flex-row flex-wrap">
                            {selectedOptions.map((option, index) => (
                              <View key={index} className="bg-blue-900 rounded-lg px-2 py-1 mr-2 mb-2">
                                <StyledText className="text-white">{option.trim()}</StyledText>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <StyledText className="text-gray-400">Select options</StyledText>
                        )}
                      </StyledPressable>
                      
                      {fieldError && (
                        <StyledText className="text-red-500 mt-1">{fieldError}</StyledText>
                      )}
                      
                      {showMultiSelectOptions === field.id && (
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={showMultiSelectOptions === field.id}
                          onRequestClose={() => setShowMultiSelectOptions(null)}
                        >
                          <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-gray-800 rounded-t-xl p-4">
                              <View className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-white text-lg font-bold">
                                  Select {field.name}
                                </StyledText>
                                <StyledPressable onPress={() => setShowMultiSelectOptions(null)}>
                                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </StyledPressable>
                              </View>
                              
                              <View className="bg-gray-700 rounded-xl mb-4 max-h-80">
                                <ScrollView>
                                  {multiSelectOptions.map((option: string, index: number) => {
                                    const isSelected = selectedOptions.includes(option.trim());
                                    
                                    return (
                                      <StyledPressable
                                        key={index}
                                        onPress={() => {
                                          let newSelected;
                                          if (isSelected) {
                                            newSelected = selectedOptions.filter(item => item !== option.trim());
                                          } else {
                                            newSelected = [...selectedOptions, option.trim()];
                                          }
                                          
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            [field.id]: newSelected.join(',') 
                                          }));
                                          
                                          if (fieldError) setErrors(prev => ({ ...prev, [field.id]: '' }));
                                        }}
                                        className={`p-4 border-b border-gray-600 flex-row justify-between items-center ${index === multiSelectOptions.length - 1 ? 'border-b-0' : ''}`}
                                      >
                                        <StyledText className="text-white">{option.trim()}</StyledText>
                                        {isSelected && (
                                          <MaterialCommunityIcons name="check" size={24} color="#3B82F6" />
                                        )}
                                      </StyledPressable>
                                    );
                                  })}
                                </ScrollView>
                              </View>
                              
                              <Button
                                variant="primary"
                                onPress={() => setShowMultiSelectOptions(null)}
                                className="rounded-xl bg-blue-600 py-3 mb-2"
                              >
                                Done
                              </Button>
                            </View>
                          </View>
                        </Modal>
                      )}
                    </View>
                  );
              }
            })}
          </View>

          <Button
            variant="primary"
            onPress={handleSave}
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all px-4 py-3 shadow-lg shadow-blue-900/20 mb-4"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </StyledScrollView>
        
        {/* Render date picker modal */}
        {renderDatePickerModal()}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
