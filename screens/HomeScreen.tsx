import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useReserva } from '../context/ReservaContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [seleccionados, setSeleccionados] = useState<Servicio[]>([]);
  const { setServiciosSeleccionados } = useReserva();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarServicios() {
      const { data } = await supabase.from('servicios').select('*').eq('activo', true).order('precio', { ascending: true });
      if (data) setServicios(data);
      setCargando(false);
    }
    cargarServicios();
  }, []);

  function toggleServicio(servicio: Servicio) {
    setSeleccionados(prev =>
      prev.find(s => s.id === servicio.id)
        ? prev.filter(s => s.id !== servicio.id)
        : [...prev, servicio]
    );
  }

  const totalPrecio = seleccionados.reduce((sum, s) => sum + s.precio, 0);
  const totalMinutos = seleccionados.reduce((sum, s) => sum + s.duracion_minutos, 0);

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return (
  <View style={styles.container}>
    <View style={styles.separador} />
      <Text style={styles.subtitulo}>Selecciona uno o más servicios</Text>

    <FlatList
      data={servicios}
      keyExtractor={item => item.id}
      style={styles.lista}
      renderItem={({ item }) => {
        const estaSeleccionado = seleccionados.find(s => s.id === item.id);
        return (
          <TouchableOpacity
            style={[styles.card, estaSeleccionado && styles.cardSeleccionado]}
            onPress={() => toggleServicio(item)}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <Text style={styles.cardDesc}>{item.descripcion}</Text>
              <Text style={styles.cardDuracion}>⏱ {item.duracion_minutos} min</Text>
            </View>
            <View style={styles.cardDerecha}>
              <Text style={styles.cardPrecio}>${item.precio.toLocaleString()}</Text>
              {estaSeleccionado && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      }}
    />

    <View style={styles.footer}>
      {seleccionados.length > 0 && (
        <View style={styles.resumen}>
          <View style={styles.resumenInfo}>
            <Text style={styles.resumenTexto}>{seleccionados.length} servicio(s) · {totalMinutos} min</Text>
            <Text style={styles.resumenPrecio}>${totalPrecio.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.botonContinuar}
            onPress={() => {
              setServiciosSeleccionados(seleccionados);
              navigation.navigate('Calendario');
            }}
          >
            <Text style={styles.botonTexto}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.accesosContainer}>
        <TouchableOpacity
          style={styles.botonBarbero}
          onPress={() => navigation.navigate('LoginBarbero')}
        >
          <Text style={styles.botonBarberoTexto}>Barbero</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonBarbero}
          onPress={() => navigation.navigate('LoginAdmin')}
        >
          <Text style={styles.botonBarberoTexto}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  subtitulo: { color: '#AAAAAA', fontSize: 14, textAlign: 'center', marginVertical: 16 },
  lista: { flex: 1, paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardSeleccionado: { borderColor: '#FFFFFF', borderWidth: 2 },
  cardInfo: { flex: 1 },
  cardNombre: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#AAAAAA', fontSize: 13, marginBottom: 6 },
  cardDuracion: { color: '#AAAAAA', fontSize: 13 },
  cardDerecha: { alignItems: 'flex-end', justifyContent: 'space-between' },
  cardPrecio: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  checkmark: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  footer: { backgroundColor: '#0D0D0D' },
  resumen: { backgroundColor: '#1A1A1A', padding: 16, borderTopWidth: 1, borderTopColor: '#FFFFFF' },
  resumenInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  resumenTexto: { color: '#AAAAAA', fontSize: 14 },
  resumenPrecio: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botonContinuar: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonTexto: { color: '#0D0D0D', fontSize: 16, fontWeight: 'bold' },
  accesosContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
  },
  botonBarbero: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  botonBarberoTexto: { color: '#555555', fontSize: 11 },
  separador: { height: 1, backgroundColor: '#2A2A2A', marginHorizontal: 16, marginBottom: 8 },
});