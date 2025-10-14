import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions, Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import DailySpendLogo from '../../components/DailySpendLogo';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const CARD_MAX_WIDTH = 420;

const Register = () => {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const handleRegister = async () => {
    if (isLoading) return;
    if (password !== cPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters long");
      return;
    }
    if (!email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // Send verification email in the background
        sendEmailVerification(userCredential.user).catch(err => {
          console.warn('Failed to send verification email:', err);
          // Don't show error to user, just log it
        });
        // Navigate to dashboard on successful registration
        router.replace('/dashboard');
      }
    } catch (err) {
      const error = err as AuthError;
      Alert.alert(
        'Registration Failed', 
        error.message || 'Something went wrong during registration. Please try again.'
      );
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
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
              style={[
                styles.card,
                {
                  width: '100%',
                  maxWidth: CARD_MAX_WIDTH,
                  minWidth: 0,
                  paddingHorizontal: cardPad,
                  paddingVertical: cardPad + 8,
                }
              ]}
          >
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                autoCorrect={false}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 40 }]}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showPassword ? 'visibility-off' : 'visibility'} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                  placeholder="Confirm password"
                  value={cPassword}
                  onChangeText={setCPassword}
                  secureTextEntry={!showCPassword}
                  style={[styles.input, { paddingRight: 40 }]}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowCPassword(!showCPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showCPassword ? 'visibility-off' : 'visibility'} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <Animated.View entering={FadeInUp.delay(400).duration(700).springify()}>
              <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isLoading}
                  style={[styles.button, { backgroundColor: isLoading ? '#60a5fa' : '#2563eb' }]}
                  activeOpacity={0.92}
              >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Register</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
            <Pressable style={styles.loginLink} onPress={() => router.back()}>
              <Text style={{ color: '#64748b' }}>Already have an account? </Text>
              <Text style={{ color: '#2563eb', fontWeight: '600' }}>Login</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#222',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
});

export default Register;