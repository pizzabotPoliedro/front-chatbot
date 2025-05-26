import React, { useState } from 'react';
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
  StatusBar
} from 'react-native';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';


interface Mensagem {
  id: string;
  texto: string;
  enviada: boolean; 
  timestamp: Date;
}

const TelaChat = ({ navigation }: { navigation: any }) => {
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      texto: 'Olá! Sou o assistente virtual do restaurante. Como posso ajudá-lo hoje?',
      enviada: false,
      timestamp: new Date()
    }
  ]);

  const enviarMensagem = () => {
    if (mensagem.trim() === '') return;
    
    
    const novaMensagemUsuario = {
      id: Date.now().toString(),
      texto: mensagem,
      enviada: true,
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setMensagem('');
    
    
    setTimeout(() => {
      const respostaBot = {
        id: (Date.now() + 1).toString(),
        texto: 'Entendi! Vou processar seu pedido. Gostaria de adicionar algo mais?',
        enviada: false,
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, respostaBot]);
    }, 1000);
  };

  const formatarHora = (data: Date) => {
    return `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMensagem = ({ item }: { item: Mensagem }) => (
    <View style={[
      styles.mensagemContainer,
      item.enviada ? styles.mensagemEnviada : styles.mensagemRecebida
    ]}>
      <Text style={styles.textoMensagem}>{item.texto}</Text>
      <Text style={styles.horaMensagem}>{formatarHora(item.timestamp)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCF5E5" />
      
      
      <View style={styles.cabecalho}>
        <TouchableOpacity 
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#8A5A00" />
        </TouchableOpacity>
        <View style={styles.tituloCabecalho}>
          <MessageCircle size={24} color="#8A5A00" style={styles.iconeChat} />
          <Text style={styles.textoTitulo}>Assistente Virtual</Text>
        </View>
      </View>
      
     
      <FlatList
        style={styles.listaMensagens}
        data={mensagens}
        renderItem={renderMensagem}
        keyExtractor={item => item.id}
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
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5', 
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF7CD', 
    borderBottomWidth: 1,
    borderBottomColor: '#F9A826', 
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
    color: '#8A5A00', 
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
    backgroundColor: '#F9A826', 
    borderBottomRightRadius: 4,
  },
  mensagemRecebida: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEC6A1', 
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
    backgroundColor: '#FEF7CD', 
    borderTopWidth: 1,
    borderTopColor: '#F9A826', 
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  botaoEnviar: {
    backgroundColor: '#8A5A00', 
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default TelaChat;