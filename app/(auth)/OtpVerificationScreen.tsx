import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth, sendEmailVerification } from 'firebase/auth';

const OtpVerificationScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch('https://your-api.com/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (!response.ok) throw new Error('OTP verification failed');
      // Navigate to dashboard on success
      router.replace('/(dashboard)/dashboard');
    } catch (err) {
      alert('Invalid OTP or verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Verify Email</Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>Enter the OTP sent to {email}</Text>
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="numeric"
        style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 18, width: 220 }}
        maxLength={6}
      />
      <TouchableOpacity
        onPress={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        style={{ backgroundColor: isLoading || otp.length !== 6 ? '#cbd5e1' : '#2563eb', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, marginBottom: 16 }}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Verify</Text>}
      </TouchableOpacity>
      {/* Resend verification email button */}
      <TouchableOpacity
        onPress={async () => {
          setResending(true);
          try {
            const auth = getAuth();
            if (auth.currentUser && !auth.currentUser.emailVerified) {
              await sendEmailVerification(auth.currentUser);
              alert('Verification email resent! Please check your inbox.');
            } else {
              alert('Please log in again to resend verification email.');
            }
          } catch (err: any) {
            alert('Failed to resend verification email. ' + (err?.message || ''));
          } finally {
            setResending(false);
          }
        }}
        disabled={resending}
        style={{ backgroundColor: resending ? '#cbd5e1' : '#fbbf24', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 }}
      >
        <Text style={{ color: '#333', fontSize: 16, fontWeight: '500' }}>{resending ? 'Resending...' : 'Resend Verification Email'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpVerificationScreen;
