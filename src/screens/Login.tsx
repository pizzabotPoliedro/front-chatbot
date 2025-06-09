import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const Login: any = () => {
  const [email, setEmail] = useState<any>('');
  const [password, setPassword] = useState<any>('');
  const [showPassword, setShowPassword] = useState<any>(false);
  const [error, setError] = useState<any>('');
  const [loading, setLoading] = useState<any>(false);

  const navigation: any = useNavigation();

  const handleLogin = async (): Promise<any> => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Preencha email e senha.');
      setLoading(false);
      return;
    }

    try {
      const formData: any = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response: any = await fetch((process as any).env.EXPO_PUBLIC_API_URL + '/login', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const data: any = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        const decodedToken: any = jwtDecode(data.token);
        if (decodedToken.restaurant) {
          decodedToken.admin == true? navigation.navigate('Admin') : navigation.navigate('Index');
        } else {
          decodedToken.admin == true? navigation.navigate('Admin') : navigation.navigate('MenuUsuario');
        }
      } else {
        setError(data.error || 'Email ou senha inválidos.');
      }
    } catch (err: any) {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCadastro = (): any => {
    navigation.navigate('Cadastro');
  };

  const navigateToCadastroRestaurante = (): any => {
    navigation.navigate('CadastroRestaurante');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.innerContainer}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('./Robozinho.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Poliedro Bot</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff size={20} color="#8B4513" /> : 
                    <Eye size={20} color="#8B4513" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>

            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>
            ) : null}

            <View style={styles.registerSection}>
              <View style={styles.registerOption}>
                <Text style={styles.registerText}>Ainda não possui login de usuário? </Text>
                <TouchableOpacity onPress={navigateToCadastro}>
                  <Text style={styles.registerLink}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Ou</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.registerOption}>
                <Text style={styles.registerText}>Ainda não possui login de restaurante? </Text>
                <TouchableOpacity onPress={navigateToCadastroRestaurante}>
                  <Text style={styles.registerLink}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CD950C',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFDB58',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFDB58',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#DAA520',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerSection: {
    marginTop: 30,
  },
  registerOption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  registerText: {
    color: '#8B4513',
    fontSize: 14,
  },
  registerLink: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CD950C',
    opacity: 0.5,
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#8B4513',
    fontWeight: 'bold',
  },
});

export default Login;
