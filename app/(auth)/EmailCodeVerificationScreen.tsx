import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const BACKEND_URL = 'http://localhost:3001'; // Change if backend runs elsewhere

const EmailCodeVerificationScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Please enter the code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.verified) {
        Alert.alert('Email verified!');
        router.replace('/(dashboard)/dashboard');
      } else {
        Alert.alert('Incorrect code. Please try again.');
      }
    } catch (err) {
      Alert.alert('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Enter Verification Code</Text>
      <Text style={{ fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
        Please enter the 2-digit code sent to your email.
      </Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, width: 120, fontSize: 24, textAlign: 'center', marginBottom: 24 }}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="__"
      />
      <TouchableOpacity
        style={{ backgroundColor: '#6366F1', padding: 14, borderRadius: 8, width: 180, alignItems: 'center' }}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Verify</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default EmailCodeVerificationScreen;
