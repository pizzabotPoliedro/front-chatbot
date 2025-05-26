import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Trash, CheckSquare, Square, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MenuItem {
  _id: string;
  name: string;
  price: string;
  description: string;
  image?: string | null;
}

const Cardapio = () => {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: null as any,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editFields, setEditFields] = useState({
    name: '',
    price: '',
    description: '',
    image: null as any,
    imagePreview: null as string | null,
    originalImage: null as string | null,
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        if (decoded && decoded.sub) {
          const id = String(decoded.sub);
          setRestaurantId(id);
          fetchMenu(id);
        }
      }
    })();
  }, []);

  const fetchMenu = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/menu/${id}`);
      setMenuItems(res.data.items || []);
    } catch (e) {
      setMenuItems([]);
    }
    setLoading(false);
  };

  const handlePickImage = async (onPick: (img: any, preview: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      onPick(
        {
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.type ? `image/${asset.type}` : 'image/jpeg',
        },
        asset.uri
      );
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !restaurantId) return;
    setCreating(true);
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('price', newItem.price);
    formData.append('description', newItem.description);
    formData.append('restaurant_id', restaurantId);
    if (newItem.image) {
      formData.append('image', {
        uri: newItem.image.uri,
        name: newItem.image.name,
        type: newItem.image.type,
      } as any);
    }
    try {
      await axios.post(`${API_URL}/menu`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMenu(restaurantId);
      setIsAddModalVisible(false);
      setNewItem({ name: '', price: '', description: '', image: null });
      setImagePreview(null);
    } catch (e) {}
    setCreating(false);
  };

  const removeMenuItems = async (ids: string[]) => {
    if (!restaurantId || ids.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => axios.delete(`${API_URL}/menu/${id}`)));
      setSelectedIds([]);
      setSelectionMode(false);
      await fetchMenu(restaurantId);
    } catch (e) {
      setMenuItems([]);
    }
    setLoading(false);
  };

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  const handleSelectItem = (id: string) => {
    if (!selectionMode) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleLongPressItem = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditItem(item);
    setEditFields({
      name: item.name,
      price: item.price,
      description: item.description,
      image: null,
      imagePreview: null,
      originalImage: item.image || null,
    });
    setEditModalVisible(true);
  };

  async function base64ToImageFile(base64: string) {
    const fileUri = FileSystem.cacheDirectory + `edit_image_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return {
      uri: fileUri,
      name: 'image.png',
      type: 'image/png',
    };
  }

  const handleSaveEdit = async () => {
    if (!editItem || !restaurantId) return;
    setEditing(true);
    try {
      await axios.delete(`${API_URL}/menu/${editItem._id}`);
      const formData = new FormData();
      formData.append('name', editFields.name);
      formData.append('price', editFields.price);
      formData.append('description', editFields.description);
      formData.append('restaurant_id', restaurantId);
      if (editFields.image) {
        formData.append('image', {
          uri: editFields.image.uri,
          name: editFields.image.name,
          type: editFields.image.type,
        } as any);
      } else if (editFields.originalImage) {
        const file = await base64ToImageFile(editFields.originalImage);
        formData.append('image', file as any);
      }
      await axios.post(`${API_URL}/menu`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditModalVisible(false);
      setEditItem(null);
      fetchMenu(restaurantId);
    } catch (e) {}
    setEditing(false);
  };

  const hasEditChanged = () => {
    if (!editItem) return false;
    if (
      editFields.name !== editItem.name ||
      editFields.price !== editItem.price ||
      editFields.description !== editItem.description ||
      editFields.imagePreview
    ) {
      return true;
    }
    return false;
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const isSelected = selectedIds.includes(item._id);
    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          selectionMode && isSelected ? styles.menuItemSelected : null,
        ]}
        activeOpacity={selectionMode ? 0.7 : 0.9}
        onPress={() => {
          if (selectionMode) handleSelectItem(item._id);
          else handleOpenEditModal(item);
        }}
        onLongPress={() => handleLongPressItem(item._id)}
        disabled={loading}
      >
        {selectionMode && (
          <View style={{ marginRight: 12, justifyContent: 'center' }}>
            {isSelected ? (
              <CheckSquare size={24} color="#DAA520" />
            ) : (
              <Square size={24} color="#DAA520" />
            )}
          </View>
        )}
        {item.image && (
          <Image
            source={{ uri: `data:image/png;base64,${item.image}` }}
            style={styles.itemImage}
          />
        )}
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (selectionMode) {
              setSelectionMode(false);
              setSelectedIds([]);
            } else {
              navigation.goBack();
            }
          }}
        >
          <ArrowLeft size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cardápio</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectionMode ? (
            <TouchableOpacity
              onPress={() => removeMenuItems(selectedIds)}
              disabled={selectedIds.length === 0 || loading}
              style={[
                styles.headerIconButton,
                selectedIds.length === 0 ? { opacity: 0.5 } : null,
              ]}
            >
              <Trash size={24} color="#8B4513" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsAddModalVisible(true)}
              style={styles.headerIconButton}
            >
              <Plus size={24} color="#8B4513" />
            </TouchableOpacity>
          )}
          {!selectionMode && (
            <TouchableOpacity
              onPress={() => setSelectionMode(true)}
              style={styles.headerIconButton}
            >
              <CheckSquare size={24} color="#8B4513" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#DAA520" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.menuList}
          extraData={selectedIds}
          ListEmptyComponent={
            <Text style={{ color: '#8B4513', textAlign: 'center', marginTop: 60 }}>
              Nenhum item no cardápio.
            </Text>
          }
        />
      )}

      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Adicionar Item</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o nome do item"
                    placeholderTextColor="#A0A0A0"
                    value={newItem.name}
                    onChangeText={(text) =>
                      setNewItem((prev) => ({ ...prev, name: text }))
                    }
                    editable={!creating}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Preço (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o preço"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={newItem.price}
                    onChangeText={(value) =>
                      setNewItem((prev) => ({
                        ...prev,
                        price: value.replace(',', '.'),
                      }))
                    }
                    editable={!creating}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite a descrição"
                    placeholderTextColor="#A0A0A0"
                    value={newItem.description}
                    onChangeText={(text) =>
                      setNewItem((prev) => ({ ...prev, description: text }))
                    }
                    multiline
                    editable={!creating}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Imagem</Text>
                  <TouchableOpacity
                    style={[
                      styles.imagePickerButton,
                      creating && { opacity: 0.5 },
                    ]}
                    onPress={() =>
                      handlePickImage((img, preview) => {
                        setNewItem((prev) => ({ ...prev, image: img }));
                        setImagePreview(preview);
                      })
                    }
                    disabled={creating}
                  >
                    <Text style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      Selecionar Imagem
                    </Text>
                  </TouchableOpacity>
                  {imagePreview && (
                    <Image
                      source={{ uri: imagePreview }}
                      style={{ width: 80, height: 80, marginTop: 10, borderRadius: 8 }}
                    />
                  )}
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setIsAddModalVisible(false);
                      setNewItem({ name: '', price: '', description: '', image: null });
                      setImagePreview(null);
                    }}
                    disabled={creating}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalButtonSave,
                      creating && { opacity: 0.5 },
                    ]}
                    onPress={addMenuItem}
                    disabled={creating}
                  >
                    {creating ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.modalButtonText}>Adicionar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.modalTitle}>Editar Item</Text>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    disabled={editing}
                    style={{ marginLeft: 10, padding: 4 }}
                  >
                    <X size={24} color="#8B4513" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o nome do item"
                      placeholderTextColor="#A0A0A0"
                      value={editFields.name}
                      onChangeText={(text) =>
                        setEditFields((prev) => ({ ...prev, name: text }))
                      }
                      editable={!editing}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Preço (R$)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o preço"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="numeric"
                      value={editFields.price}
                      onChangeText={(value) =>
                        setEditFields((prev) => ({
                          ...prev,
                          price: value.replace(',', '.'),
                        }))
                      }
                      editable={!editing}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite a descrição"
                      placeholderTextColor="#A0A0A0"
                      value={editFields.description}
                      onChangeText={(text) =>
                        setEditFields((prev) => ({ ...prev, description: text }))
                      }
                      multiline
                      editable={!editing}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Imagem</Text>
                    <TouchableOpacity
                      style={[
                        styles.imagePickerButton,
                        editing && { opacity: 0.5 },
                      ]}
                      onPress={() =>
                        handlePickImage((img, preview) => {
                          setEditFields((prev) => ({
                            ...prev,
                            image: img,
                            imagePreview: preview,
                          }));
                        })
                      }
                      disabled={editing}
                    >
                      <Text style={{ color: '#8B4513', fontWeight: 'bold' }}>
                        Selecionar Imagem
                      </Text>
                    </TouchableOpacity>
                    {editFields.imagePreview ? (
                      <Image
                        source={{ uri: editFields.imagePreview }}
                        style={{ width: 80, height: 80, marginTop: 10, borderRadius: 8 }}
                      />
                    ) : editFields.originalImage ? (
                      <Image
                        source={{ uri: `data:image/png;base64,${editFields.originalImage}` }}
                        style={{ width: 80, height: 80, marginTop: 10, borderRadius: 8 }}
                      />
                    ) : null}
                  </View>
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => setEditModalVisible(false)}
                      disabled={editing}
                    >
                      <Text style={styles.modalButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        styles.modalButtonSave,
                        (editing || !hasEditChanged()) && { opacity: 0.5 },
                      ]}
                      onPress={handleSaveEdit}
                      disabled={editing || !hasEditChanged()}
                    >
                      {editing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.modalButtonText}>Salvar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {(creating || editing || loading) && (
        <View style={styles.globalLoadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E1' },
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
  headerIconButton: {
    marginLeft: 16,
    padding: 4,
  },
  menuList: { padding: 16 },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  menuItemSelected: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#DAA520',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  itemContent: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  itemDescription: { fontSize: 14, color: '#6B6B6B', marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#DAA520' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
    flex: 1,
  },
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#8B4513',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFDB58',
  },
  imagePickerButton: {
    backgroundColor: '#FFDB58',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: { backgroundColor: '#E0E0E0' },
  modalButtonSave: { backgroundColor: '#DAA520' },
  modalButtonText: { fontWeight: 'bold', fontSize: 16, color: '#FFFFFF' },
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,30,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

export default Cardapio;
