import { View, Text, ScrollView, TextInput, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useState, useEffect } from 'react';
import { listService, customFieldService } from '../../../services/supabaseService';
import { Tables } from '../../../lib/supabase';
import { styled } from 'nativewind';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTextInput = styled(TextInput);

// Field type IDs
const FIELD_TYPES = {
  TEXT: 1,
  NUMBER: 2,
  DATE: 3,
  BOOLEAN: 4,
  SELECT: 5,
  MULTI_SELECT: 6
};

// Field type names for display
const FIELD_TYPE_NAMES = {
  1: 'Text',
  2: 'Number',
  3: 'Date',
  4: 'Yes/No',
  5: 'Select',
  6: 'Multi-Select'
};

export default function ListSettingsScreen() {
  const { id } = useLocalSearchParams();
  const [list, setList] = useState<Tables['lists'] | null>(null);
  const [customFields, setCustomFields] = useState<Tables['custom_fields'][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState<Tables['custom_fields'] | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<number>(FIELD_TYPES.TEXT);
  const [fieldOptions, setFieldOptions] = useState<string>('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  
  // Fetch list data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof id !== 'string') {
          throw new Error('Invalid list ID');
        }
        
        // Fetch list details
        const listData = await listService.getListById(id);
        if (!listData) throw new Error('List not found');
        setList(listData);
        setTitle(listData.title);
        setDescription(listData.description || '');
        
        // Fetch custom fields for this list
        const fieldsData = await customFieldService.getCustomFieldsByListId(id);
        setCustomFields(fieldsData || []);
        
      } catch (err: any) {
        console.error('Error loading list data:', err);
        setError(err.message || 'An error occurred loading the list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Save list changes
  const handleSaveList = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'List title is required');
      return;
    }
    
    try {
      setSaving(true);
      
      if (!list || typeof id !== 'string') {
        throw new Error('List data not available');
      }
      
      const updatedList = {
        ...list,
        title: title.trim(),
        description: description.trim() || null
      };
      
      await listService.updateList(id, updatedList);
      Alert.alert('Success', 'List updated successfully');
      
    } catch (err: any) {
      console.error('Error updating list:', err);
      Alert.alert('Error', err.message || 'Failed to update list');
    } finally {
      setSaving(false);
    }
  };

  // Delete list
  const handleDeleteList = async () => {
    try {
      setSaving(true);
      
      if (!list || typeof id !== 'string') {
        throw new Error('List data not available');
      }
      
      await listService.deleteList(id);
      setShowDeleteConfirm(false);
      router.replace('/lists');
      
    } catch (err: any) {
      console.error('Error deleting list:', err);
      Alert.alert('Error', err.message || 'Failed to delete list');
      setSaving(false);
    }
  };

  // Edit field
  const handleEditField = (field: Tables['custom_fields']) => {
    setCurrentField(field);
    setFieldName(field.name);
    setFieldType(field.field_type_id);
    setFieldRequired(field.is_required || false);
    setFieldOptions(field.options ? field.options.join(',') : '');
    setShowFieldModal(true);
  };

  // Save field changes
  const handleSaveField = async () => {
    // Validate field
    if (!fieldName.trim()) {
      setFieldError('Field name is required');
      return;
    }
    
    // Validate options for select and multi-select fields
    if ((fieldType === FIELD_TYPES.SELECT || fieldType === FIELD_TYPES.MULTI_SELECT) && !fieldOptions.trim()) {
      setFieldError('Options are required for select fields');
      return;
    }
    
    try {
      setSaving(true);
      
      const options = (fieldType === FIELD_TYPES.SELECT || fieldType === FIELD_TYPES.MULTI_SELECT) 
        ? fieldOptions.split(',').map(opt => opt.trim()).filter(opt => opt) 
        : null;
      
      if (currentField) {
        // Update existing field
        const updatedField = {
          ...currentField,
          name: fieldName.trim(),
          field_type_id: fieldType,
          is_required: fieldRequired,
          options
        };
        
        await customFieldService.updateCustomField(currentField.id, updatedField);
        
        // Update local state
        setCustomFields(prev => prev.map(f => f.id === currentField.id ? updatedField : f));
      } else {
        // Create new field
        if (typeof id !== 'string') {
          throw new Error('Invalid list ID');
        }
        
        const newField = {
          list_id: id,
          name: fieldName.trim(),
          field_type_id: fieldType,
          is_required: fieldRequired,
          options,
          position: customFields.length + 1
        };
        
        const createdField = await customFieldService.createCustomField(newField);
        
        // Update local state
        setCustomFields(prev => [...prev, createdField]);
      }
      
      // Reset form and close modal
      resetFieldForm();
      setShowFieldModal(false);
      
    } catch (err: any) {
      console.error('Error saving field:', err);
      setFieldError(err.message || 'Failed to save field');
    } finally {
      setSaving(false);
    }
  };

  // Delete field
  const handleDeleteField = async (fieldId: string) => {
    try {
      setSaving(true);
      
      await customFieldService.deleteCustomField(fieldId);
      
      // Update local state
      setCustomFields(prev => prev.filter(f => f.id !== fieldId));
      
    } catch (err: any) {
      console.error('Error deleting field:', err);
      Alert.alert('Error', err.message || 'Failed to delete field');
    } finally {
      setSaving(false);
    }
  };

  // Reset field form
  const resetFieldForm = () => {
    setCurrentField(null);
    setFieldName('');
    setFieldType(FIELD_TYPES.TEXT);
    setFieldRequired(false);
    setFieldOptions('');
    setFieldError(null);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white text-lg mt-4">Loading list settings...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !list) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg">{error || 'List not found'}</Text>
        <Button variant="outline" onPress={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-8">
          <StyledText className="text-2xl font-bold text-white">List Settings</StyledText>
          <Button variant="outline" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        {/* List Details Section */}
        <View className="bg-gray-800 rounded-lg p-6 mb-8">
          <StyledText className="text-xl font-semibold text-white mb-4">List Details</StyledText>
          
          <View className="mb-4">
            <StyledText className="text-gray-400 text-sm mb-1">List Title</StyledText>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Enter list title"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </View>
          
          <View className="mb-6">
            <StyledText className="text-gray-400 text-sm mb-1">Description</StyledText>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Enter list description"
              multiline
              numberOfLines={3}
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </View>
          
          <Button
            variant="primary"
            onPress={handleSaveList}
            disabled={saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </View>

        {/* Custom Fields Section */}
        <View className="bg-gray-800 rounded-lg p-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <StyledText className="text-xl font-semibold text-white">Custom Fields</StyledText>
            <Button
              variant="outline"
              onPress={() => {
                resetFieldForm();
                setShowFieldModal(true);
              }}
              className="rounded-xl border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
            >
              Add Field
            </Button>
          </View>
          
          {customFields.length === 0 ? (
            <View className="items-center justify-center py-8">
              <MaterialCommunityIcons name="form-textbox" size={48} color="#4B5563" />
              <StyledText className="text-gray-400 text-lg mt-4 text-center">
                No custom fields yet
              </StyledText>
              <StyledText className="text-gray-500 text-center mt-2">
                Add custom fields to collect specific information
              </StyledText>
            </View>
          ) : (
            <View className="space-y-4">
              {customFields.map((field) => (
                <View
                  key={field.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600/30"
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <StyledText className="text-white font-medium">{field.name}</StyledText>
                      <StyledText className="text-gray-400 text-sm">
                        {FIELD_TYPE_NAMES[field.field_type_id as keyof typeof FIELD_TYPE_NAMES]}
                        {field.is_required ? ' • Required' : ''}
                      </StyledText>
                      {(field.field_type_id === FIELD_TYPES.SELECT || field.field_type_id === FIELD_TYPES.MULTI_SELECT) && field.options && (
                        <StyledText className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                          Options: {field.options.join(', ')}
                        </StyledText>
                      )}
                    </View>
                    <View className="flex-row">
                      <StyledPressable
                        onPress={() => handleEditField(field)}
                        className="p-2 mr-2"
                      >
                        <MaterialCommunityIcons name="pencil" size={20} color="#60A5FA" />
                      </StyledPressable>
                      <StyledPressable
                        onPress={() => {
                          Alert.alert(
                            'Delete Field',
                            `Are you sure you want to delete "${field.name}"? This will remove this field from all entries.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteField(field.id) }
                            ]
                          );
                        }}
                        className="p-2"
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                      </StyledPressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View className="bg-red-900/20 rounded-lg p-6 mb-8 border border-red-800/30">
          <StyledText className="text-xl font-semibold text-red-400 mb-4">Danger Zone</StyledText>
          <StyledText className="text-gray-300 mb-4">
            Deleting this list will permanently remove all entries and custom fields associated with it.
            This action cannot be undone.
          </StyledText>
          <Button
            variant="outline"
            onPress={() => setShowDeleteConfirm(true)}
            className="bg-red-500/10 border-red-500"
          >
            <StyledText className="text-red-500 font-medium">Delete List</StyledText>
          </Button>
        </View>
      </ScrollView>

      {/* Field Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFieldModal}
        onRequestClose={() => setShowFieldModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-800 rounded-t-xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <StyledText className="text-2xl font-bold text-white">
                {currentField ? 'Edit Field' : 'Add Field'}
              </StyledText>
              <StyledPressable onPress={() => setShowFieldModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </StyledPressable>
            </View>
            
            <View className="mb-4">
              <StyledText className="text-gray-400 text-sm mb-1">Field Name</StyledText>
              <Input
                value={fieldName}
                onChangeText={setFieldName}
                placeholder="Enter field name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </View>
            
            <View className="mb-4">
              <StyledText className="text-gray-400 text-sm mb-1">Field Type</StyledText>
              <View className="bg-gray-700 rounded-lg p-2 border border-gray-600">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.entries(FIELD_TYPES).map(([key, value]) => (
                    <StyledPressable
                      key={key}
                      onPress={() => setFieldType(value as number)}
                      className={`px-4 py-2 rounded-lg mr-2 ${fieldType === value ? 'bg-blue-600' : 'bg-gray-600'}`}
                    >
                      <StyledText className="text-white">{FIELD_TYPE_NAMES[value as keyof typeof FIELD_TYPE_NAMES]}</StyledText>
                    </StyledPressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            {(fieldType === FIELD_TYPES.SELECT || fieldType === FIELD_TYPES.MULTI_SELECT) && (
              <View className="mb-4">
                <StyledText className="text-gray-400 text-sm mb-1">Options (comma separated)</StyledText>
                <Input
                  value={fieldOptions}
                  onChangeText={setFieldOptions}
                  placeholder="Option 1, Option 2, Option 3"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </View>
            )}
            
            <View className="flex-row items-center mb-6">
              <StyledPressable
                onPress={() => setFieldRequired(!fieldRequired)}
                className="flex-row items-center"
              >
                <View className={`w-5 h-5 rounded mr-2 border ${fieldRequired ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-500'}`}>
                  {fieldRequired && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                </View>
                <StyledText className="text-white">Required Field</StyledText>
              </StyledPressable>
            </View>
            
            {fieldError && (
              <View className="mb-4 bg-red-900/20 p-3 rounded-lg border border-red-800/30">
                <StyledText className="text-red-400">{fieldError}</StyledText>
              </View>
            )}
            
            <Button
              variant="primary"
              onPress={handleSaveField}
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
            >
              {saving ? 'Saving...' : 'Save Field'}
            </Button>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-800 rounded-xl p-6 m-6 w-5/6">
            <StyledText className="text-xl font-bold text-white mb-4">Delete List</StyledText>
            <StyledText className="text-gray-300 mb-6">
              Are you sure you want to delete "{list.title}"? This will permanently remove all entries and custom fields.
              This action cannot be undone.
            </StyledText>
            <View className="flex-row justify-end space-x-4">
              <Button
                variant="outline"
                onPress={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onPress={handleDeleteList}
                disabled={saving}
                className="flex-1 bg-red-500/10 border-red-500"
              >
                <StyledText className="text-red-500 font-medium">
                  {saving ? 'Deleting...' : 'Delete'}
                </StyledText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
