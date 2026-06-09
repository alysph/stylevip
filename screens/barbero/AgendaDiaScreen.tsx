import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

type Reserva = {
  id: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  metodo_pago: string;
  monto_total: number;
  clientes: { nombre: string; apellido: string };
  reserva_servicios: { servicios: { nombre: string } }[];
};

export default function AgendaDiaScreen() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    setCargando(true);
    const { data } = await supabase
      .from('reservas')
      .select(`
        id, hora_inicio, hora_fin, estado, metodo_pago, monto_total,
        clientes (nombre, apellido),
        reserva_servicios (servicios (nombre))
      `)
      .eq('fecha', hoy)
      .neq('estado', 'cancelada')
      .order('hora_inicio');

    if (data) setReservas(data as any);
    setCargando(false);
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
    cargarReservas();
  }

  function colorEstado(estado: string) {
    switch (estado) {
      case 'confirmada_pagada': return '#4CAF50';
      case 'confirmada_pendiente': return '#FF9800';
      case 'completada': return '#2196F3';
      case 'no_asistio': return '#F44336';
      default: return '#AAAAAA';
    }
  }

  function textoEstado(estado: string) {
    switch (estado) {
      case 'confirmada_pagada': return 'Pagada';
      case 'confirmada_pendiente': return 'Pago pendiente';
      case 'completada': return 'Completada';
      case 'no_asistio': return 'No asistió';
      default: return estado;
    }
  }

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#C9A84C" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.fecha}>{hoy}</Text>
        {reservas.length > 0 && (
          <Text style={styles.contador}>{reservas.length} cita{reservas.length > 1 ? 's' : ''} hoy</Text>
        )}
      </View>

      {reservas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>Todo tranquilo por ahora</Text>
          <Text style={styles.vacioTexto}>No hay citas agendadas para hoy</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHora}>
                <Text style={styles.horaInicio}>{item.hora_inicio.slice(0, 5)}</Text>
                <Text style={styles.horaFin}>{item.hora_fin.slice(0, 5)}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.clienteNombre}>
                  {item.clientes.nombre} {item.clientes.apellido}
                </Text>
                <Text style={styles.servicios}>
                  {item.reserva_servicios.map(rs => rs.servicios.nombre).join(', ')}
                </Text>
                <View style={styles.fila}>
                  <Text style={[styles.badge, { backgroundColor: colorEstado(item.estado) + '33', color: colorEstado(item.estado) }]}>
                    {textoEstado(item.estado)}
                  </Text>
                  <Text style={styles.pago}>
                    {item.metodo_pago === 'online' ? 'Online' : 'Efectivo'} · ${item.monto_total.toLocaleString()}
                  </Text>
                </View>

                {(item.estado === 'confirmada_pagada' || item.estado === 'confirmada_pendiente') && (
                  <View style={styles.acciones}>
                    <TouchableOpacity
                      style={styles.btnCompletada}
                      onPress={() => cambiarEstado(item.id, 'completada')}
                    >
                      <Text style={styles.btnTexto}>Completada</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnNoAsistio}
                      onPress={() => cambiarEstado(item.id, 'no_asistio')}
                    >
                      <Text style={styles.btnTexto}>No asistió</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: '#555555', fontSize: 14 },
  card: {
    flexDirection: 'row', backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  cardHora: { alignItems: 'center', marginRight: 14, minWidth: 45 },
  horaInicio: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  horaFin: { color: '#AAAAAA', fontSize: 12, marginTop: 4 },
  cardInfo: { flex: 1 },
  clienteNombre: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  servicios: { color: '#AAAAAA', fontSize: 13, marginBottom: 8 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, fontSize: 12, fontWeight: 'bold' },
  pago: { color: '#AAAAAA', fontSize: 13 },
  acciones: { flexDirection: 'row', gap: 8 },
  btnCompletada: { flex: 1, backgroundColor: '#1A3A2A', borderRadius: 8, padding: 8, alignItems: 'center' },
  btnNoAsistio: { flex: 1, backgroundColor: '#3A1A1A', borderRadius: 8, padding: 8, alignItems: 'center' },
  btnTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  vacioTitulo: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  fecha: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  contador: { color: '#AAAAAA', fontSize: 13 },
});