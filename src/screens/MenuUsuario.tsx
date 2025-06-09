import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { User, MessageSquare, ChevronDown, LogOut, List } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';


interface MenuUsuarioProps {
  navigation: NativeStackNavigationProp<any, any>;
}

const MenuUsuario: React.FC<MenuUsuarioProps> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRestaurants = async (): Promise<void> => {
      try {
        const response = await fetch(process.env.EXPO_PUBLIC_API_URL + '/restaurants');
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        console.log(err)
      }
      setLoading(false);
    };
    fetchRestaurants();
  }, []);

  const handleRestaurantSelect = async (restaurant: any): Promise<void> => {
    setSelectedRestaurant(restaurant._id);
    setSelectedRestaurantName(restaurant.name);
    setModalVisible(false);
    await AsyncStorage.setItem('selectedRestaurantId', restaurant._id);
    await AsyncStorage.setItem('selectedRestaurantEmail', restaurant.email);
  };

  const handleLogout = async (): Promise<void> => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleRestaurantSelect(item)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCF5E5" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Qual é a pedida</Text>
          <Text style={styles.subtitle}>pra hoje?</Text>
        </View>
        <View style={styles.restaurantSelector}>
          <Text style={styles.selectorLabel}>Escolha um restaurante:</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[
              styles.selectButtonText,
              !selectedRestaurantName && styles.placeholderText
            ]}>
              {selectedRestaurantName || 'Selecione um restaurante'}
            </Text>
            <ChevronDown size={20} color="#8A5A00" />
          </TouchableOpacity>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              !selectedRestaurant && styles.optionButtonDisabled
            ]}
            onPress={() => selectedRestaurant && navigation.navigate('TelaChat')}
            disabled={!selectedRestaurant}
          >
            <View style={styles.iconContainer}>
              <MessageSquare size={28} color="white" />
            </View>
            <Text style={styles.optionText}>Chatbot para{'\n'}pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate('PedidosUsuario')}
          >
            <View style={styles.iconContainer}>
              <List size={28} color="white" />
            </View>
            <Text style={styles.optionText}>Meus Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => navigation.navigate('ContaUsuario')}
          >
            <View style={styles.iconContainer}>
              <User size={28} color="white" />
            </View>
            <Text style={styles.optionText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#8A5A00" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 - Todos os direitos reservados</Text>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um restaurante</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#8A5A00" style={{ marginTop: 30 }} />
            ) : (
              <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={(item) => item._id}
                style={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8A5A00',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 32,
    color: '#B87A00',
    opacity: 0.7,
    textAlign: 'center',
  },
  restaurantSelector: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  selectorLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8A5A00',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F9A826',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#8A5A00',
    flex: 1,
  },
  placeholderText: {
    opacity: 0.6,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#F9A826',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9D71C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  logoutText: {
    color: '#8A5A00',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#8A5A00',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8A5A00',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F9A826',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: '80%',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MenuUsuario;