import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import DailySpendLogo from '../components/DailySpendLogo';
import AddTransactionModal from '../components/AddTransactionModal';
import { addTransaction, listenToTransactions, updateTransaction, deleteTransaction } from '../services/transactionService';
import { getAuth } from 'firebase/auth';

const categories = [
  { name: 'Food', color: '#6366F1' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Shopping', color: '#9333EA' },
  { name: 'Salary', color: '#22c55e' },
  { name: 'Other', color: '#818CF8' },
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [budget] = useState(2000);
  const [editTx, setEditTx] = useState<any | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Listen to Firestore transactions in real time
  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, setTransactions);
    return () => unsub && unsub();
  }, [user]);

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const spent = totalExpense;
  const budgetProgress = budget === 0 ? 0 : spent / budget;

  // Calculate category breakdown
  const categoryTotals: { [k: string]: number } = {};
  transactions.forEach(tx => {
    if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
    if (tx.type === 'expense') categoryTotals[tx.category] += tx.amount;
  });
  const categoryPercents = categories.map(cat => ({
    ...cat,
    percent: spent ? Math.round((categoryTotals[cat.name] || 0) / spent * 100) : 0
  }));

  // Handle Add/Edit Transaction
  const handleAddTransaction = useCallback(async (data: { amount: number; category: string; description: string; type: "income" | "expense"; }) => {
    if (!user) return;
    try {
      if (editTx) {
        await updateTransaction(user.uid, editTx.id, data);
        setEditTx(null);
      } else {
        await addTransaction(user.uid, data);
      }
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', 'Could not save transaction.');
    }
  }, [user, editTx]);

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTransaction(user.uid, id);
      }}
    ]);
  };

  // Handle Delete Transaction (from modal)
  const handleModalDelete = async () => {
    if (!user || !editTx) return;
    await deleteTransaction(user.uid, editTx.id);
    setShowModal(false);
    setEditTx(null);
  };

  // Open modal for edit
  const handleEditTransaction = (tx: any) => {
    setEditTx(tx);
    setShowModal(true);
  };

  // (No changes to the logic, but let's check for any <View> with direct text children)
  // All text inside <View> is already wrapped in <Text> in this file, as seen in the FlatList and elsewhere.
  // No changes needed here.

  return (
    <LinearGradient colors={["#3B82F6", "#6366F1", "#9333EA"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <DailySpendLogo width={48} height={48} />
          <Text style={styles.appName}>Daily Spend</Text>
          <TouchableOpacity style={styles.avatar}>
            <FontAwesome name="user-circle" size={36} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.card}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>${balance.toLocaleString()}</Text>
          <TouchableOpacity style={styles.addExpenseBtn} onPress={() => { setEditTx(null); setShowModal(true); }}>
            <FontAwesome name="plus" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Monthly Budget Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${Math.min(budgetProgress * 100, 100)}%` }]} />
          </View>
          <Text style={styles.budgetText}>${spent} spent of ${budget} budget</Text>
        </View>

        {/* Spending by Category */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            {categoryPercents.map(cat => (
              <View key={cat.name} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: cat.color, marginBottom: 6 }} />
                <Text style={{ color: '#222', fontWeight: '500', fontSize: 13 }}>{cat.name}</Text>
                <Text style={{ color: '#6366F1', fontSize: 12 }}>{cat.percent}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <FlatList
            data={transactions.slice(0, 10)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionRow}>
                <FontAwesome name={item.category === 'Food' ? 'cutlery' : item.category === 'Transport' ? 'bus' : item.category === 'Shopping' ? 'shopping-bag' : item.category === 'Salary' ? 'money' : 'ellipsis-h'} size={20} color={item.type === 'income' ? '#22c55e' : '#ef4444'} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#222', fontWeight: '600' }}>{item.category}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{item.description || ''}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</Text>
                </View>
                <Text style={{ color: item.type === 'income' ? '#22c55e' : '#ef4444', fontWeight: '700', fontSize: 16 }}>
                  {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount)}
                </Text>
                {/* Edit/Delete Buttons */}
                <TouchableOpacity onPress={() => handleEditTransaction(item)} style={{ marginLeft: 8, padding: 4 }}>
                  <FontAwesome name="edit" size={18} color="#6366F1" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={{ marginLeft: 6, padding: 4 }}>
                  <FontAwesome name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            style={{ marginTop: 10 }}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditTx(null); }}
        onSave={handleAddTransaction}
        {...(editTx ? { 
          initialAmount: editTx.amount.toString(), 
          initialCategory: editTx.category, 
          initialDescription: editTx.description, 
          initialType: editTx.type,
          onDelete: handleModalDelete
        } : {})}
      />
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="dashboard" size={22} color="#6366F1" />
          <Text style={styles.navActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setEditTx(null); setShowModal(true); }}>
          <FontAwesome name="plus-circle" size={28} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="pie-chart" size={22} color="#64748b" />
          <Text style={styles.navInactive}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="user" size={22} color="#64748b" />
          <Text style={styles.navInactive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 38,
    paddingBottom: 110,
    alignItems: 'stretch',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  appName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 2,
  },
  avatar: {
    backgroundColor: 'rgba(99,102,241,0.18)',
    borderRadius: 20,
    padding: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    // Use boxShadow for web, shadow* for native
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.03)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.03,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }
    ),
  },
  balanceLabel: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 5,
  },
  balanceValue: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 10,
  },
  addExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  budgetText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    gap: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // Use boxShadow for web, shadow* for native
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px -2px 8px rgba(0,0,0,0.04)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 10,
        }
    ),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navActive: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
  },
  navInactive: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 13,
    marginTop: 2,
  },
});
