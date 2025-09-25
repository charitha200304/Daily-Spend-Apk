import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth, applyActionCode } from 'firebase/auth';

const EmailCodeVerificationScreen = () => {
  const router = useRouter();
  const { oobCode } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode || typeof oobCode !== 'string') {
        Alert.alert('Invalid verification link.');
        setLoading(false);
        return;
      }
      try {
        const auth = getAuth();
        await applyActionCode(auth, oobCode);
        Alert.alert('Email verified! Redirecting to dashboard...');
        router.replace('/(dashboard)/dashboard');
      } catch (err) {
        Alert.alert('Verification failed. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    verifyEmail();
  }, [oobCode]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Verifying your email...</Text>
      {loading && <ActivityIndicator size="large" color="#6366F1" />}
    </View>
  );
};

export default EmailCodeVerificationScreen;
