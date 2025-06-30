import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111827', // bg-gray-900
        },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#374151', // border-gray-700
          position: 'absolute',
          height: 80,
          paddingBottom: 32
        },
        tabBarActiveTintColor: '#3B82F6', // text-blue-500
        tabBarInactiveTintColor: '#9CA3AF', // text-gray-400
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="(lists)"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
