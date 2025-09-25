import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth, sendEmailVerification } from 'firebase/auth';

const VerifyEmailScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        Alert.alert('Verification email resent!');
      }
    } catch (err) {
      Alert.alert('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const auth = getAuth();
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        router.replace('/(dashboard)/dashboard');
      } else {
        Alert.alert('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      Alert.alert('Failed to check verification status.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Verify Your Email</Text>
      <Text style={{ fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
        We've sent a verification link to your email address. Please verify your email to continue.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#6366F1', padding: 14, borderRadius: 8, marginBottom: 16, width: 220, alignItems: 'center' }}
        onPress={handleResend}
        disabled={resending}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {resending ? 'Resending...' : 'Resend Verification Email'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 8, width: 220, alignItems: 'center' }}
        onPress={handleCheckVerification}
        disabled={checking}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {checking ? 'Checking...' : 'I have verified my email'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyEmailScreen;
