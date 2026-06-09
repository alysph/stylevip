import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReserva } from '../context/ReservaContext';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Confirmacion'>;

export default function ConfirmacionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    serviciosSeleccionados,
    fechaSeleccionada,
    horaSeleccionada,
    totalPrecio,
    totalMinutos,
    metodoPago,
    reservaId,
    resetReserva,
  } = useReserva();

  function calcularHoraFin(horaInicio: string, minutos: number) {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + minutos;
    return `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  const horaFin = calcularHoraFin(horaSeleccionada, totalMinutos);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Reserva confirmada</Text>
      <Text style={styles.subtitulo}>
        Te esperamos en StyleVIP. Recibirás un recordatorio antes de tu cita.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Resumen de tu reserva</Text>

        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Fecha</Text>
          <Text style={styles.filaValor}>{fechaSeleccionada}</Text>
        </View>
        <View style={styles.separador} />

        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Hora</Text>
          <Text style={styles.filaValor}>{horaSeleccionada} — {horaFin}</Text>
        </View>
        <View style={styles.separador} />

        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Duración</Text>
          <Text style={styles.filaValor}>{totalMinutos} minutos</Text>
        </View>
        <View style={styles.separador} />

        <Text style={styles.serviciosTitulo}>Servicios</Text>
        {serviciosSeleccionados.map(s => (
          <View key={s.id} style={styles.filaServicio}>
            <Text style={styles.servicioNombre}>✂️ {s.nombre}</Text>
            <Text style={styles.servicioPrecio}>${s.precio.toLocaleString()}</Text>
          </View>
        ))}
        <View style={styles.separador} />

        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Pago</Text>
          <Text style={styles.filaBadge}>
            {metodoPago === 'online' ? 'Pagado online' : 'Efectivo en el local'}
          </Text>
        </View>
        <View style={styles.separador} />

        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Total</Text>
          <Text style={styles.filaTotal}>${totalPrecio.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() => navigation.navigate('Cancelacion', { reservaId })}
      >
        <Text style={styles.botonCancelarTexto}>❌ Cancelar mi reserva</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => {
          resetReserva();
          navigation.navigate('Home');
        }}
      >
        <Text style={styles.botonTexto}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24, alignItems: 'center' },
  icono: { display: 'none' },
  titulo: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitulo: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 20, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  cardTitulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  filaLabel: { color: '#AAAAAA', fontSize: 14 },
  filaValor: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  filaTotal: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  filaBadge: { color: '#4CAF50', fontSize: 13, fontWeight: 'bold' },
  serviciosTitulo: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  filaServicio: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  servicioNombre: { color: '#AAAAAA', fontSize: 14 },
  servicioPrecio: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  separador: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 12 },
  botonCancelar: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F44336' },
  botonCancelarTexto: { color: '#F44336', fontSize: 15, fontWeight: 'bold' },
  boton: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, alignItems: 'center', width: '100%' },
  botonTexto: { color: '#0D0D0D', fontSize: 16, fontWeight: 'bold' },
});