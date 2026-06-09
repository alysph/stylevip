import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useReserva } from '../context/ReservaContext';
import { enviarConfirmacion } from '../services/emailService';
import { crearPreferencia } from '../services/mercadoPagoService';
import * as WebBrowser from 'expo-web-browser';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pago'>;

export default function PagoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [cargando, setCargando] = useState(false);
  const {
    serviciosSeleccionados,
    fechaSeleccionada,
    horaSeleccionada,
    totalPrecio,
    totalMinutos,
    clienteId,
    setMetodoPago,
    resetReserva,
    setReservaId,
  } = useReserva();

  function calcularHoraFin(horaInicio: string, minutos: number) {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + minutos;
    return `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  async function confirmarReserva(metodo: string) {
    setCargando(true);
    setMetodoPago(metodo);

    const horaFin = calcularHoraFin(horaSeleccionada, totalMinutos);

    if (metodo === 'online') {
      const items = serviciosSeleccionados.map(s => ({
        title: s.nombre,
        quantity: 1,
        unit_price: s.precio,
      }));

      const { data: cliente } = await supabase
        .from('clientes')
        .select('nombre, correo')
        .eq('id', clienteId)
        .single();

      if (cliente) {
        const initPoint = await crearPreferencia(items, cliente.nombre, cliente.correo);
        if (initPoint) {
          await WebBrowser.openBrowserAsync(initPoint);
        }
      }
    }

    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        cliente_id: clienteId,
        fecha: fechaSeleccionada,
        hora_inicio: horaSeleccionada,
        hora_fin: horaFin,
        estado: metodo === 'online' ? 'confirmada_pagada' : 'confirmada_pendiente',
        metodo_pago: metodo,
        monto_total: totalPrecio,
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Error', 'No se pudo crear la reserva. Intenta de nuevo.');
      setCargando(false);
      return;
    }

    if (reserva) setReservaId(reserva.id);
    if (reserva) {
      await Promise.all(
        serviciosSeleccionados.map(s =>
          supabase.from('reserva_servicios').insert({
            reserva_id: reserva.id,
            servicio_id: s.id,
          })
        )
      );
    }

    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombre, correo')
      .eq('id', clienteId)
      .single();

    if (cliente && reserva) {
      await enviarConfirmacion({
        nombre: cliente.nombre,
        correo: cliente.correo,
        fecha: fechaSeleccionada,
        horaInicio: horaSeleccionada,
        horaFin: horaFin,
        servicios: serviciosSeleccionados.map(s => s.nombre),
        total: totalPrecio,
        metodoPago: metodo,
        reservaId: reserva.id,
      });
    }

    setCargando(false);
    navigation.navigate('Confirmacion');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>¿Cómo prefieres pagar?</Text>
      <Text style={styles.subtitulo}>Elige tu método de pago para confirmar la reserva.</Text>

      <View style={styles.resumen}>
        <Text style={styles.resumenMarca}>STYLEVIP</Text>
        <Text style={styles.resumenTitulo}>Resumen de tu cita</Text>
        <Text style={styles.resumenTexto}>{fechaSeleccionada} a las {horaSeleccionada}</Text>
        <Text style={styles.resumenTexto}>{totalMinutos} minutos</Text>
        <Text style={styles.resumenPrecio}>Total: ${totalPrecio.toLocaleString()}</Text>
      </View>

      {cargando ? (
        <ActivityIndicator color="#C9A84C" size="large" style={{ marginTop: 32 }} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.card}
            onPress={() => confirmarReserva('online')}
          >
            <Text style={styles.cardIcono}>💳</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo}>Pagar ahora</Text>
              <Text style={styles.cardDesc}>Pago online con tarjeta o transferencia</Text>
            </View>
            <Text style={styles.cardFlecha}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => confirmarReserva('efectivo')}
          >
            <Text style={styles.cardIcono}>💵</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo}>Pagar en el local</Text>
              <Text style={styles.cardDesc}>Pago en efectivo al llegar a StyleVIP</Text>
            </View>
            <Text style={styles.cardFlecha}>→</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 24 },
  titulo: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { color: '#AAAAAA', fontSize: 13, marginBottom: 24, lineHeight: 20 },
  resumen: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16,
    marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2A',
  },
  resumenTitulo: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  resumenTexto: { color: '#AAAAAA', fontSize: 14, marginBottom: 4 },
  resumenPrecio: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A',
  },
  cardIcono: { fontSize: 32, marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitulo: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#AAAAAA', fontSize: 13 },
  cardFlecha: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  resumenMarca: { color: '#555555', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginBottom: 4 },
});