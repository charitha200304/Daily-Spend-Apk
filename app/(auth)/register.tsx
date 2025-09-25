import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient'
import DailySpendLogo from '../../components/DailySpendLogo';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const CARD_MAX_WIDTH = 420;

const Register = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cPassword, setCPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (isLoading) return
    if (password !== cPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification with error handling
      if (userCredential.user) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (err: any) {
          alert('Failed to send verification email: ' + (err?.message || 'Unknown error.'));
          console.error('sendEmailVerification error:', err);
        }
      }
      // Send verification code via backend
      await fetch('http://localhost:3001/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Redirect to code verification screen
      router.replace({ pathname: '/(auth)/EmailCodeVerificationScreen', params: { email } });
    } catch (err: any) {
      alert("Registration failed. " + (err?.message || "Something went wrong."))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const horizontalPad = screenWidth < 400 ? 12 : screenWidth < 600 ? 24 : 48;
  const verticalPad = screenWidth < 400 ? 16 : screenWidth < 600 ? 24 : 36;
  const cardPad = screenWidth < 400 ? 16 : screenWidth < 600 ? 24 : 36;
  const appNameFont = screenWidth < 400 ? 28 : screenWidth < 600 ? 36 : 44;
  const subtitleFont = screenWidth < 400 ? 13 : screenWidth < 600 ? 15 : 16;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: horizontalPad }}>
        <LinearGradient
          colors={["#3B82F6", "#6366F1", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: screenWidth,
            height: screenHeight,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
        <Animated.View entering={FadeInDown.duration(700).springify()} style={{ alignItems: 'center', marginBottom: verticalPad, marginTop: verticalPad, width: '100%' }}>
          <DailySpendLogo width={96} height={96} style={{ marginBottom: 16 }} />
          <Animated.Text entering={FadeInDown.delay(100).duration(700).springify()} style={{ fontSize: appNameFont, fontWeight: '800', color: 'white', letterSpacing: 2 }}>Daily Spend</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(700).springify()} style={{ fontSize: subtitleFont, color: '#dbeafe', marginTop: 8 }}>Track your expenses smartly</Animated.Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(700).springify()}
          style={{
            width: '100%',
            maxWidth: CARD_MAX_WIDTH,
            minWidth: 0,
            backgroundColor: 'white',
            borderRadius: 28,
            paddingHorizontal: cardPad,
            paddingVertical: cardPad + 8,
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.09)',
          }}
        >
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 16, color: '#222' }}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            autoCorrect={false}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 16, color: '#222' }}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            autoCorrect={false}
          />
          <TextInput
            placeholder="Confirm password"
            value={cPassword}
            onChangeText={setCPassword}
            secureTextEntry
            style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 16, color: '#222' }}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            autoCorrect={false}
          />
          <Animated.View entering={FadeInUp.delay(400).duration(700).springify()}>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: isLoading ? '#60a5fa' : '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
              activeOpacity={0.92}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Register</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Pressable style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }} onPress={() => router.back()}>
            <Text style={{ color: '#64748b' }}>Already have an account? </Text>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Login</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Register
