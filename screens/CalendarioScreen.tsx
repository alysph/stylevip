import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useReserva } from '../context/ReservaContext';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendario'>;

function generarHoras(inicio: string, fin: string, duracionMinutos: number, horasOcupadas: {inicio: string, fin: string}[]) {
  const horas: string[] = [];
  const [hInicio, mInicio] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);
  let actual = hInicio * 60 + mInicio;
  const cierreMinutos = hFin * 60 + mFin;

  while (actual + duracionMinutos <= cierreMinutos) {
    const hh = Math.floor(actual / 60).toString().padStart(2, '0');
    const mm = (actual % 60).toString().padStart(2, '0');
    const horaStr = `${hh}:${mm}`;
    const horaFinStr = (() => {
      const fin = actual + duracionMinutos;
      return `${Math.floor(fin/60).toString().padStart(2,'0')}:${(fin%60).toString().padStart(2,'0')}`;
    })();

    const ocupada = horasOcupadas.some(h => {
      const inicioOcupado = h.inicio.slice(0,5);
      const finOcupado = h.fin.slice(0,5);
      return horaStr < finOcupado && horaFinStr > inicioOcupado;
    });

    if (!ocupada) horas.push(horaStr);
    actual += 15;
  }
  return horas;
}

export default function CalendarioScreen({ route }: any) {
  const navigation = useNavigation<NavigationProp>();
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const { totalMinutos, setFechaSeleccionada: setFechaContexto, setHoraSeleccionada: setHoraContexto } = useReserva();
  const duracionTotal = totalMinutos || 45;

  const hoy = new Date().toISOString().split('T')[0];

  async function seleccionarFecha(day: DateData) {
    setFechaSeleccionada(day.dateString);
    setHoraSeleccionada('');
    setCargando(true);

    const diaSemana = new Date(day.dateString + 'T12:00:00').getDay();
    const { data: horario } = await supabase
      .from('horario_atencion')
      .select('*')
      .eq('dia_semana', diaSemana === 0 ? 6 : diaSemana - 1)
      .eq('activo', true)
      .single();

    if (!horario) {
      setHorasDisponibles([]);
      setCargando(false);
      return;
    }

    const { data: reservas } = await supabase
      .from('reservas')
      .select('hora_inicio, hora_fin')
      .eq('fecha', day.dateString)
      .neq('estado', 'cancelada');

    const horas = generarHoras(
      horario.hora_apertura.slice(0, 5),
      horario.hora_cierre.slice(0, 5),
      duracionTotal,
      (reservas || []).map(r => ({ inicio: r.hora_inicio, fin: r.hora_fin }))
    );

    setHorasDisponibles(horas);
    setCargando(false);
  }

  return (
    <View style={styles.container}>
      <Calendar
        minDate={hoy}
        onDayPress={seleccionarFecha}
        markedDates={fechaSeleccionada ? {
          [fechaSeleccionada]: { selected: true, selectedColor: '#C9A84C' }
        } : {}}
        theme={{
          backgroundColor: '#0D0D0D',
          calendarBackground: '#0D0D0D',
          textSectionTitleColor: '#AAAAAA',
          selectedDayBackgroundColor: '#FFFFFF',
          selectedDayTextColor: '#0D0D0D',
          todayTextColor: '#FFFFFF',
          dayTextColor: '#FFFFFF',
          textDisabledColor: '#333333',
          arrowColor: '#FFFFFF',
          monthTextColor: '#FFFFFF',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
        }}
      />

      {fechaSeleccionada && (
        <View style={styles.horasContainer}>
          <Text style={styles.horasTitulo}>
            Horas disponibles — {fechaSeleccionada}
          </Text>

          {cargando ? (
            <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />
          ) : horasDisponibles.length === 0 ? (
            <Text style={styles.sinHoras}>No hay horas disponibles para este día</Text>
          ) : (
            <FlatList
              data={horasDisponibles}
              keyExtractor={item => item}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.horaBtn, horaSeleccionada === item && styles.horaBtnSeleccionada]}
                  onPress={() => setHoraSeleccionada(item)}
                >
                  <Text style={[styles.horaTexto, horaSeleccionada === item && styles.horaTextoSeleccionado]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {horaSeleccionada && (
        <View style={styles.botonContainer}>
          <TouchableOpacity
            style={styles.botonContinuar}
            onPress={() => {
              setFechaContexto(fechaSeleccionada);
              setHoraContexto(horaSeleccionada);
              navigation.navigate('DatosCliente');
            }}
          >
            <Text style={styles.botonTexto}>Continuar con {horaSeleccionada} →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  horasContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  horasTitulo: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  sinHoras: { color: '#AAAAAA', textAlign: 'center', marginTop: 20 },
  horaBtn: {
    flex: 1, margin: 5, padding: 12, borderRadius: 8,
    backgroundColor: '#1A1A1A', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A',
  },
  horaBtnSeleccionada: { borderColor: '#FFFFFF', backgroundColor: '#1A1A1A' },
  horaTexto: { color: '#FFFFFF', fontSize: 15 },
  horaTextoSeleccionado: { color: '#FFFFFF', fontWeight: 'bold' },
  botonContainer: { padding: 16 },
  botonContinuar: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonTexto: { color: '#0D0D0D', fontSize: 16, fontWeight: 'bold' },
});