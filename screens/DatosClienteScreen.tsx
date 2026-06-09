import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useReserva } from '../context/ReservaContext';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DatosCliente'>;

export default function DatosClienteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(false);
  const { setClienteId, setMetodoPago } = useReserva();

  async function buscarCliente(tel: string) {
    if (tel.length < 9) return;
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', tel)
      .single();

    if (data) {
      setNombre(data.nombre);
      setApellido(data.apellido);
      setCorreo(data.correo);
    }
  }

  function validar() {
    if (!nombre.trim()) return 'Ingresa tu nombre';
    if (!apellido.trim()) return 'Ingresa tu apellido';
    if (!correo.trim() || !correo.includes('@')) return 'Ingresa un correo válido';
    if (!telefono.trim() || telefono.length < 9) return 'Ingresa un teléfono válido';
    return null;
  }

  async function continuar() {
    const error = validar();
    if (error) {
      Alert.alert('Campos incompletos', error);
      return;
    }

    setCargando(true);

    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', telefono)
      .single();

    if (!clienteExistente) {
      await supabase.from('clientes').insert({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
      });
    }

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', telefono.trim())
      .single();

    if (cliente) setClienteId(cliente.id);
    setMetodoPago('');
    setCargando(false);
    navigation.navigate('Pago');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Información personal</Text>
      <Text style={styles.subtitulo}>Si ya reservaste antes, ingresa tu teléfono y autocompletamos tus datos.</Text>

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 912345678"
        placeholderTextColor="#666688"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={tel => {
          setTelefono(tel);
          buscarCliente(tel);
        }}
      />

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="#666688"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu apellido"
        placeholderTextColor="#666688"
        value={apellido}
        onChangeText={setApellido}
      />

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="tu@correo.com"
        placeholderTextColor="#666688"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={continuar}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color="#1A1A2E" />
          : <Text style={styles.botonTexto}>Continuar →</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 24 },
  titulo: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { color: '#AAAAAA', fontSize: 13, marginBottom: 28, lineHeight: 20 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  boton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: { color: '#0D0D0D', fontSize: 16, fontWeight: 'bold' },
});