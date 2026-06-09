import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';

type Horario = {
  id: string;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
};

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function HorariosAdminScreen() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [bloqueos, setBloqueos] = useState<any[]>([]);
  const [modalBloqueo, setModalBloqueo] = useState(false);
  const [fechaBloqueo, setFechaBloqueo] = useState('');
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [horaInicioBloqueo, setHoraInicioBloqueo] = useState('');
  const [horaFinBloqueo, setHoraFinBloqueo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [horaApertura, setHoraApertura] = useState('');
  const [horaCierre, setHoraCierre] = useState('');

  useEffect(() => {
    cargarHorarios();
    cargarBloqueos();
  }, []);

  async function cargarBloqueos() {
    const { data } = await supabase
      .from('bloqueos')
      .select('*')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha');
    if (data) setBloqueos(data);
  }

  async function agregarBloqueo() {
    if (!fechaBloqueo) {
      Alert.alert('Error', 'Ingresa una fecha');
      return;
    }
    const { error } = await supabase.from('bloqueos').insert({
      fecha: fechaBloqueo,
      hora_inicio: diaCompleto ? null : horaInicioBloqueo,
      hora_fin: diaCompleto ? null : horaFinBloqueo,
      motivo: motivoBloqueo,
    });
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setModalBloqueo(false);
    setFechaBloqueo('');
    setMotivoBloqueo('');
    setHoraInicioBloqueo('');
    setHoraFinBloqueo('');
    cargarBloqueos();
  }

  async function eliminarBloqueo(id: string) {
    Alert.alert(
      'Eliminar bloqueo',
      '¿Estás seguro?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('bloqueos').delete().eq('id', id);
            cargarBloqueos();
          },
        },
      ]
    );
  }

  async function cargarHorarios() {
    setCargando(true);
    const { data } = await supabase.from('horario_atencion').select('*').order('dia_semana');
    if (data) setHorarios(data);
    setCargando(false);
  }

  async function toggleDia(horario: Horario) {
    await supabase.from('horario_atencion').update({ activo: !horario.activo }).eq('id', horario.id);
    cargarHorarios();
  }

  function abrirEdicion(horario: Horario) {
    setEditandoId(horario.id);
    setHoraApertura(horario.hora_apertura.slice(0, 5));
    setHoraCierre(horario.hora_cierre.slice(0, 5));
  }

  async function guardarHorario(id: string) {
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaApertura) || !horaRegex.test(horaCierre)) {
      Alert.alert('Error', 'Formato de hora inválido. Usa HH:MM (ej: 09:00)');
      return;
    }
    await supabase.from('horario_atencion').update({
      hora_apertura: horaApertura,
      hora_cierre: horaCierre,
    }).eq('id', id);
    setEditandoId(null);
    cargarHorarios();
  }

  if (cargando) return <View style={styles.container}><ActivityIndicator color="#C9A84C" size="large" /></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Horario de atención</Text>
      {horarios.map(item => (
        <View key={item.id} style={[styles.card, !item.activo && styles.cardInactivo]}>
          <View style={styles.cardHeader}>
            <Text style={styles.diaNombre}>{DIAS[item.dia_semana]}</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, item.activo ? styles.toggleActivo : styles.toggleInactivo]}
              onPress={() => toggleDia(item)}
            >
              <Text style={styles.toggleTexto}>{item.activo ? 'Abierto' : 'Cerrado'}</Text>
            </TouchableOpacity>
          </View>

          {item.activo && (
            editandoId === item.id ? (
              <View style={styles.edicion}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Apertura</Text>
                    <TextInput
                      style={styles.input}
                      value={horaApertura}
                      onChangeText={setHoraApertura}
                      placeholder="09:00"
                      placeholderTextColor="#666688"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cierre</Text>
                    <TextInput
                      style={styles.input}
                      value={horaCierre}
                      onChangeText={setHoraCierre}
                      placeholder="19:00"
                      placeholderTextColor="#666688"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.botonesEdicion}>
                  <TouchableOpacity style={styles.btnCancelar} onPress={() => setEditandoId(null)}>
                    <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnGuardar} onPress={() => guardarHorario(item.id)}>
                    <Text style={styles.btnGuardarTexto}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.horarioRow} onPress={() => abrirEdicion(item)}>
                <Text style={styles.horarioTexto}>
                  🕐 {item.hora_apertura.slice(0, 5)} — {item.hora_cierre.slice(0, 5)}
                </Text>
                <Text style={styles.editarTexto}>✏️ Editar</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ))}

      <View style={styles.seccionBloqueos}>
        <Text style={styles.titulo}>Días bloqueados</Text>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setModalBloqueo(true)}
        >
          <Text style={styles.botonAgregarTexto}>+ Agregar bloqueo</Text>
        </TouchableOpacity>

        {bloqueos.length === 0 ? (
          <Text style={styles.sinBloqueos}>No hay días bloqueados próximos</Text>
        ) : (
          bloqueos.map(b => (
            <View key={b.id} style={styles.bloqueoCard}>
              <View style={styles.bloqueoInfo}>
                <Text style={styles.bloqueoFecha}>🚫 {b.fecha}</Text>
                <Text style={styles.bloqueoDetalle}>
                  {b.hora_inicio ? `${b.hora_inicio.slice(0, 5)} — ${b.hora_fin.slice(0, 5)}` : 'Día completo'}
                </Text>
                {b.motivo ? <Text style={styles.bloqueoMotivo}>{b.motivo}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => eliminarBloqueo(b.id)}>
                <Text style={styles.btnEliminar}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal visible={modalBloqueo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Nuevo bloqueo</Text>

            <Text style={styles.inputLabel}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-05-20"
              placeholderTextColor="#666688"
              value={fechaBloqueo}
              onChangeText={setFechaBloqueo}
            />

            <View style={styles.checkRow}>
              <TouchableOpacity
                style={[styles.checkbox, diaCompleto && styles.checkboxActivo]}
                onPress={() => setDiaCompleto(!diaCompleto)}
              >
                <Text style={styles.checkboxTexto}>{diaCompleto ? '✓' : ''}</Text>
              </TouchableOpacity>
              <Text style={styles.checkLabel}>Día completo</Text>
            </View>

            {!diaCompleto && (
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Desde</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="09:00"
                    placeholderTextColor="#666688"
                    value={horaInicioBloqueo}
                    onChangeText={setHoraInicioBloqueo}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hasta</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12:00"
                    placeholderTextColor="#666688"
                    value={horaFinBloqueo}
                    onChangeText={setHoraFinBloqueo}
                  />
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Motivo (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Feriado, vacaciones..."
              placeholderTextColor="#666688"
              value={motivoBloqueo}
              onChangeText={setMotivoBloqueo}
            />

            <View style={styles.botonesEdicion}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalBloqueo(false)}>
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={agregarBloqueo}>
                <Text style={styles.btnGuardarTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  titulo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  cardInactivo: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diaNombre: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  toggleBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  toggleActivo: { backgroundColor: '#1A3A2A' },
  toggleInactivo: { backgroundColor: '#3A1A1A' },
  toggleTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  horarioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  horarioTexto: { color: '#AAAAAA', fontSize: 14 },
  editarTexto: { color: '#AAAAAA', fontSize: 13 },
  edicion: { marginTop: 12 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1 },
  inputLabel: { color: '#AAAAAA', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#0D0D0D', borderRadius: 8, padding: 10, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A2A' },
  botonesEdicion: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnCancelar: { flex: 1, backgroundColor: '#0D0D0D', borderRadius: 8, padding: 10, alignItems: 'center' },
  btnCancelarTexto: { color: '#AAAAAA', fontSize: 14, fontWeight: 'bold' },
  btnGuardar: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, alignItems: 'center' },
  btnGuardarTexto: { color: '#0D0D0D', fontSize: 14, fontWeight: 'bold' },
  seccionBloqueos: { marginTop: 8, paddingBottom: 32 },
  botonAgregar: { margin: 16, marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  botonAgregarTexto: { color: '#0D0D0D', fontSize: 14, fontWeight: 'bold' },
  sinBloqueos: { color: '#AAAAAA', textAlign: 'center', marginTop: 12, fontSize: 14 },
  bloqueoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 14, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  bloqueoInfo: { flex: 1 },
  bloqueoFecha: { color: '#F44336', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  bloqueoDetalle: { color: '#AAAAAA', fontSize: 13 },
  bloqueoMotivo: { color: '#555555', fontSize: 12, marginTop: 2 },
  btnEliminar: { fontSize: 22 },
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0D0D0D', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitulo: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxActivo: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  checkboxTexto: { color: '#0D0D0D', fontWeight: 'bold', fontSize: 14 },
  checkLabel: { color: '#FFFFFF', fontSize: 14 },
});