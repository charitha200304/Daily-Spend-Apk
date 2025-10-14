import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions
} from "react-native"
import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "expo-router"
import { login, register } from "@/services/authService"
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { FontAwesome } from '@expo/vector-icons'
import DailySpendLogo from '../../components/DailySpendLogo';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { signInWithGoogleWeb, signInWithFacebook, signInWithAppleWeb, useGoogleAuth } from './socialAuth';

const CARD_MAX_WIDTH = 420;

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const passwordRef = useRef<TextInput>(null)

  useEffect(() => {
    const timer = setTimeout(() => {}, 500)
    return () => clearTimeout(timer)
  }, [])

  const promptGoogleAuth = useGoogleAuth(router, setError, setIsLoading);

  const handleLogin = async () => {
    if (isLoading) return
    setError("")
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (!password) {
      setError("Password cannot be empty.")
      return
    }
    setIsLoading(true)
    await login(email, password)
        .then((res) => {
          router.push("/dashboard")
        })
        .catch((err) => {
          setError("Login failed. Please check your credentials.")
          console.error(err)
        })
        .finally(() => {
          setIsLoading(false)
        })
  }

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      setIsLoading(true);
      try {
        const user = await signInWithGoogleWeb();
        if (user) {
          router.push("/dashboard");
        }
      } catch (error) {
        setError("Google sign-in failed. Please try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      promptGoogleAuth();
    }
  };

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Responsive paddings
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
          {/* Animated Gradient Background */}
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
          {/* Logo and App Name Header */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={{ alignItems: 'center', marginBottom: verticalPad, marginTop: verticalPad, width: '100%' }}>
            <DailySpendLogo width={96} height={96} style={{ marginBottom: 16 }} />
            <Animated.Text entering={FadeInDown.delay(100).duration(700).springify()} style={{ fontSize: appNameFont, fontWeight: '800', color: 'white', letterSpacing: 2 }}>Daily Spend</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200).duration(700).springify()} style={{ fontSize: subtitleFont, color: '#dbeafe', marginTop: 8 }}>Track your expenses smartly</Animated.Text>
          </Animated.View>

          {/* Card-style Form */}
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
            {error ? (
                <Text style={{ color: '#ef4444', fontSize: 15, marginBottom: 10, textAlign: 'center' }}>{error}</Text>
            ) : null}
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 16, color: '#222' }}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Email Address"
            />
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <TextInput
                  ref={passwordRef}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#222', paddingRight: 40 }}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect={false}
                  returnKeyType="done"
                  accessibilityLabel="Password"
              />
              <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 8, top: 8, padding: 4 }}
                  accessibilityLabel={showPassword ? "Hide Password" : "Show Password"}
              >
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <Pressable style={{ alignItems: 'flex-end', marginBottom: 16 }} onPress={() => {}}>
              <Text style={{ color: '#3B82F6', fontWeight: '500', fontSize: 14 }}>Forgot Password?</Text>
            </Pressable>
            <Animated.View entering={FadeInUp.delay(400).duration(700).springify()}>
              <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: isLoading ? '#60a5fa' : '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
                  activeOpacity={0.92}
                  accessibilityLabel="Sign In"
              >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
            {/* Social icon buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16, gap: 18 }}>
              <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  style={{ backgroundColor: '#fff', borderRadius: 50, padding: 14, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 }}
                  activeOpacity={0.8}
              >
                <FontAwesome name="google" size={28} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={signInWithFacebook}
                  style={{ backgroundColor: '#fff', borderRadius: 50, padding: 14, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 }}
                  activeOpacity={0.8}
              >
                <FontAwesome name="facebook" size={28} color="#1877f3" />
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={signInWithAppleWeb}
                  style={{ backgroundColor: '#fff', borderRadius: 50, padding: 14, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 }}
                  activeOpacity={0.8}
              >
                <FontAwesome name="apple" size={28} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 12, color: '#94a3b8', fontSize: 13 }}>OR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            </View>
            <Pressable
                style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}
                onPress={() => router.push("/register")}
                accessibilityLabel="Go to Register"
            >
              <Text style={{ color: '#64748b' }}>Don't have an account? </Text>
              <Text style={{ color: '#2563eb', fontWeight: '600' }}>Sign Up</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
  )
}

export default Login