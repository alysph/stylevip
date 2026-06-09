import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Vibration } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginBarbero'>;

const BARBERO_PIN = '1234';

export default function LoginBarberoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [pin, setPin] = useState('');

  function presionarNumero(num: string) {
    if (pin.length < 4) {
      const nuevoPin = pin + num;
      setPin(nuevoPin);
      if (nuevoPin.length === 4) {
        if (nuevoPin === BARBERO_PIN) {
          navigation.navigate('Barbero');
        } else {
          Vibration.vibrate([0, 100, 50, 100]);
          setPin('');
        }
      }
    }
  }

  function borrar() {
    setPin(prev => prev.slice(0, -1));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Acceso Barbero</Text>
      <Text style={styles.subtitulo}>Ingresa tu PIN de 4 dígitos</Text>

      <View style={styles.puntosContainer}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.punto, pin.length > i && styles.puntoActivo]} />
        ))}
      </View>

      <View style={styles.teclado}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((num, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tecla, num === '' && styles.teclaVacia]}
            onPress={() => num === '⌫' ? borrar() : num !== '' ? presionarNumero(num) : null}
            disabled={num === ''}
          >
            <Text style={styles.teclaTexto}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  icono: { display: 'none' },
  titulo: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { color: '#AAAAAA', fontSize: 16, marginBottom: 40 },
  puntosContainer: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  punto: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#2A2A2A', backgroundColor: 'transparent' },
  puntoActivo: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  teclado: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 16 },
  tecla: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  teclaVacia: { backgroundColor: 'transparent', borderColor: 'transparent' },
  teclaTexto: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
});