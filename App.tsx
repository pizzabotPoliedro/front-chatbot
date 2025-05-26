import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Index from './src/screens/Index';
import Cardapio from './src/screens/Cardapio';
import Pedidos from './src/screens/Pedidos';
import Cadastro from './src/screens/Cadastro';
import CadastroRestaurante from './src/screens/CadastroRestaurante';
import MenuUsuario from './src/screens/MenuUsuario';
import TelaChat from './src/screens/TelaChat';
import ContaUsuario from './src/screens/ContaUsuario';
import ContaRestaurante from './src/screens/ContaRestaurante';
import Login from './src/screens/Login';
import HorarioFuncionamento from './src/screens/HorarioDeFuncionamento';
import Admin from './src/screens/Admin';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Login" 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Admin" component={Admin} />
          <Stack.Screen name="HorarioFuncionamento" component={HorarioFuncionamento} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ContaRestaurante" component={ContaRestaurante} />
          <Stack.Screen name="ContaUsuario" component={ContaUsuario} />
          <Stack.Screen name="TelaChat" component={TelaChat} />
          <Stack.Screen name="MenuUsuario" component={MenuUsuario} />
          <Stack.Screen name="CadastroRestaurante" component={CadastroRestaurante} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Cardapio" component={Cardapio} />
          <Stack.Screen name="Pedidos" component={Pedidos} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}




