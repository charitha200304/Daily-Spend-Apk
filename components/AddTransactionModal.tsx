import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const CATEGORIES = [
  { label: 'Food', icon: 'cutlery' },
  { label: 'Transport', icon: 'bus' },
  { label: 'Shopping', icon: 'shopping-bag' },
  { label: 'Salary', icon: 'money' },
  { label: 'Other', icon: 'ellipsis-h' },
];

export default function AddTransactionModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialAmount = '',
  initialCategory,
  initialDescription = '',
  initialType = 'expense',
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; category: string; description: string; type: 'income' | 'expense' }) => void;
  onDelete?: () => void;
  initialAmount?: string;
  initialCategory?: string;
  initialDescription?: string;
  initialType?: 'income' | 'expense';
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [category, setCategory] = useState(initialCategory || CATEGORIES[0].label);
  const [description, setDescription] = useState(initialDescription);
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount(initialAmount);
      setCategory(initialCategory || CATEGORIES[0].label);
      setDescription(initialDescription);
      setType(initialType);
      setError('');
    }
  }, [visible, initialAmount, initialCategory, initialDescription, initialType]);

  const handleSave = () => {
    setError('');
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    onSave({ amount: num, category, description, type });
    setAmount('');
    setDescription('');
    setType('expense');
    setCategory(CATEGORIES[0].label);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onDelete(); onClose(); } }
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{initialAmount ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity onPress={() => setType('expense')} style={[styles.typeBtn, type === 'expense' && styles.typeActive]}>
              <FontAwesome name="minus" size={16} color={type === 'expense' ? '#fff' : '#ef4444'} />
              <Text style={[styles.typeText, type === 'expense' && { color: '#fff' }]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('income')} style={[styles.typeBtn, type === 'income' && styles.typeActiveIncome]}>
              <FontAwesome name="plus" size={16} color={type === 'income' ? '#fff' : '#22c55e'} />
              <Text style={[styles.typeText, type === 'income' && { color: '#fff' }]}>Income</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <View style={[styles.categoryRow, { flexDirection: 'row' }]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.catBtn, category === cat.label && styles.catActive]}
                onPress={() => setCategory(cat.label)}
              >
                <FontAwesome name={cat.icon as any} size={18} color={category === cat.label ? '#fff' : '#6366F1'} />
                <Text style={{ color: category === cat.label ? '#fff' : '#6366F1', fontSize: 13, marginLeft: 4 }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { marginBottom: 16 }]}
          />
          {error ? (
            <Text style={{ color: '#ef4444', marginBottom: 8 }}>{error}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={{ color: '#6366F1', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            {initialAmount && onDelete && (
              <TouchableOpacity onPress={handleDelete} style={[styles.saveBtn, { backgroundColor: '#ef4444' }]}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    width: '95%',
    maxWidth: 420,
    minWidth: 260,
    alignItems: 'center',
    justifyContent: 'center',
    // Use boxShadow for web, shadow* for native
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 18px rgba(0,0,0,0.07)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }
    ),
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: '#6366F1',
    marginBottom: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
    alignSelf: 'center',
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ef4444',
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  typeActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeActiveIncome: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  typeText: {
    fontWeight: '600',
    color: '#ef4444',
    fontSize: 17,
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 18 : 14,
    fontSize: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#222',
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  categoryRow: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 6,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginHorizontal: 0,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    minWidth: 68,
    flex: 1,
    margin: 2,
    maxWidth: 100,
  },
  catActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignSelf: 'center',
  },
  saveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignSelf: 'center',
  },
});
