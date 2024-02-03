import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/LoginScreen';
import Business from './components/Business/Business';
import User from './components/User/User';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Business" component={Business} />
        <Stack.Screen name="HUser" component={User} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
