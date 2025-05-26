import React, { useState } from 'react';
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
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Trash } from 'lucide-react-native';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

const Cardapio = () => {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Pizza Margherita',
      price: 32.90,
      description: 'Molho de tomate, mussarela, tomate e manjericão',
      image: 'https://images.unsplash.com/photo-1598023696416-0193a0bcd302?q=80&w=2236&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Pizza Pepperoni',
      price: 36.90,
      description: 'Molho de tomate, mussarela e pepperoni',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop'
    },
    {
      id: '3',
      name: 'Pizza Calabresa',
      price: 34.90,
      description: 'Molho de tomate, mussarela e calabresa',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop'
    }
  ]);
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    price: 0,
    description: '',
    image: '',
  });

  const addMenuItem = () => {
    if (newItem.name && newItem.price > 0) {
      const newId = Date.now().toString();
      setMenuItems([...menuItems, { id: newId, ...newItem }]);
      
      
      setNewItem({
        name: '',
        price: 0,
        description: '',
        image: '',
      });
      setIsAddModalVisible(false);
    } else {
      console.log('Nome e preço são obrigatórios');
    }
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      )}
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => removeMenuItem(item.id)}
      >
        <Trash size={20} color="#8B4513" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cardápio</Text>
        <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
          <Plus size={24} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
      />

      
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
      >
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
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Preço (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o preço"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={newItem.price ? String(newItem.price) : ''}
                    onChangeText={(value) => {
                      const numericValue = parseFloat(value.replace(',', '.'));
                      setNewItem(prev => ({ 
                        ...prev, 
                        price: isNaN(numericValue) ? 0 : numericValue 
                      }));
                    }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite a descrição"
                    placeholderTextColor="#A0A0A0"
                    value={newItem.description}
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
                    multiline
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>URL da Imagem (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Cole a URL da imagem"
                    placeholderTextColor="#A0A0A0"
                    value={newItem.image}
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, image: text }))}
                  />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setIsAddModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonSave]}
                    onPress={addMenuItem}
                  >
                    <Text style={styles.modalButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  menuList: {
    padding: 16,
  },
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
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513', 
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DAA520', 
  },
  deleteButton: {
    justifyContent: 'center',
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513', 
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
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
  modalButtonCancel: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonSave: {
    backgroundColor: '#DAA520', 
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default Cardapio;