import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ServiciosAdminScreen } from './ServiciosAdminScreen';
import { HorariosAdminScreen } from './HorariosAdminScreen';
import { HistorialAdminScreen } from './HistorialAdminScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
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
        name="ServiciosAdmin"
        component={ServiciosAdminScreen}
        options={{
          title: 'Servicios',
          tabBarLabel: 'Servicios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cut-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HorariosAdmin"
        component={HorariosAdminScreen}
        options={{
          title: 'Horarios',
          tabBarLabel: 'Horarios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HistorialAdmin"
        component={HistorialAdminScreen}
        options={{
          title: 'Historial',
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}