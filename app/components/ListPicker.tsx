import { View, Text, Modal, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { listService, entryService } from '../services/supabaseService';
import { Tables } from '../lib/supabase';
import { styled } from 'nativewind';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// Create a properly typed FlatList component
type ListItem = Tables['lists'];
const StyledFlatList = styled(FlatList) as unknown as typeof FlatList;

interface ListPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectList: (listId: string) => void;
}

export function ListPicker({ isVisible, onClose, onSelectList }: ListPickerProps) {
  const [lists, setLists] = useState<Tables['lists'][]>([]);
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isVisible) {
      fetchLists();
    }
  }, [isVisible]);
  
  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch lists from Supabase
      const listsData = await listService.getLists();
      setLists(listsData);
      
      // Fetch entry counts for each list
      const counts: Record<string, number> = {};
      for (const list of listsData) {
        counts[list.id] = list.entry_count;
      }
      setEntryCounts(counts);
      
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 justify-center items-center bg-black/60">
        <StyledView className="w-11/12 max-w-md bg-gray-800 p-6 rounded-3xl border border-gray-700/50 shadow-2xl">
          <StyledView className="flex-row justify-between items-center mb-6">
            <StyledText className="text-2xl font-bold text-white tracking-tight">Select a List</StyledText>
            <StyledPressable 
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={24} color="#9CA3AF" />
            </StyledPressable>
          </StyledView>

          {loading ? (
            <StyledView className="py-12 items-center">
              <ActivityIndicator size="large" color="#60A5FA" />
              <StyledText className="text-gray-400 mt-4">Loading lists...</StyledText>
            </StyledView>
          ) : error ? (
            <StyledView className="py-8 items-center">
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
              <StyledText className="text-gray-400 text-center mt-4">{error}</StyledText>
              <Button 
                variant="primary"
                className="mt-6 rounded-xl" 
                onPress={fetchLists}
              >
                Retry
              </Button>
            </StyledView>
          ) : lists.length > 0 ? (
            <FlatList
              data={lists}
              keyExtractor={(item: ListItem) => item.id}
              className="max-h-96"  // This will be ignored by FlatList but we'll style it differently
              style={{ maxHeight: 384 }} // 96 * 4 = 384px equivalent to max-h-96
              renderItem={({ item }) => (
                <StyledPressable 
                  className="p-4 mb-2 rounded-xl bg-gray-700/50 border border-gray-600/30 active:bg-gray-600/50 transition-colors"
                  onPress={() => onSelectList(item.id)}
                >
                  <StyledText className="text-lg font-semibold text-white mb-1">{item.title}</StyledText>
                  <StyledText className="text-sm text-gray-300 mb-1" numberOfLines={1}>
                    {item.description}
                  </StyledText>
                  <StyledText className="text-xs text-gray-400">
                    {entryCounts[item.id] || 0} entries
                  </StyledText>
                </StyledPressable>
              )}
              ItemSeparatorComponent={() => <StyledView className="h-2" />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          ) : (
            <StyledView className="py-8 items-center">
              <MaterialCommunityIcons name="notebook-outline" size={48} color="#4B5563" />
              <StyledText className="text-gray-400 text-center mt-4">No lists found</StyledText>
              <Button 
                variant="primary"
                className="mt-6 rounded-xl" 
                onPress={() => {
                  onClose();
                  // We'll handle navigation to create list in the parent component
                }}
              >
                Create a List First
              </Button>
            </StyledView>
          )}
        </StyledView>
      </StyledView>
    </Modal>
  );
}
