import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AgendaDiaScreen from './AgendaDiaScreen';
import AgendaSemanaScreen from './AgendaSemanaScreen';

const Tab = createBottomTabNavigator();

export default function BarberoNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D0D0D' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#0D0D0D', borderTopColor: '#2A2A2A' },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#555555',
      }}
    >
      <Tab.Screen
        name="AgendaDia"
        component={AgendaDiaScreen}
        options={{
          title: 'Agenda del día',
          tabBarLabel: 'Hoy',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AgendaSemana"
        component={AgendaSemanaScreen}
        options={{
          title: 'Esta semana',
          tabBarLabel: 'Semana',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-clear-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}