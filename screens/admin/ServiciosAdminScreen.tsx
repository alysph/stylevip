import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { supabase } from '../../lib/supabase';

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  activo: boolean;
};

export function ServiciosAdminScreen() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');

  useEffect(() => { cargarServicios(); }, []);

  async function cargarServicios() {
    setCargando(true);
    const { data } = await supabase.from('servicios').select('*').order('nombre');
    if (data) setServicios(data);
    setCargando(false);
  }

  function abrirModal(servicio?: Servicio) {
    if (servicio) {
      setEditando(servicio);
      setNombre(servicio.nombre);
      setDescripcion(servicio.descripcion);
      setPrecio(servicio.precio.toString());
      setDuracion(servicio.duracion_minutos.toString());
    } else {
      setEditando(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setDuracion('');
    }
    setModalVisible(true);
  }

  async function guardar() {
    if (!nombre || !precio || !duracion) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (editando) {
      await supabase.from('servicios').update({
        nombre, descripcion, precio: parseInt(precio), duracion_minutos: parseInt(duracion),
      }).eq('id', editando.id);
    } else {
      await supabase.from('servicios').insert({
        nombre, descripcion, precio: parseInt(precio), duracion_minutos: parseInt(duracion),
      });
    }
    setModalVisible(false);
    cargarServicios();
  }

  async function toggleActivo(servicio: Servicio) {
    await supabase.from('servicios').update({ activo: !servicio.activo }).eq('id', servicio.id);
    cargarServicios();
  }

  if (cargando) return <View style={styles.container}><ActivityIndicator color="#C9A84C" size="large" /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.botonAgregar} onPress={() => abrirModal()}>
        <Text style={styles.botonAgregarTexto}>+ Agregar servicio</Text>
      </TouchableOpacity>

      <FlatList
        data={servicios}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.activo && styles.cardInactivo]}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <Text style={styles.cardDetalle}>${item.precio.toLocaleString()} · {item.duracion_minutos} min</Text>
              {!item.activo && <Text style={styles.inactivoBadge}>Desactivado</Text>}
            </View>
            <View style={styles.acciones}>
              <TouchableOpacity style={styles.btnEditar} onPress={() => abrirModal(item)}>
                <Text style={styles.btnTexto}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnToggle, item.activo ? styles.btnDesactivar : styles.btnActivar]}
                onPress={() => toggleActivo(item)}
              >
                <Text style={styles.btnTexto}>{item.activo ? '🔴' : '🟢'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>{editando ? 'Editar servicio' : 'Nuevo servicio'}</Text>
            <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#666688" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Descripción" placeholderTextColor="#666688" value={descripcion} onChangeText={setDescripcion} />
            <TextInput style={styles.input} placeholder="Precio (CLP)" placeholderTextColor="#666688" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
            <TextInput style={styles.input} placeholder="Duración (minutos)" placeholderTextColor="#666688" keyboardType="numeric" value={duracion} onChangeText={setDuracion} />
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={guardar}>
                <Text style={styles.btnGuardarTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  botonAgregar: { margin: 16, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonAgregarTexto: { color: '#0D0D0D', fontSize: 15, fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  cardInactivo: { opacity: 0.5 },
  cardInfo: { flex: 1 },
  cardNombre: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDetalle: { color: '#AAAAAA', fontSize: 13 },
  inactivoBadge: { color: '#F44336', fontSize: 12, marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnEditar: { backgroundColor: '#2A2A2A', borderRadius: 8, padding: 8 },
  btnToggle: { borderRadius: 8, padding: 8 },
  btnDesactivar: { backgroundColor: '#3A1A1A' },
  btnActivar: { backgroundColor: '#1A3A2A' },
  btnTexto: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitulo: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 },
  modalBotones: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnCancelarTexto: { color: '#AAAAAA', fontSize: 15, fontWeight: 'bold' },
  btnGuardar: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnGuardarTexto: { color: '#0D0D0D', fontSize: 15, fontWeight: 'bold' },
});