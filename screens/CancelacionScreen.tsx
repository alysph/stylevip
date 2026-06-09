import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cancelacion'>;
type RoutePropType = RouteProp<RootStackParamList, 'Cancelacion'>;

export default function CancelacionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { reservaId } = route.params;
  const [estado, setEstado] = useState<'cargando' | 'confirmando' | 'cancelada' | 'error' | 'yaCancelada' | 'completada'>('cargando');
  const [reserva, setReserva] = useState<any>(null);

  useEffect(() => {
    cargarReserva();
  }, []);

  async function cargarReserva() {
    const { data, error } = await supabase
      .from('reservas')
      .select('id, estado, fecha, hora_inicio, clientes (nombre)')
      .eq('id', reservaId)
      .single();

    if (error || !data) {
      setEstado('error');
      return;
    }

    if (data.estado === 'cancelada') {
      setEstado('yaCancelada');
      return;
    }

    if (data.estado === 'completada') {
      setEstado('completada');
      return;
    }

    setReserva(data);
    setEstado('confirmando');
  }

  async function cancelar() {
    setEstado('cargando');
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id', reservaId);

    if (error) {
      setEstado('error');
      return;
    }
    setEstado('cancelada');
  }

  return (
    <View style={styles.container}>
      {estado === 'cargando' && (
        <ActivityIndicator color="#FFFFFF" size="large" />
      )}

      {estado === 'confirmando' && reserva && (
        <View style={styles.card}>
          <Text style={styles.titulo}>¿Cancelar reserva?</Text>
          <Text style={styles.subtitulo}>
            Hola {reserva.clientes.nombre}, estás a punto de cancelar tu cita:
          </Text>
          <View style={styles.detalle}>
            <Text style={styles.detalleTexto}>Fecha: {reserva.fecha}</Text>
            <Text style={styles.detalleTexto}>Hora: {reserva.hora_inicio.slice(0, 5)}</Text>
          </View>
          <TouchableOpacity style={styles.btnCancelar} onPress={cancelar}>
            <Text style={styles.btnCancelarTexto}>Sí, cancelar mi reserva</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnVolverTexto}>No, mantener mi reserva</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === 'cancelada' && (
        <View style={styles.card}>
          <Text style={styles.titulo}>Reserva cancelada</Text>
          <Text style={styles.subtitulo}>Tu reserva ha sido cancelada exitosamente.</Text>
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnVolverTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === 'yaCancelada' && (
        <View style={styles.card}>
          <Text style={styles.titulo}>Ya cancelada</Text>
          <Text style={styles.subtitulo}>Esta reserva ya fue cancelada anteriormente.</Text>
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnVolverTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === 'completada' && (
        <View style={styles.card}>
          <Text style={styles.titulo}>No cancelable</Text>
          <Text style={styles.subtitulo}>Esta reserva ya fue completada y no puede cancelarse.</Text>
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnVolverTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}

      {estado === 'error' && (
        <View style={styles.card}>
          <Text style={styles.titulo}>Error</Text>
          <Text style={styles.subtitulo}>No se encontró la reserva.</Text>
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnVolverTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  icono: { fontSize: 56, marginBottom: 16 },
  titulo: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitulo: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  detalle: { backgroundColor: '#0D0D0D', borderRadius: 10, padding: 16, width: '100%', marginBottom: 20, gap: 8 },
  detalleTexto: { color: '#FFFFFF', fontSize: 15 },
  btnCancelar: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F44336' },
  btnCancelarTexto: { color: '#F44336', fontSize: 15, fontWeight: 'bold' },
  btnVolver: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  btnVolverTexto: { color: '#AAAAAA', fontSize: 15, fontWeight: 'bold' },
});