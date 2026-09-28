import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import InspectionListScreen from './src/screens/InspectionListScreen';
import InspectionFormScreen from './src/screens/InspectionFormScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'list', 'form'

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentScreen('list');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {currentScreen === 'list' && (
        <InspectionListScreen
          user={user}
          onNewInspection={() => setCurrentScreen('form')}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'form' && (
        <InspectionFormScreen
          user={user}
          onBack={() => setCurrentScreen('list')}
          onComplete={() => setCurrentScreen('list')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012341'
  }
});
