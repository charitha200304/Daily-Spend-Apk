import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type FontAwesomeIconName = keyof typeof FontAwesome.glyphMap;

type Category = { name: string; color: string; icon: FontAwesomeIconName };

const initialCategories: Category[] = [
  { name: 'Food', color: '#6366F1', icon: 'cutlery' },
  { name: 'Transport', color: '#3B82F6', icon: 'bus' },
  { name: 'Shopping', color: '#9333EA', icon: 'shopping-bag' },
  { name: 'Salary', color: '#22c55e', icon: 'money' },
  { name: 'Other', color: '#818CF8', icon: 'ellipsis-h' },
];

const iconOptions: FontAwesomeIconName[] = ['cutlery', 'bus', 'shopping-bag', 'money', 'ellipsis-h', 'car', 'home', 'heart', 'film', 'book'];

const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');
  const [newIcon, setNewIcon] = useState<FontAwesomeIconName>('cutlery');

  const handleAddCategory = () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Category name is required');
      return;
    }
    setCategories([...categories, { name: newName, color: newColor, icon: newIcon }]);
    setModalVisible(false);
    setNewName('');
    setNewColor('#6366F1');
    setNewIcon('cutlery');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Categories</Text>
      {categories.map((cat) => (
        <View key={cat.name} style={styles.categoryRow}>
          <View style={[styles.iconCircle, { backgroundColor: cat.color }]}> 
            <FontAwesome name={cat.icon} size={20} color="#fff" />
          </View>
          <Text style={styles.categoryText}>{cat.name}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <FontAwesome name="plus" size={18} color="#fff" />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.label}>Pick Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {iconOptions.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, newIcon === icon && styles.selectedIconOption]}
                  onPress={() => setNewIcon(icon)}
                >
                  <FontAwesome name={icon} size={20} color={newIcon === icon ? '#6366F1' : '#888'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Pick Color</Text>
            <View style={styles.colorRow}>
              {['#6366F1', '#3B82F6', '#9333EA', '#22c55e', '#818CF8', '#F59E42', '#F43F5E', '#FACC15'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color }, newColor === color && styles.selectedColorCircle]}
                  onPress={() => setNewColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCategory}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryText: {
    fontSize: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 5,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  iconOption: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;
