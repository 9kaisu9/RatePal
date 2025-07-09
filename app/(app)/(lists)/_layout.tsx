import { Stack } from 'expo-router';
import { ParamListBase } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Custom header component for list details screen
function CustomListHeader({ navigation }: { navigation: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={{ paddingHorizontal: 15, paddingVertical: 10 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5 }}>Lists</Text>
        </View>
      </TouchableOpacity>
      {/* Empty middle section */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#111827',
          paddingTop: 0, // Remove the gap between header and content
        },
        // Improve header title styling
        headerTitleStyle: {
          fontSize: 18,
        },
        // Center the title
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Lists',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create List',
          presentation: 'modal',
        }}
      />
      {/* List Details Screen */}
      <Stack.Screen
        name="[id]/index"
        options={{
          headerTitle: '',
          headerBackTitle: 'Lists'
        }}
      />
      <Stack.Screen
        name="[id]/entry/create"
        options={{
          title: 'Add Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]/entry/[entryId]"
        options={({ route }) => ({
          headerTitle: '', // Hide the header title
          headerStyle: {
            backgroundColor: '#111827',
          },
          contentStyle: {
            backgroundColor: '#111827',
            paddingTop: 0, // Remove the gap between header and content
          },
          headerBackTitle: route.params && typeof route.params === 'object' && 'listTitle' in route.params
            ? String(route.params.listTitle)
            : 'Back'
        })}
      />
      <Stack.Screen
        name="[id]/entry/[entryId]/edit"
        options={{
          title: 'Edit Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]/settings"
        options={{
          title: 'List Settings',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
