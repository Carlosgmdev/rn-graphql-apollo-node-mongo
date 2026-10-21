import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';
import { CREATE_TASK, GET_BOARD, SET_TASK_STATUS, type Task, type TaskStatus } from '../graphql/operations';
import { addTaskToBoard } from '../apollo/updateBoard';
import { GRAPHQL_URL } from '../apollo/client';

const labels: Record<TaskStatus, string> = { TODO: 'Pendiente', IN_PROGRESS: 'En progreso', DONE: 'Terminada' };
const nextStatus: Record<TaskStatus, TaskStatus> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };

function TaskCard({ task }: { task: Task }) {
  const [setStatus, { loading }] = useMutation(SET_TASK_STATUS);
  const changeStatus = async () => {
    try {
      // id + __typename identifican la entidad; Apollo actualiza status en caché.
      // No usamos refetchQueries aquí: observa la normalización en acción.
      await setStatus({ variables: { id: task.id, status: nextStatus[task.status] } });
    } catch (error) {
      Alert.alert('No se pudo actualizar', error instanceof Error ? error.message : 'Error de conexión');
    }
  };
  return (
    <View style={styles.card}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.muted}>{task.assignee?.name ?? 'Sin responsable'}</Text>
      <Text style={styles.status}>{labels[task.status]}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Cambiar estado de ${task.title}`}
        disabled={loading} onPress={changeStatus} style={[styles.secondaryButton, loading && styles.disabled]}>
        <Text style={styles.link}>{loading ? 'Guardando…' : `Pasar a: ${labels[nextStatus[task.status]]}`}</Text>
      </Pressable>
    </View>
  );
}

export function BoardScreen() {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const { data, loading, error, refetch, networkStatus } = useQuery(GET_BOARD, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [createTask, { loading: creating, error: createError }] = useMutation(CREATE_TASK, {
    update(cache, result) {
      if (result.data?.createTask) addTaskToBoard(cache, result.data.createTask);
    },
  });

  const submit = async () => {
    try {
      await createTask({ variables: { input: { title: title.trim(), assigneeId } } });
      setTitle('');
    } catch {
      // El hook expone createError para mostrar el error junto al formulario.
    }
  };
  const refresh = () => {
    refetch().catch(() => {}); // El hook expone el error de red en `error`.
  };
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList<Task>
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          data={data?.tasks ?? []}
          keyExtractor={task => task.id}
          renderItem={({ item }) => <TaskCard task={item} />}
          refreshing={networkStatus === NetworkStatus.refetch}
          onRefresh={refresh}
          ListHeaderComponent={
            <View>
              <Text style={styles.eyebrow}>NODE · REACT NATIVE · APOLLO</Text>
              <Text style={styles.heading}>GraphQL Lab</Text>
              <Text style={styles.subtitle}>Tu tablero para practicar una entrevista técnica.</Text>
              <Text style={styles.sectionTitle}>Nueva tarea</Text>
              <TextInput accessibilityLabel="Título de la tarea" placeholder="¿Qué vas a practicar?"
                placeholderTextColor="#667085" style={styles.input} value={title} onChangeText={setTitle}
                maxLength={120} editable={!creating} />
              <Text style={styles.muted}>Responsable</Text>
              <View style={styles.users}>
                {[{ id: null, name: 'Sin asignar' }, ...(data?.users ?? [])].map(user => (
                  <Pressable key={user.id ?? 'none'} accessibilityRole="button"
                    accessibilityState={{ selected: assigneeId === user.id }}
                    onPress={() => setAssigneeId(user.id)} disabled={creating}
                    style={[styles.chip, assigneeId === user.id && styles.selectedChip]}>
                    <Text style={assigneeId === user.id ? styles.selectedText : styles.link}>{user.name}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable accessibilityRole="button" onPress={submit} disabled={!title.trim() || creating || !data}
                style={[styles.primaryButton, (!title.trim() || creating || !data) && styles.disabled]}>
                <Text style={styles.selectedText}>{creating ? 'Creando…' : 'Crear tarea'}</Text>
              </Pressable>
              {createError && <Text accessibilityRole="alert" style={styles.error}>{createError.message}</Text>}
              <Text style={styles.sectionTitle}>Tareas · {data?.tasks.length ?? 0}</Text>
              {loading && !data && <ActivityIndicator color="#3157d5" accessibilityLabel="Cargando tareas" />}
              {error && <View style={styles.errorBox}>
                <Text accessibilityRole="alert" style={styles.error}>{error.message}</Text>
                <Text style={styles.muted}>Comprueba el backend: {GRAPHQL_URL}</Text>
                <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondaryButton}>
                  <Text style={styles.link}>Reintentar</Text>
                </Pressable>
              </View>}
            </View>
          }
          ListEmptyComponent={!loading && !error ? <Text style={styles.muted}>No hay tareas. Crea la primera.</Text> : null}
          ListFooterComponent={<Text style={styles.footer}>Desliza hacia abajo para consultar el servidor. Los datos se reinician con el backend.</Text>}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6fc' },
  container: { flex: 1 },
  content: { padding: 22, paddingBottom: 36 },
  eyebrow: { color: '#3157d5', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heading: { color: '#17213c', fontSize: 34, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#58627b', marginTop: 6, lineHeight: 21 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#17213c', marginTop: 26, marginBottom: 12 },
  input: { backgroundColor: '#fff', borderColor: '#bbc5dc', borderWidth: 1, borderRadius: 12, padding: 14, color: '#17213c', marginBottom: 12 },
  users: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  chip: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#bbc5dc' },
  selectedChip: { backgroundColor: '#3157d5', borderColor: '#3157d5' },
  selectedText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  primaryButton: { backgroundColor: '#3157d5', borderRadius: 12, padding: 15 },
  disabled: { opacity: 0.45 },
  card: { padding: 18, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e0e5f0', marginBottom: 12 },
  taskTitle: { color: '#17213c', fontSize: 17, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#58627b', lineHeight: 20 },
  status: { color: '#3157d5', fontWeight: '600', marginTop: 10 },
  secondaryButton: { paddingVertical: 12 },
  link: { color: '#2545b2', fontWeight: '600' },
  errorBox: { marginVertical: 12 },
  error: { color: '#b42318', marginTop: 10 },
  footer: { color: '#58627b', fontSize: 12, lineHeight: 19, marginTop: 12 },
});
