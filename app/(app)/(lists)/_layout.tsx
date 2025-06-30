import { Stack } from 'expo-router';

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
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
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
      <Stack.Screen
        name="[id]"
        options={{
          title: 'List Details',
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
        options={{
          title: 'Entry Details',
        }}
      />
      <Stack.Screen
        name="[id]/entry/[entryId]/edit"
        options={{
          title: 'Edit Entry',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
