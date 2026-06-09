import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReservaProvider } from './context/ReservaContext';
import LoginBarberoScreen from './screens/barbero/LoginBarberoScreen';
import HomeScreen from './screens/HomeScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import DatosClienteScreen from './screens/DatosClienteScreen';
import PagoScreen from './screens/PagoScreen';
import ConfirmacionScreen from './screens/ConfirmacionScreen';
import BarberoNavigator from './screens/barbero/BarberoNavigator';
import AdminNavigator from './screens/admin/AdminNavigator';
import CancelacionScreen from './screens/CancelacionScreen';

function LoginAdminScreen() {
  const { useState } = require('react');
  const { View, Text, TextInput, TouchableOpacity, Alert } = require('react-native');
  const { useNavigation } = require('@react-navigation/native');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const ADMIN_PASSWORD = 'stylevip2026';

  function ingresar() {
    if (password === ADMIN_PASSWORD) {
      navigation.navigate('Admin');
    } else {
      Alert.alert('Error', 'Contraseña incorrecta');
      setPassword('');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Panel Admin</Text>
      <Text style={{ color: '#AAAAAA', fontSize: 16, marginBottom: 40 }}>StyleVIP</Text>
      <TextInput
        style={{ width: '100%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 16 }}
        placeholder="Contraseña"
        placeholderTextColor="#555555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={ingresar}
      />
      <TouchableOpacity
        style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, alignItems: 'center' }}
        onPress={ingresar}
      >
        <Text style={{ color: '#0D0D0D', fontSize: 16, fontWeight: 'bold' }}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Calendario: undefined;
  DatosCliente: undefined;
  Pago: undefined;
  Confirmacion: undefined;
  Barbero: undefined;
  LoginAdmin: undefined;
  Admin: undefined;
  LoginBarbero: undefined;
  Cancelacion: { reservaId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['stylevip://'],
  config: {
    screens: {
      Cancelacion: 'cancelar/:reservaId',
    },
  },
};

export default function App() {
  return (
    <ReservaProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#0D0D0D' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#0D0D0D' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'StyleVIP' }} />
          <Stack.Screen name="Calendario" component={CalendarioScreen} options={{ title: 'Selecciona fecha' }} />
          <Stack.Screen name="DatosCliente" component={DatosClienteScreen} options={{ title: 'Información personal' }} />
          <Stack.Screen name="Pago" component={PagoScreen} options={{ title: 'Método de pago' }} />
          <Stack.Screen name="Confirmacion" component={ConfirmacionScreen} options={{ title: '¡Reserva confirmada!' }} />
          <Stack.Screen name="Barbero" component={BarberoNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="LoginAdmin" component={LoginAdminScreen} options={{ title: 'Admin' }} />
          <Stack.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="LoginBarbero" component={LoginBarberoScreen} options={{ title: 'Barbero' }} />
          <Stack.Screen name="Cancelacion" component={CancelacionScreen} options={{ title: 'Cancelar reserva' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ReservaProvider>
  );
}