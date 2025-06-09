import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import { ArrowLeft, Send, MessageCircle, X, Trash } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

type CarrinhoItem = {
  item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  image?: string;
};

const COLORS = {
  background: '#FCF5E5',
  modalBg: 'rgba(0,0,0,0.38)',
  card: '#FFF9ED',
  accent: '#F9A826',
  accentDark: '#8A5A00',
  accentLight: '#FEF7CD',
  accentSoft: '#FEC6A1',
  white: '#FFF',
  green: '#388E3C',
  red: '#D32F2F',
  text: '#8A5A00'
};

const diasSemana = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const formatarHora = (data: Date) => {
  return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
};

const AnimatedModal = ({
  visible,
  children,
  onRequestClose,
}: {
  visible: boolean;
  children: React.ReactNode;
  onRequestClose: () => void;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 60,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <Animated.View style={[styles.animatedModalBg, { opacity }]}>
        <TouchableOpacity style={styles.animatedModalBgTouchable} activeOpacity={1} onPress={onRequestClose} />
        <Animated.View style={[styles.animatedModalCard, { transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const ModalFecharButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        Animated.sequence([
          Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => onPress());
      }}
      style={styles.fecharBtnTouch}
    >
      <Animated.View style={[styles.fecharBtn, { transform: [{ scale }] }]}>
        <Text style={styles.fecharBtnText}>Fechar</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HorarioFuncionamento = ({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) => (
  <View style={styles.modalContent}>
    <Text style={styles.modalTitle}>Horário de Funcionamento</Text>
    <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom: 12}}>
      {diasSemana.map((dia, idx) => {
        const info = data[dia.key];
        const fechado = !info || !info.open || !info.close;
        return (
          <View
            key={dia.key}
            style={[
              styles.horarioBox,
              fechado ? styles.horarioBoxFechado : styles.horarioBoxAberto,
              idx === diasSemana.length - 1 ? { marginBottom: 0 } : {}
            ]}
          >
            <Text style={styles.horarioDia}>{dia.label}</Text>
            <Text style={fechado ? styles.horarioFechado : styles.horarioAberto}>
              {fechado ? 'Fechado' : `${info.open} às ${info.close}`}
            </Text>
          </View>
        );
      })}
    </ScrollView>
    <ModalFecharButton onPress={onClose} />
  </View>
);

const CardapioModal = ({
  items,
  onLongPressItem,
  onClose,
}: {
  items: MenuItem[];
  onLongPressItem: (item: MenuItem) => void;
  onClose: () => void;
}) => (
  <View style={styles.modalContent}>
    <Text style={styles.modalTitle}>Cardápio</Text>
    {items.length === 0 ? (
      <Text style={styles.cardapioVazio}>Nenhum item encontrado.</Text>
    ) : (
      <ScrollView showsVerticalScrollIndicator={false} style={{width:'100%'}} contentContainerStyle={{paddingBottom: 12}}>
        {items.map((item) => (
          <Pressable
            key={item._id}
            style={({ pressed }) => [styles.menuItemContainer, pressed && styles.menuItemPressed]}
            onLongPress={() => onLongPressItem(item)}
            delayLongPress={300}
          >
            {item.image ? (
              <Image
                source={{ uri: `data:image/png;base64,${item.image}` }}
                style={styles.menuItemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.menuImagePlaceholder}>
                <Text style={styles.menuImagePlaceholderText}>Sem imagem</Text>
              </View>
            )}
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              {item.description ? <Text style={styles.menuItemDescription}>{item.description}</Text> : null}
              <Text style={styles.menuItemPrice}>R$ {item.price}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    )}
    <ModalFecharButton onPress={onClose} />
  </View>
);

const CardapioDetalheModal = ({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) => (
  <View style={styles.detalheModalContainer}>
    <TouchableOpacity style={styles.detalheFechar} onPress={onClose}>
      <X size={28} color={COLORS.accentDark} />
    </TouchableOpacity>
    {item.image ? (
      <Image
        source={{ uri: `data:image/png;base64,${item.image}` }}
        style={styles.detalheImage}
        resizeMode="cover"
      />
    ) : (
      <View style={styles.detalheImagePlaceholder}>
        <Text style={styles.menuImagePlaceholderText}>Sem imagem</Text>
      </View>
    )}
    <Text style={styles.detalheNome}>{item.name}</Text>
    {item.description ? (
      <Text style={styles.detalheDescricao}>{item.description}</Text>
    ) : null}
    <Text style={styles.detalhePreco}>R$ {item.price}</Text>
  </View>
);

const ThreeDotsLoader = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 24 }}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

const PedidoModal = ({
  items,
  carrinho,
  setCarrinho,
  onClose,
  onEnviarPedido,
  loading,
}: {
  items: MenuItem[];
  carrinho: CarrinhoItem[];
  setCarrinho: (carrinho: CarrinhoItem[]) => void;
  onClose: () => void;
  onEnviarPedido: () => void;
  loading: boolean;
}) => {
  const adicionarAoCarrinho = (item: MenuItem) => {
    const existente = carrinho.find(i => i.item_id === item._id);
    if (existente) {
      setCarrinho(
        carrinho.map(i =>
          i.item_id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          item_id: item._id,
          item_name: item.name,
          item_price: item.price,
          quantity: 1,
          image: item.image,
        },
      ]);
    }
  };

  const removerDoCarrinho = (item_id: string) => {
    setCarrinho(carrinho.filter(i => i.item_id !== item_id));
  };

  const alterarQuantidade = (item_id: string, delta: number) => {
    setCarrinho(
      carrinho.map(i =>
        i.item_id === item_id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );
  };

  const valorTotal = carrinho.reduce(
    (acc, item) => acc + item.item_price * item.quantity,
    0
  );

  return (
    <View style={[styles.modalContent, { minHeight: 500, maxHeight: 650 }]}>
      <Text style={styles.modalTitle}>Fazer Pedido</Text>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Itens do cardápio:</Text>
        {items.length === 0 ? (
          <Text style={styles.cardapioVazio}>Nenhum item disponível.</Text>
        ) : (
          items.map(item => (
            <View key={item._id} style={styles.menuItemContainer}>
              {item.image ? (
                <Image
                  source={{ uri: `data:image/png;base64,${item.image}` }}
                  style={styles.menuItemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.menuImagePlaceholder}>
                  <Text style={styles.menuImagePlaceholderText}>Sem imagem</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>R$ {item.price}</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: COLORS.accent, borderRadius: 8, padding: 8 }}
                onPress={() => adicionarAoCarrinho(item)}
              >
                <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>Seu pedido:</Text>
        {carrinho.length === 0 ? (
          <Text style={{ color: COLORS.accentDark }}>Nenhum item no pedido.</Text>
        ) : (
          carrinho.map(item => (
            <View key={item.item_id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {item.image ? (
                <Image
                  source={{ uri: `data:image/png;base64,${item.image}` }}
                  style={{ width: 40, height: 40, borderRadius: 10, marginRight: 10, borderWidth: 1.5, borderColor: COLORS.accent, backgroundColor: COLORS.white }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 10, marginRight: 10, backgroundColor: COLORS.accentSoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.accent }}>
                  <Text style={styles.menuImagePlaceholderText}>Sem imagem</Text>
                </View>
              )}
              <Text style={{ flex: 1 }}>{item.item_name} (R$ {item.item_price})</Text>
              <TouchableOpacity onPress={() => alterarQuantidade(item.item_id, -1)}>
                <Text style={{ fontSize: 20, marginHorizontal: 8 }}>-</Text>
              </TouchableOpacity>
              <Text>{item.quantity}</Text>
              <TouchableOpacity onPress={() => alterarQuantidade(item.item_id, 1)}>
                <Text style={{ fontSize: 20, marginHorizontal: 8 }}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removerDoCarrinho(item.item_id)}>
                <Text style={{ color: COLORS.red, fontWeight: 'bold', marginLeft: 12 }}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '98%', marginTop: 12, marginBottom: 4, backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.2, borderColor: COLORS.accent }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.accentDark }}>Total:</Text>
        <Text style={{ fontSize: 19, fontWeight: 'bold', color: COLORS.accent }}>R$ {valorTotal.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.fecharBtn, { marginTop: 12, backgroundColor: COLORS.green }]}
        onPress={onEnviarPedido}
        disabled={loading || carrinho.length === 0}
      >
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.fecharBtnText}>Enviar Pedido</Text>}
      </TouchableOpacity>
      <ModalFecharButton onPress={onClose} />
    </View>
  );
};

const STORAGE_KEY = 'chatMessages';

const TelaChat = ({ navigation }: { navigation: any }) => {
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState<{ id: string; texto: string; enviada: boolean; timestamp: Date; loading?: boolean }[]>([
    {
      id: '1',
      texto: 'Olá! Sou o assistente virtual do restaurante. Como posso ajudá-lo hoje?',
      enviada: false,
      timestamp: new Date()
    }
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantEmail, setRestaurantEmail] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [detalheVisible, setDetalheVisible] = useState(false);
  const [detalheItem, setDetalheItem] = useState<MenuItem | null>(null);

  const [aguardandoResposta, setAguardandoResposta] = useState(false);

  const [pedidoModalVisible, setPedidoModalVisible] = useState(false);
  const [pedidoCarrinho, setPedidoCarrinho] = useState<CarrinhoItem[]>([]);
  const [pedidoLoading, setPedidoLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      const tokenStorage = await AsyncStorage.getItem('token');
      const restaurantStorage = await AsyncStorage.getItem('selectedRestaurantId');
      const restaurantEmailStorage = await AsyncStorage.getItem('selectedRestaurantEmail');
      if (tokenStorage) {
        const decoded: any = jwtDecode(tokenStorage);
        setUserId(decoded.sub);
        if (restaurantStorage) {
          setRestaurantId(restaurantStorage);
          if (restaurantEmailStorage) setRestaurantEmail(restaurantEmailStorage);
        }
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    const carregarMensagens = async () => {
      if (userId && restaurantId) {
        const mensagensSalvas = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}_${restaurantId}`);
        if (mensagensSalvas) {
          setMensagens(JSON.parse(mensagensSalvas).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } else {
          buscarHistorico(userId, restaurantId);
        }
      }
    };
    carregarMensagens();
  }, [userId, restaurantId]);

  useEffect(() => {
    const salvarMensagens = async () => {
      if (userId && restaurantId) {
        await AsyncStorage.setItem(
          `${STORAGE_KEY}_${userId}_${restaurantId}`,
          JSON.stringify(mensagens)
        );
      }
    };
    salvarMensagens();
  }, [mensagens, userId, restaurantId]);

  const buscarHistorico = async (user_id: string, restaurant: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, restaurant })
      });
      if (response.ok) {
        const data = await response.json();
        const mensagensHistorico = data.messages.map((msg: any) => ({
          id: msg._id,
          texto: msg.message,
          enviada: msg.type === 'human',
          timestamp: new Date(msg.created_at)
        }));
        setMensagens(mensagensHistorico.length > 0 ? mensagensHistorico : [{
          id: '1',
          texto: 'Olá! Sou o assistente virtual do restaurante. Como posso ajudá-lo hoje?',
          enviada: false,
          timestamp: new Date()
        }]);
      }
    } catch (error) {}
  };

  const abrirModalHorario = async () => {
    if (!restaurantEmail) return;
    setModalLoading(true);
    setModalVisible(true);
    setModalType('horario');
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${restaurantEmail}/schedule`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setModalContent(data);
      } else {
        setModalContent('Não foi possível obter o horário de funcionamento.');
      }
    } catch {
      setModalContent('Erro ao buscar o horário de funcionamento.');
    }
    setModalLoading(false);
  };

  const abrirModalMenu = async () => {
    if (!restaurantId) return;
    setModalLoading(true);
    setModalVisible(true);
    setModalType('menu');
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/${restaurantId}/activated`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setModalContent(data.items || []);
      } else {
        setModalContent([]);
      }
    } catch {
      setModalContent([]);
    }
    setModalLoading(false);
  };

  const abrirModalPedido = async () => {
    if (!restaurantId) return;
    setPedidoLoading(true);
    setPedidoModalVisible(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/${restaurantId}/activated`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.items || []);
      } else {
        setMenuItems([]);
      }
    } catch {
      setMenuItems([]);
    }
    setPedidoLoading(false);
  };

 const enviarPedido = async () => {
  if (!userId || !restaurantId || pedidoCarrinho.length === 0) return;
  setPedidoLoading(true);
  try {
    const itemsParaEnvio = pedidoCarrinho.map(item => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_price: Number(item.item_price),
      quantity: item.quantity
    }));
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsParaEnvio,
        restaurant_id: restaurantId,
        user_id: userId
      })
    });
    if (response.ok) {
      Alert.alert('Pedido enviado!', 'Seu pedido foi realizado com sucesso.');
      setPedidoCarrinho([]);
      setPedidoModalVisible(false);
      setMensagens(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          texto: 'Seu pedido foi realizado com sucesso!',
          enviada: false,
          timestamp: new Date()
        }
      ]);
    } else {
      Alert.alert('Erro', 'Não foi possível enviar o pedido.');
    }
  } catch {
    Alert.alert('Erro', 'Não foi possível enviar o pedido.');
  }
  setPedidoLoading(false);
  };

  const enviarMensagem = async () => {
    if (mensagem.trim() === '' || !userId || !restaurantId) return;
    const novaMensagemUsuario = {
      id: Date.now().toString(),
      texto: mensagem,
      enviada: true,
      timestamp: new Date()
    };
    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setMensagem('');
    const idLoading = 'loading-bot-' + Date.now();
    setMensagens((prev) => [
      ...prev,
      {
        id: idLoading,
        texto: '',
        enviada: false,
        timestamp: new Date(),
        loading: true,
      }
    ]);
    setAguardandoResposta(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: novaMensagemUsuario.texto,
          restaurant: restaurantId,
          user_id: userId
        })
      });
      if (response.ok) {
        const data = await response.json();
        const respostaBot = {
          id: data._id,
          texto: data.message,
          enviada: false,
          timestamp: new Date(data.created_at)
        };
        setMensagens((prev) => [
          ...prev.filter((msg) => msg.id !== idLoading),
          respostaBot
        ]);
        setAguardandoResposta(false);
        if (data.schedule) abrirModalHorario();
        if (data.menu) abrirModalMenu();
        if (data.order) abrirModalPedido();
      } else {
        setMensagens((prev) => [
          ...prev.filter((msg) => msg.id !== idLoading),
          {
            id: Date.now().toString(),
            texto: 'Erro ao obter resposta do assistente.',
            enviada: false,
            timestamp: new Date()
          }
        ]);
        setAguardandoResposta(false);
      }
    } catch (error) {
      setMensagens((prev) => [
        ...prev.filter((msg) => msg.id !== idLoading),
        {
          id: Date.now().toString(),
          texto: 'Erro ao obter resposta do assistente.',
          enviada: false,
          timestamp: new Date()
        }
      ]);
      setAguardandoResposta(false);
    }
  };

  const limparConversa = async () => {
    Alert.alert(
      'Limpar conversa',
      'Tem certeza que deseja apagar todo o histórico desta conversa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setMensagens([
              {
                id: '1',
                texto: 'Olá! Sou o assistente virtual do restaurante. Como posso ajudá-lo hoje?',
                enviada: false,
                timestamp: new Date()
              }
            ]);
            if (userId && restaurantId) {
              await AsyncStorage.removeItem(`${STORAGE_KEY}_${userId}_${restaurantId}`);
            }
          }
        }
      ]
    );
  };

  const renderMensagem = ({ item }: { item: any }) => (
    <View style={[
      styles.mensagemContainer,
      item.enviada ? styles.mensagemEnviada : styles.mensagemRecebida
    ]}>
      {item.loading ? (
        <ThreeDotsLoader />
      ) : (
        <>
          <Text style={styles.textoMensagem}>{item.texto}</Text>
          <Text style={styles.horaMensagem}>{formatarHora(item.timestamp)}</Text>
        </>
      )}
    </View>
  );

  const handleLongPressItem = (item: MenuItem) => {
    setDetalheItem(item);
    setDetalheVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <AnimatedModal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {modalLoading ? (
          <View style={{flex:1, justifyContent:'center', alignItems:'center', minHeight:300}}>
            <ActivityIndicator size="large" color={COLORS.accentDark} />
          </View>
        ) : (
          <>
            {modalType === 'horario' && typeof modalContent === 'object' && !Array.isArray(modalContent) ? (
              <HorarioFuncionamento data={modalContent} onClose={() => setModalVisible(false)} />
            ) : modalType === 'menu' ? (
              <CardapioModal
                items={modalContent || []}
                onLongPressItem={handleLongPressItem}
                onClose={() => setModalVisible(false)}
              />
            ) : (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Atenção</Text>
                <Text style={styles.modalText}>{modalContent}</Text>
                <ModalFecharButton onPress={() => setModalVisible(false)} />
              </View>
            )}
          </>
        )}
      </AnimatedModal>
      <AnimatedModal
        visible={pedidoModalVisible}
        onRequestClose={() => setPedidoModalVisible(false)}
      >
        <PedidoModal
          items={menuItems}
          carrinho={pedidoCarrinho}
          setCarrinho={setPedidoCarrinho}
          onClose={() => setPedidoModalVisible(false)}
          onEnviarPedido={enviarPedido}
          loading={pedidoLoading}
        />
      </AnimatedModal>
      <Modal
        visible={detalheVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalheVisible(false)}
      >
        <View style={styles.detalheModalBg}>
          {detalheItem && (
            <CardapioDetalheModal item={detalheItem} onClose={() => setDetalheVisible(false)} />
          )}
        </View>
      </Modal>
      <View style={styles.cabecalho}>
        <TouchableOpacity 
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.accentDark} />
        </TouchableOpacity>
        <View style={styles.tituloCabecalho}>
          <MessageCircle size={24} color={COLORS.accentDark} style={styles.iconeChat} />
          <Text style={styles.textoTitulo}>Assistente Virtual</Text>
        </View>
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={limparConversa}
          activeOpacity={0.7}
        >
          <Trash size={24} color={COLORS.red} />
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.listaMensagens}
        data={mensagens}
        renderItem={renderMensagem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conteudoLista}
        inverted={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.areaInput}
      >
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChangeText={setMensagem}
          multiline
        />
        <TouchableOpacity 
          style={styles.botaoEnviar}
          onPress={enviarMensagem}
          disabled={aguardandoResposta}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.accentLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  botaoVoltar: {
    padding: 8,
  },
  tituloCabecalho: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -40,
  },
  iconeChat: {
    marginRight: 8,
  },
  textoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accentDark,
  },
  trashBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    elevation: 2,
  },
  listaMensagens: {
    flex: 1,
    padding: 16,
  },
  conteudoLista: {
    paddingBottom: 16,
  },
  mensagemContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mensagemEnviada: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 4,
  },
  mensagemRecebida: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSoft,
    borderBottomLeftRadius: 4,
  },
  textoMensagem: {
    fontSize: 16,
    color: '#333',
  },
  horaMensagem: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  areaInput: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.accentLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.accent,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  botaoEnviar: {
    backgroundColor: COLORS.accentDark,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  animatedModalBg: {
    flex: 1,
    backgroundColor: COLORS.modalBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedModalBgTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  animatedModalCard: {
    zIndex: 2,
    width: width > 400 ? 370 : '92%',
    minHeight: 340,
    maxHeight: '88%',
    backgroundColor: COLORS.card,
    borderRadius: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 13,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 18,
    minHeight: 340,
    maxHeight: 500,
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.6,
  },
  modalText: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  fecharBtnTouch: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },
  fecharBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 60,
    minWidth: 180,
    elevation: 7,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  fecharBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  horarioBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    width: '97%',
  },
  horarioBoxAberto: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  horarioBoxFechado: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  horarioDia: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.accentDark,
    letterSpacing: 0.3,
  },
  horarioAberto: {
    fontSize: 16,
    color: COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  horarioFechado: {
    fontSize: 16,
    color: COLORS.red,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  menuItemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentLight,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    width: '98%',
    alignSelf: 'center'
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 18,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  menuImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 18,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  menuImagePlaceholderText: {
    color: COLORS.accentDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  menuItemName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accentDark,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B4F00',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  cardapioVazio: {
    fontSize: 16,
    color: COLORS.accentDark,
    textAlign: 'center',
    marginTop: 40,
  },
  detalheModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detalheModalContainer: {
    width: '88%',
    backgroundColor: COLORS.card,
    borderRadius: 38,
    paddingHorizontal: 28,
    paddingVertical: 36,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 14,
    minHeight: 370,
    position: 'relative'
  },
  detalheFechar: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    elevation: 2,
    zIndex: 10,
  },
  detalheImage: {
    width: 140,
    height: 140,
    borderRadius: 30,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  detalheImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 30,
    marginBottom: 20,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  detalheNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accentDark,
    marginBottom: 8,
    letterSpacing: 0.4,
    textAlign: 'center'
  },
  detalheDescricao: {
    fontSize: 16,
    color: '#6B4F00',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  detalhePreco: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentDark,
    marginHorizontal: 3,
  },
});

export default TelaChat;
