import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const Index: any = () => {
  const navigation: any = useNavigation();
  const [restaurantName, setRestaurantName] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurantName = async (): Promise<any> => {
      try {
        const token: any = await AsyncStorage.getItem('token');
        if (token) {
          const decoded: any = jwtDecode(token);
          setRestaurantName(decoded?.name || null);
        }
      } catch (e: any) {
        setRestaurantName(null);
      }
    };
    fetchRestaurantName();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciamento</Text>
          <Text style={styles.subtitle}>{restaurantName || 'Carregando...'}</Text>
        </View>
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Cardapio')}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="menu-book" size={32} color="white" />
            </View>
            <Text style={styles.cardTitle}>Cardápio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Pedidos')}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="shopping-bag" size={32} color="white" />
            </View>
            <Text style={styles.cardTitle}>Pedidos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => navigation.navigate('HorarioFuncionamento')}
        >
          <MaterialIcons name="access-time" size={20} color="#8A5A00" />
          <Text style={styles.smallButtonText}>Horários de Funcionamento</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} - Todos os direitos reservados</Text>
      </View>
    </SafeAreaView>
  );
};

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8A5A00',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#B87A00',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#F9A826',
    width: 150,
    height: 150,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9D71C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  smallButtonText: {
    color: '#8A5A00',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#B87A00',
    fontSize: 14,
  },
});

export default Index;
