import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Image, StyleSheet, Animated } from "react-native"
import React, { useEffect, useRef } from "react"
import { getAuth, updateProfile } from 'firebase/auth'
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';

const ProfilePlaceholder = require('../../assets/images/react-logo.png');

const ProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();
  const router = useRouter();

  // Use user data from auth (initial, but will be replaced by Firestore)
  const [name, setName] = React.useState(user?.displayName || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phoneNumber || '');
  const [profilePic, setProfilePic] = React.useState<string | null>(user?.photoURL || null);

  const [editingField, setEditingField] = React.useState(null as null | 'name' | 'phone');
  const [tempName, setTempName] = React.useState(name);
  const [tempPhone, setTempPhone] = React.useState(phone);
  const [saving, setSaving] = React.useState(false);

  // Store original profile for unsaved changes check
  const originalProfile = React.useRef({ name, phone, profilePic });

  // Fetch Firestore profile on mount and when user changes
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setTempName(data.name || '');
        setPhone(data.phone || '');
        setTempPhone(data.phone || '');
        setProfilePic(data.photoURL || null);
        // Save original profile for change detection
        originalProfile.current = {
          name: data.name || '',
          phone: data.phone || '',
          profilePic: data.photoURL || null,
        };
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper: check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      name !== originalProfile.current.name ||
      phone !== originalProfile.current.phone ||
      profilePic !== originalProfile.current.profilePic
    );
  };

  // Intercept back button
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.replace('/dashboard') },
          { text: 'Save', style: 'default', onPress: async () => {
            await handleSaveProfile();
            router.replace('/dashboard');
          }},
        ]
      );
    } else {
      router.replace('/dashboard');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleFieldSave = (field: 'name' | 'phone') => {
    if (field === 'name') {
      setName(tempName);
    } else if (field === 'phone') {
      setPhone(tempPhone);
    }
    setEditingField(null);
  };

  // Refetch profile after saving to immediately update phone in UI
  const fetchProfile = async (user, db, setName, setTempName, setPhone, setTempPhone, setProfilePic, originalProfile) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setName(data.name || '');
      setTempName(data.name || '');
      setPhone(data.phone || '');
      setTempPhone(data.phone || '');
      setProfilePic(data.photoURL || null);
      originalProfile.current = {
        name: data.name || '',
        phone: data.phone || '',
        profilePic: data.photoURL || null,
      };
    }
  };

  // Save profile info and picture to Firestore and Auth
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Firestore user doc (create if not exists)
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        name,
        phone,
        photoURL: profilePic,
      }, { merge: true });
      // Update Auth profile
      await updateProfile(user, {
        displayName: name,
        photoURL: profilePic || undefined,
      });
      // Refetch profile to update UI immediately
      await fetchProfile(user, db, setName, setTempName, setPhone, setTempPhone, setProfilePic, originalProfile);
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (e) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <LinearGradient
        colors={["#3B82F6", "#6366F1", "#9333EA"]}
        style={styles.headerGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.avatarOuter}>
            <Image
              source={profilePic ? { uri: profilePic } : ProfilePlaceholder}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.avatarEditBtn}>
              <MaterialIcons name="edit" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.headerName}>{name || 'User'}</Text>
          <Text style={styles.headerEmail}>{email}</Text>
        </View>
      </LinearGradient>
      <View style={styles.profileCard}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        {editingField === 'name' ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
            />
            <TouchableOpacity onPress={() => handleFieldSave('name')} style={styles.iconBtn}>
              <MaterialIcons name="check" size={24} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingField(null); setTempName(name); }} style={styles.iconBtn}>
              <MaterialIcons name="close" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{name || 'No name set'}</Text>
            <TouchableOpacity onPress={() => setEditingField('name')} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={22} color="#6366F1" />
            </TouchableOpacity>
          </View>
        )}
        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{email}</Text>
          <MaterialIcons name="lock" size={20} color="#64748b" />
        </View>
        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        {editingField === 'phone' ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <TouchableOpacity onPress={() => handleFieldSave('phone')} style={styles.iconBtn}>
              <MaterialIcons name="check" size={24} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingField(null); setTempPhone(phone); }} style={styles.iconBtn}>
              <MaterialIcons name="close" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{phone || 'No phone set'}</Text>
            <TouchableOpacity onPress={() => setEditingField('phone')} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={22} color="#6366F1" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.divider} />
        <TouchableOpacity onPress={handleSaveProfile} style={[styles.saveBtn, saving && { opacity: 0.7 }]} activeOpacity={0.88} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.88}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: 42,
    left: 18,
    zIndex: 10,
    backgroundColor: 'rgba(60,60,120,0.16)',
    borderRadius: 18,
    padding: 4,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 36,
    paddingTop: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 24px rgba(99,102,241,0.10)',
      },
      default: {
        shadowColor: '#6366F1',
        shadowOpacity: 0.13,
        shadowRadius: 12,
        elevation: 8,
      }
    }),
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  avatarOuter: {
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(99,102,241,0.25)',
      },
      default: {
        shadowColor: '#6366F1',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
      }
    }),
    borderRadius: 70,
    backgroundColor: '#fff',
    padding: 4,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f3f4f6',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#6366F1',
    borderRadius: 18,
    padding: 7,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(99,102,241,0.20)',
      },
      default: {
        shadowColor: '#6366F1',
        shadowOpacity: 0.20,
        shadowRadius: 6,
        elevation: 4,
      }
    }),
  },
  greetingText: {
    color: '#e0e7ef',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 0,
  },
  headerName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    marginTop: 0,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  headerEmail: {
    color: '#dbeafe',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 6,
  },
  profileCard: {
    width: '92%',
    maxWidth: 430,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    marginTop: -36,
    alignSelf: 'center',
    alignItems: 'stretch',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 24px rgba(99,102,241,0.10)',
      },
      default: {
        shadowColor: '#6366F1',
        shadowOpacity: 0.10,
        shadowRadius: 18,
        elevation: 7,
      }
    }),
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoText: {
    fontSize: 17,
    color: '#0f172a',
    flex: 1,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    flex: 1,
    fontWeight: '500',
  },
  iconBtn: {
    marginLeft: 8,
    padding: 2,
  },
  divider: {
    width: '70%',
    height: 1.5,
    backgroundColor: '#e0e7ef',
    marginVertical: 16,
    borderRadius: 1,
    alignSelf: 'center',
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 12px rgba(99,102,241,0.13)',
      },
      default: {
        shadowColor: '#6366F1',
        shadowOpacity: 0.13,
        shadowRadius: 8,
        elevation: 3,
      }
    }),
    marginBottom: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 12px rgba(239,68,68,0.13)',
      },
      default: {
        shadowColor: '#ef4444',
        shadowOpacity: 0.13,
        shadowRadius: 8,
        elevation: 3,
      }
    }),
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default ProfileScreen
