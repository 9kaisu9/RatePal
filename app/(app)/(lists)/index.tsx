import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { ListPicker } from '../../components/ListPicker';
import { listService } from '../../services/supabaseService';
import { Tables } from '../../lib/supabase';
import { styled } from 'nativewind';

// Create styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ListsScreen() {
  const [lists, setLists] = useState<Tables['lists'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isListPickerVisible, setIsListPickerVisible] = useState(false);
  
  useEffect(() => {
    fetchLists();
  }, []);
  
  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const listsData = await listService.getLists();
      setLists(listsData);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickCreateEntry = () => {
    // If there are lists, show the list picker
    if (lists.length > 0) {
      setIsListPickerVisible(true);
    } else {
      // If no lists exist, navigate to create list screen
      router.push('/(app)/(lists)/create');
    }
  };
  
  const handleSelectList = (listId: string) => {
    setIsListPickerVisible(false);
    router.push({
      pathname: '/(app)/(lists)/[id]/entry/create',
      params: { id: listId }
    });
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <StyledView className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#60A5FA" />
          <StyledText className="text-gray-400 mt-4">Loading lists...</StyledText>
        </StyledView>
      );
    }
    
    if (error) {
      return (
        <StyledView className="flex-1 items-center justify-center py-12">
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
      );
    }
    
    if (lists.length === 0) {
      return (
        <StyledView className="flex-1 items-center justify-center py-12">
          <MaterialCommunityIcons name="notebook-outline" size={48} color="#4B5563" />
          <StyledText className="text-gray-400 text-center mt-4">No lists found</StyledText>
          <Link href="/(app)/(lists)/create" asChild>
            <Button variant="primary" className="mt-6 rounded-xl">
              Create Your First List
            </Button>
          </Link>
        </StyledView>
      );
    }
    
    return (
      <StyledView className="space-y-4 mb-8">
        {lists.map((list) => (
          <StyledPressable
            key={list.id}
            className="p-6 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200 active:scale-[0.99]"
            onPress={() => router.push({
              pathname: '/(app)/(lists)/[id]',
              params: { id: list.id }
            })}
          >
            <StyledView className="flex-row justify-between items-center">
              <StyledView>
                <StyledText className="text-xl font-semibold text-white tracking-tight mb-1">{list.title}</StyledText>
                <StyledText className="text-gray-400 text-base leading-relaxed">{list.description}</StyledText>
                <StyledText className="text-gray-500 text-sm mt-3 font-medium">{new Date(list.updated_at).toLocaleDateString()}</StyledText>
              </StyledView>
              <Button 
                variant="outline" 
                className="ml-4 rounded-xl border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all"
                onPress={() => router.push({
                  pathname: '/(app)/(lists)/[id]',
                  params: { id: list.id }
                })}
              >
                View
              </Button>
            </StyledView>
          </StyledPressable>
        ))}
      </StyledView>
    );
  };
  
  return (
    <StyledSafeAreaView edges={['top', 'bottom']} className="flex-1 bg-gray-900">
      <StyledScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          padding: 24,
          paddingBottom: 100
        }}
      >
        <StyledView className="flex-row items-center justify-between mb-8">
          <StyledText className="text-3xl font-bold text-white tracking-tight">My Lists</StyledText>
          <Link href="/(app)/(lists)/create" asChild>
            <Button variant="primary" className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors">
              + New List
            </Button>
          </Link>
        </StyledView>

        {renderContent()}

        {/* Premium upgrade banner */}
        <StyledView className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
          <StyledText className="text-2xl font-bold text-white mb-2 tracking-tight">
            Upgrade to Premium ✨
          </StyledText>
          <StyledText className="text-gray-300 mb-6">
            Get unlimited lists, advanced rating systems, and more.
          </StyledText>
          <Button variant="secondary" className="self-start">
            Learn More
          </Button>
        </StyledView>
      </StyledScrollView>

      {/* Quick add entry FAB */}
      <StyledPressable
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-900/50"
        onPress={handleQuickCreateEntry}
      >
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </StyledPressable>

      <ListPicker 
        isVisible={isListPickerVisible}
        onClose={() => setIsListPickerVisible(false)}
        onSelectList={handleSelectList}
      />
    </StyledSafeAreaView>
  );
}
