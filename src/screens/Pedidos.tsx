import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Check, X, ShoppingBag } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

type OrderStatusType = 'Pendente' | 'Entregue' | 'Cancelado';

type Item = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  date: string;
  status: OrderStatusType;
  items: Item[];
  total?: number;
};

const statusApiToFront: Record<string, OrderStatusType> = {
  'PENDING': 'Pendente',
  'CANCELED': 'Cancelado',
  'DELIVERED': 'Entregue'
};

const statusFrontToApi: Record<OrderStatusType, string> = {
  'Pendente': 'PENDING',
  'Cancelado': 'CANCELED',
  'Entregue': 'DELIVERED'
};

const Pedidos = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatusType>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Token não encontrado');
      const decoded: any = jwtDecode(token);
      const userId = decoded.sub;
      const response = await axios.get(`${apiUrl}/orders/restaurant/${userId}`);
      const formattedOrders: Order[] = response.data
        .filter((order: any) => ['PENDING', 'CANCELED', 'DELIVERED'].includes(order.status?.toUpperCase()))
        .map((order: any) => ({
          id: order._id,
          date: format(new Date(order.created_at), "dd MMMM, HH:mm", { locale: ptBR }),
          status: statusApiToFront[order.status?.toUpperCase()] ?? 'Pendente',
          items: order.items.map((item: any) => ({
            name: item.item_name,
            quantity: item.quantity,
            price: item.item_price
          })),
          total: order.total
        }));
      setOrders(formattedOrders);
      setError('');
    } catch (err) {
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const handleStatusChange = async (newStatus: OrderStatusType) => {
    if (!selectedOrder) return;
    setStatusLoading(true);
    try {
      const token = await getToken();
      await axios.put(
        `${apiUrl}/orders/${selectedOrder.id}/status`,
        { status: statusFrontToApi[newStatus] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
      setModalVisible(false);
      setSelectedOrder(null);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao atualizar status');
    } finally {
      setStatusLoading(false);
    }
  };

  const OrderStatus = ({ status }: { status: OrderStatusType }) => {
    let backgroundColor, textColor, Icon;
    switch (status) {
      case 'Entregue':
        backgroundColor = '#E6F4EA';
        textColor = '#137333';
        Icon = Check;
        break;
      case 'Pendente':
        backgroundColor = '#FEF7CD';
        textColor = '#8A5A00';
        Icon = Clock;
        break;
      case 'Cancelado':
        backgroundColor = '#FEEAE6';
        textColor = '#C5221F';
        Icon = X;
        break;
      default:
        backgroundColor = '#F1F3F4';
        textColor = '#5F6368';
        Icon = Clock;
    }
    return (
      <View style={[styles.statusContainer, { backgroundColor }]}>
        <Icon size={16} color={textColor} style={styles.icon} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onLongPress={() => {
        setSelectedOrder(order);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Pedido #{order.id.slice(-4)}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <OrderStatus status={order.status} />
      </View>
      <View style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.totalText}>Total: R$ {order.total?.toFixed(2)}</Text>
      <Text style={styles.longPressHint}>Mantenha pressionado para alterar status</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F9A826" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
          <Text style={styles.headerSubtitle}>Acompanhe seus pedidos recentes</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          <TouchableOpacity style={styles.filterTab} onPress={() => setFilterStatus('all')}>
            <Text style={styles.filterTabText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab} onPress={() => setFilterStatus('Pendente')}>
            <Text style={styles.filterTabText}>Pendentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab} onPress={() => setFilterStatus('Entregue')}>
            <Text style={styles.filterTabText}>Entregues</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab} onPress={() => setFilterStatus('Cancelado')}>
            <Text style={styles.filterTabText}>Cancelados</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <ScrollView
        style={styles.ordersList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F9A826']}
            tintColor="#F9A826"
          />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <ShoppingBag size={48} color="#8A5A00" />
            </View>
            <Text style={styles.emptyTitle}>Nada por aqui</Text>
            <Text style={styles.emptySubtitle}>Nenhum pedido encontrado.</Text>
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Status - Pedido #{selectedOrder?.id.slice(-4)}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
            {statusLoading ? (
              <View style={{ alignItems: 'center', marginVertical: 24 }}>
                <ActivityIndicator size="large" color="#F9A826" />
                <Text style={{ marginTop: 16, color: '#8A5A00', fontWeight: '600' }}>Alterando status...</Text>
              </View>
            ) : (
              <View style={styles.statusOptionsContainer}>
                <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('Pendente')}>
                  <Clock size={20} color="#8A5A00" />
                  <Text style={[styles.statusOptionText, { color: '#8A5A00' }]}>Pendente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('Entregue')}>
                  <Check size={20} color="#137333" />
                  <Text style={[styles.statusOptionText, { color: '#137333' }]}>Entregue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('Cancelado')}>
                  <X size={20} color="#C5221F" />
                  <Text style={[styles.statusOptionText, { color: '#C5221F' }]}>Cancelado</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5',
    justifyContent: 'center',
  },
  errorText: {
    color: '#C5221F',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F9A826',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filtersContainer: {
    paddingBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 247, 205, 0.3)',
  },
  filterTabText: {
    fontWeight: '600',
    color: '#8A5A00',
    fontSize: 14,
  },
  ordersList: {
    paddingHorizontal: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: '600',
    fontSize: 16,
    color: '#121212',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
  },
  itemQuantity: {
    fontWeight: '600',
    color: '#121212',
    marginRight: 6,
  },
  itemName: {
    color: '#121212',
  },
  itemPrice: {
    fontWeight: '600',
    color: '#121212',
  },
  totalText: {
    fontWeight: '600',
    color: '#121212',
    textAlign: 'right',
    marginTop: 8,
  },
  longPressHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    backgroundColor: '#FDF5D7',
    borderRadius: 50,
    padding: 24,
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: '600',
    fontSize: 24,
    color: '#8A5A00',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8A5A00',
    textAlign: 'center',
    maxWidth: 280,
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
    maxWidth: 400,
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
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9A826',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionsContainer: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Pedidos;
