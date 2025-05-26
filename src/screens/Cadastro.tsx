import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';



const Cadastro: React.FC<any> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  const validate = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nome) newErrors.nome = 'Nome completo é obrigatório';
    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    else if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não conferem';
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const data = new FormData();
    data.append('name', formData.nome);
    data.append('email', formData.email);
    data.append('password', formData.senha);
    data.append('phone', formData.telefone);
    data.append('restaurant', 'false');
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_API_URL + '/signup', {
        method: 'POST',
        body: data,
      });
      await response.json();
      navigation.navigate('Login');
    } catch (error) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#8A5A00" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Faça seu</Text>
              <Text style={styles.subtitle}>cadastro como usuário</Text>
            </View>
            
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.nome && styles.inputError]}
                    placeholder="Nome completo"
                    placeholderTextColor="#8A5A00"
                    value={formData.nome}
                    onChangeText={(text) => handleChange('nome', text)}
                  />
                  {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="E-mail"
                    placeholderTextColor="#8A5A00"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.telefone && styles.inputError]}
                    placeholder="Telefone"
                    placeholderTextColor="#8A5A00"
                    keyboardType="phone-pad"
                    value={formData.telefone}
                    onChangeText={(text) => handleChange('telefone', text)}
                  />
                  {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.senha && styles.inputError]}
                    placeholder="Senha"
                    placeholderTextColor="#8A5A00"
                    secureTextEntry
                    value={formData.senha}
                    onChangeText={(text) => handleChange('senha', text)}
                  />
                  {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, errors.confirmarSenha && styles.inputError]}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#8A5A00"
                    secureTextEntry
                    value={formData.confirmarSenha}
                    onChangeText={(text) => handleChange('confirmarSenha', text)}
                  />
                  {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Cadastrar</Text>
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já é cadastrado? </Text>
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.loginLink}>Faça seu login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF5E5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8A5A00',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A5A00',
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8A5A00',
  },
  form: {
    backgroundColor: '#F9A826',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  inputRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#8A5A00',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#8A5A00',
  },
  loginLink: {
    color: '#8A5A00',
    fontWeight: 'bold',
  },
});

export default Cadastro;
