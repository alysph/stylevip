import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

type ReservaSemana = {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  monto_total: number;
  clientes: { nombre: string; apellido: string };
};

export default function AgendaSemanaScreen() {
  const [reservas, setReservas] = useState<ReservaSemana[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarSemana();
  }, []);

  function obtenerRangoSemana() {
    const hoy = new Date();
    const dia = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return {
      inicio: lunes.toISOString().split('T')[0],
      fin: domingo.toISOString().split('T')[0],
    };
  }

  async function cargarSemana() {
    setCargando(true);
    const { inicio, fin } = obtenerRangoSemana();
    const { data } = await supabase
      .from('reservas')
      .select(`id, fecha, hora_inicio, estado, monto_total, clientes (nombre, apellido)`)
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .neq('estado', 'cancelada')
      .order('fecha')
      .order('hora_inicio');

    if (data) setReservas(data as any);
    setCargando(false);
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

  const diasUnicos = [...new Set(reservas.map(r => r.fecha))];

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#C9A84C" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📆 Esta semana</Text>

      {reservas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No hay citas esta semana</Text>
        </View>
      ) : (
        <FlatList
          data={diasUnicos}
          keyExtractor={item => item}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: fecha }) => (
            <View style={styles.diaContainer}>
              <Text style={styles.diaTitulo}>{fecha}</Text>
              {reservas
                .filter(r => r.fecha === fecha)
                .map(r => (
                  <View key={r.id} style={styles.card}>
                    <Text style={styles.hora}>{r.hora_inicio.slice(0, 5)}</Text>
                    <Text style={styles.nombre}>{r.clientes.nombre} {r.clientes.apellido}</Text>
                    <View style={[styles.dot, { backgroundColor: colorEstado(r.estado) }]} />
                  </View>
                ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  titulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: '#AAAAAA', fontSize: 16 },
  diaContainer: { marginBottom: 20 },
  diaTitulo: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8, paddingHorizontal: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 10,
    padding: 12, marginBottom: 8, marginHorizontal: 16,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  hora: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', minWidth: 50 },
  nombre: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});