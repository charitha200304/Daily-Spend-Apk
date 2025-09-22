import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import React from "react"
import { getAuth } from 'firebase/auth'

const ProfileForm = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  // Use user data from auth
  const [name, setName] = React.useState(user?.displayName || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phoneNumber || '');

  const handleSave = () => {
    // You can add logic to save profile info to backend here
    Alert.alert('Profile saved!');
  };

  return (
    <View style={{ width: '100%' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' }}>Profile</Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Name</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 }}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Email</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 }}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={false}
      />
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Phone</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 24 }}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#6366F1', borderRadius: 8, padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ProfileForm
