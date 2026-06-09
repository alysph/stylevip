import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginAdmin'>;

const ADMIN_PASSWORD = 'stylevip2026';

export default function LoginAdminScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [password, setPassword] = useState('');

  function ingresar() {
    if (password === ADMIN_PASSWORD) {
      navigation.navigate('Admin');
    } else {
      Alert.alert('Error', 'Contraseña incorrecta');
      setPassword('');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icono}>⚙️</Text>
      <Text style={styles.titulo}>Panel Admin</Text>
      <Text style={styles.subtitulo}>StyleVIP</Text>

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#666688"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={ingresar}
      />

      <TouchableOpacity style={styles.boton} onPress={ingresar}>
        <Text style={styles.botonTexto}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#1A1A2E',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  icono: { fontSize: 56, marginBottom: 16 },
  titulo: { color: '#C9A84C', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 40 },
  input: {
    width: '100%', backgroundColor: '#252540', borderRadius: 10,
    padding: 14, color: '#FFFFFF', fontSize: 16,
    borderWidth: 1, borderColor: '#333355', marginBottom: 16,
  },
  boton: {
    width: '100%', backgroundColor: '#C9A84C',
    borderRadius: 10, padding: 16, alignItems: 'center',
  },
  botonTexto: { color: '#1A1A2E', fontSize: 16, fontWeight: 'bold' },
});