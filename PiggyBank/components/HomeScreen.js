import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = ({ route }) => {
  // Mock account information (replace with actual user data)
  const accountInfo = {
    username: route.params.username || 'Guest',
    email: 'guest@example.com',
    balance: '$1000.00',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Information</Text>
      <Text style={styles.text}>Username: {accountInfo.username}</Text>
      <Text style={styles.text}>Email: {accountInfo.email}</Text>
      <Text style={styles.text}>Balance: {accountInfo.balance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default HomeScreen;
