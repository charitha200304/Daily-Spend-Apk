import * as Google from 'expo-auth-session/providers/google';
import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';
import { Platform } from 'react-native';
import React, { useEffect } from 'react';

// TODO: Replace these with your actual IDs from Google Cloud Console
const EXPO_CLIENT_ID = '<EXPO_CLIENT_ID>';
const ANDROID_CLIENT_ID = '<ANDROID_CLIENT_ID>';
const IOS_CLIENT_ID = '<IOS_CLIENT_ID>';
const WEB_CLIENT_ID = '<WEB_CLIENT_ID>';

export function useGoogleAuth(router: ReturnType<typeof import('expo-router').useRouter>, setError: (error: string) => void, setIsLoading: (loading: boolean) => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    const auth = getAuth();
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setIsLoading(true);
      signInWithCredential(auth, credential)
        .then(() => router.push('/dashboard'))
        .catch(error => setError(error.message))
        .finally(() => setIsLoading(false));
    }
  }, [response]);

  return promptAsync;
}

export async function signInWithGoogleWeb() {
  if (Platform.OS === 'web') {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      // @ts-ignore: signInWithPopup is only available on web
      const result = await import('firebase/auth').then(mod => mod.signInWithPopup(auth, provider));
      return result.user;
    } catch (error: any) {
      alert(error.message);
      throw error;
    }
  } else {
    throw new Error('signInWithGoogleWeb is only available on web. Use useGoogleAuth for mobile.');
  }
}

export async function signInWithFacebook() {
  const auth = getAuth();
  const provider = new FacebookAuthProvider();
  if (Platform.OS === 'web') {
    try {
      // @ts-ignore: signInWithPopup is only available on web
      const result = await import('firebase/auth').then(mod => mod.signInWithPopup(auth, provider));
      return result.user;
    } catch (error: any) {
      alert(error.message);
      throw error;
    }
  } else {
    alert('Facebook sign-in for mobile is not implemented yet.');
    throw new Error('Facebook sign-in for mobile is not implemented yet.');
  }
}

export async function signInWithAppleWeb() {
  const auth = getAuth();
  const provider = new OAuthProvider('apple.com');
  if (Platform.OS === 'web') {
    try {
      // @ts-ignore: signInWithPopup is only available on web
      const result = await import('firebase/auth').then(mod => mod.signInWithPopup(auth, provider));
      return result.user;
    } catch (error: any) {
      alert(error.message);
      throw error;
    }
  } else {
    alert('Apple sign-in for mobile is not implemented yet.');
    throw new Error('Apple sign-in for mobile is not implemented yet.');
  }
}

export default function SocialAuthScreen() {
  return null;
}
