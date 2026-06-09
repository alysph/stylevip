import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

type Reserva = {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  metodo_pago: string;
  monto_total: number;
  clientes: { nombre: string; apellido: string; telefono: string };
  reserva_servicios: { servicios: { nombre: string } }[];
};

export function HistorialAdminScreen() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarHistorial(); }, []);

  async function cargarHistorial() {
    setCargando(true);
    const { data } = await supabase
      .from('reservas')
      .select(`
        id, fecha, hora_inicio, hora_fin, estado, metodo_pago, monto_total,
        clientes (nombre, apellido, telefono),
        reserva_servicios (servicios (nombre))
      `)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false });

    if (data) setReservas(data as any);
    setCargando(false);
  }

  async function cancelarReserva(id: string) {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id);
            cargarHistorial();
          },
        },
      ]
    );
  }

  function colorEstado(estado: string) {
    switch (estado) {
      case 'confirmada_pagada': return '#4CAF50';
      case 'confirmada_pendiente': return '#FF9800';
      case 'completada': return '#2196F3';
      case 'no_asistio': return '#F44336';
      case 'cancelada': return '#666688';
      default: return '#AAAAAA';
    }
  }

  function textoEstado(estado: string) {
    switch (estado) {
      case 'confirmada_pagada': return 'Pagada';
      case 'confirmada_pendiente': return 'Pago pendiente';
      case 'completada': return 'Completada';
      case 'no_asistio': return 'No asistió';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  const totalIngresos = reservas
    .filter(r => r.estado === 'completada' || r.estado === 'confirmada_pagada')
    .reduce((sum, r) => sum + r.monto_total, 0);

  const pendientes = reservas
    .filter(r => r.estado === 'confirmada_pendiente')
    .reduce((sum, r) => sum + r.monto_total, 0);

  if (cargando) return <View style={styles.container}><ActivityIndicator color="#C9A84C" size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.resumenContainer}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenLabel}>Ingresos</Text>
          <Text style={styles.resumenValor}>${totalIngresos.toLocaleString()}</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenLabel}>Pendiente</Text>
          <Text style={styles.resumenValorPendiente}>${pendientes.toLocaleString()}</Text>
        </View>
      </View>

      <FlatList
        data={reservas}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.fecha}>{item.fecha} · {item.hora_inicio.slice(0, 5)}</Text>
              <Text style={[styles.badge, { color: colorEstado(item.estado) }]}>
                {textoEstado(item.estado)}
              </Text>
            </View>

            <Text style={styles.clienteNombre}>
              {item.clientes.nombre} {item.clientes.apellido}
            </Text>
            <Text style={styles.telefono}>{item.clientes.telefono}</Text>
            <Text style={styles.servicios}>
              {item.reserva_servicios.map(rs => rs.servicios.nombre).join(', ')}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.monto}>
                {item.metodo_pago === 'online' ? 'Online' : 'Efectivo'} · ${item.monto_total.toLocaleString()}
              </Text>
              {item.estado !== 'cancelada' && item.estado !== 'completada' && (
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => cancelarReserva(item.id)}
                >
                  <Text style={styles.btnCancelarTexto}>Cancelar reserva</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  resumenContainer: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 8 },
  resumenCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A2A2A' },
  resumenLabel: { color: '#AAAAAA', fontSize: 13, marginBottom: 6 },
  resumenValor: { color: '#4CAF50', fontSize: 20, fontWeight: 'bold' },
  resumenValorPendiente: { color: '#FF9800', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fecha: { color: '#AAAAAA', fontSize: 13 },
  badge: { fontSize: 12, fontWeight: 'bold' },
  clienteNombre: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  telefono: { color: '#AAAAAA', fontSize: 13, marginBottom: 4 },
  servicios: { color: '#AAAAAA', fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monto: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  btnCancelar: { backgroundColor: '#3A1A1A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnCancelarTexto: { color: '#F44336', fontSize: 13, fontWeight: 'bold' },
});