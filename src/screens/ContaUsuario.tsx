import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const ContaUsuario: React.FC<any> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        setName(decoded?.name || '');
        setEmail(decoded?.email || '');
        setPhone(decoded?.phone || '');
      }
    };
    fetchUserData();
  }, []);

  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={20} color="#8A5A00" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.greeting}>
          <Text style={styles.greetingSubtext}>Olá,</Text>
          <Text style={styles.greetingName}>{name || 'Usuário'}</Text>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados</Text>
          <View style={styles.divider} />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>E-mail</Text>
            <Text style={styles.dataValue}>{email}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Telefone</Text>
            <Text style={styles.dataValue}>{phone}</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 - Todos os direitos reservados</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: '#8A5A00',
    marginLeft: 5,
  },
  greeting: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#8A5A00',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#B87A00',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F9A826',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B87A00',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B87A00',
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(184, 122, 0, 0.3)',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dataLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#8A5A00',
  },
  dataValue: {
    flex: 2,
    fontSize: 14,
    color: '#8A5A00',
  },
  footer: {
    padding: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#B87A00',
  },
});

export default ContaUsuario;
