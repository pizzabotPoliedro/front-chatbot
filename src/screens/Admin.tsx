import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { ArrowLeft, Pencil, Trash2, UserSquare2, Store, PlusCircle } from 'lucide-react-native';
import axios from 'axios';

const Admin = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRestaurant, setEditRestaurant] = useState(false);
  const [editAdmin, setEditAdmin] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRestaurant, setCreateRestaurant] = useState(false);
  const [createAdmin, setCreateAdmin] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRestaurant(!!user.restaurant);
    setEditAdmin(!!user.admin);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('email', editEmail);
      formData.append('phone', editPhone);
      formData.append('restaurant', editRestaurant ? 'true' : 'false');
      formData.append('admin', editAdmin ? 'true' : 'false');
      await axios.put(
        `${apiUrl}/users/${selectedUser.email}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setEditModalVisible(false);
      fetchUsers();
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o usuário.');
    }
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${user.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${apiUrl}/users/${user.email}`);
              fetchUsers();
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          }
        }
      ]
    );
  };

  const handleOpenCreate = () => {
    setCreateName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreatePassword('');
    setCreateRestaurant(false);
    setCreateAdmin(false);
    setCreateModalVisible(true);
  };

  const handleSaveCreate = async () => {
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      Alert.alert('Erro', 'Preencha nome, e-mail e senha.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', createName);
      formData.append('email', createEmail);
      formData.append('password', createPassword);
      formData.append('phone', createPhone);
      formData.append('restaurant', createRestaurant ? 'true' : 'false');
      formData.append('admin', createAdmin ? 'true' : 'false');
      await axios.post(
        `${apiUrl}/users`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setCreateModalVisible(false);
      fetchUsers();
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o usuário.');
    }
  };

  const restaurants = users.filter(u => u.restaurant);
  const clientes = users.filter(u => !u.restaurant);

  const renderUserItem = (user: any, isRestaurant: boolean) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.phone && <Text style={styles.userPhone}>Tel: {user.phone}</Text>}
        {user.admin && <Text style={styles.adminTag}>Administrador</Text>}
        <Text style={styles.registeredDate}>Cadastrado em: {user.created_at ? user.created_at.split('T')[0] : '-'}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditUser(user)}>
          <Pencil size={20} color="#F9A826" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(user)}>
          <Trash2 size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administração</Text>
        <TouchableOpacity onPress={handleOpenCreate}>
          <PlusCircle size={28} color="#F9A826" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F9A826']} tintColor="#F9A826" />
        }
      >
        <Text style={styles.sectionTitle}><Store size={18} color="#F9A826" /> Restaurantes</Text>
        <Text style={styles.sectionSubtitle}>Total: {restaurants.length} restaurantes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#F9A826" style={{ marginVertical: 20 }} />
        ) : restaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum restaurante cadastrado</Text>
          </View>
        ) : (
          restaurants.map(u => (
            <View key={u._id}>{renderUserItem(u, true)}</View>
          ))
        )}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}><UserSquare2 size={18} color="#F9A826" /> Usuários</Text>
        <Text style={styles.sectionSubtitle}>Total: {clientes.length} usuários</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#F9A826" style={{ marginVertical: 20 }} />
        ) : clientes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
          </View>
        ) : (
          clientes.map(u => (
            <View key={u._id}>{renderUserItem(u, false)}</View>
          ))
        )}
      </ScrollView>
      {/* Modal de edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do usuário"
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={editEmail}
              onChangeText={setEditEmail}
              autoCapitalize="none"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone (opcional)"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <View style={styles.switchColumn}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Restaurante?</Text>
                <TouchableOpacity
                  style={[styles.switchButton, editRestaurant ? styles.switchOn : styles.switchOff]}
                  onPress={() => setEditRestaurant(!editRestaurant)}
                >
                  <Text style={styles.switchText}>{editRestaurant ? 'Sim' : 'Não'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Administrador?</Text>
                <TouchableOpacity
                  style={[styles.switchButton, editAdmin ? styles.switchOn : styles.switchOff]}
                  onPress={() => setEditAdmin(!editAdmin)}
                >
                  <Text style={styles.switchText}>{editAdmin ? 'Sim' : 'Não'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de criação */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do usuário"
              value={createName}
              onChangeText={setCreateName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={createEmail}
              onChangeText={setCreateEmail}
              autoCapitalize="none"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={createPassword}
              onChangeText={setCreatePassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone (opcional)"
              value={createPhone}
              onChangeText={setCreatePhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <View style={styles.switchColumn}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Restaurante?</Text>
                <TouchableOpacity
                  style={[styles.switchButton, createRestaurant ? styles.switchOn : styles.switchOff]}
                  onPress={() => setCreateRestaurant(!createRestaurant)}
                >
                  <Text style={styles.switchText}>{createRestaurant ? 'Sim' : 'Não'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Administrador?</Text>
                <TouchableOpacity
                  style={[styles.switchButton, createAdmin ? styles.switchOn : styles.switchOff]}
                  onPress={() => setCreateAdmin(!createAdmin)}
                >
                  <Text style={styles.switchText}>{createAdmin ? 'Sim' : 'Não'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCreate}>
                <Text style={styles.saveButtonText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFDB58',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#B87A00',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F9A826',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  registeredDate: {
    fontSize: 12,
    color: '#999',
  },
  adminTag: {
    color: '#F9A826',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#FFF7E0',
    padding: 10,
    borderRadius: 8,
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#F9A826',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FFF8E1',
  },
  switchColumn: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  switchLabel: {
    fontSize: 15,
    color: '#8B4513',
    marginRight: 10,
    minWidth: 110,
  },
  switchButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  switchOn: {
    backgroundColor: '#F9A826',
  },
  switchOff: {
    backgroundColor: '#EEE',
  },
  switchText: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F9A826',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EEE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B4513',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Admin;
