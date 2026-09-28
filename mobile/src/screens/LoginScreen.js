import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('tech.rajesh@glitzupfm.in');
  const [password, setPassword] = useState('Tech@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct mock/demo login for mobile
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({
          full_name: 'Rajesh Kumar',
          role: 'field_technician',
          employee_code: 'GZ-TECH-042'
        });
      }, 600);
    } catch (err) {
      setLoading(false);
      setError('Login failed. Check credentials or connection.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>GZ</Text>
          </View>
          <Text style={styles.brandTitle}>GlitzUp PestCheck</Text>
          <Text style={styles.subtitle}>Field Service Compliance & Inspection</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Technician Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In to Field Terminal</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          GlitzUp Facility Management Services • Chennai Division
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012341',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoBadge: {
    backgroundColor: '#E74C3C',
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  logoBadgeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#012341'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC'
  },
  button: {
    backgroundColor: '#012341',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12
  },
  footerNote: {
    fontSize: 10,
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 20
  }
});
