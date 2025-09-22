import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Platform, Button, TextInput, Modal, SafeAreaView, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import DailySpendLogo from '../../components/DailySpendLogo';
import AddTransactionModal from '../../components/AddTransactionModal';
import ProfileForm from './ProfileForm';
import { addTransaction, listenToTransactions, updateTransaction, deleteTransaction } from '../../services/transactionService';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';

const categories = [
  { name: 'Food', color: '#6366F1' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Shopping', color: '#9333EA' },
  { name: 'Salary', color: '#22c55e' },
  { name: 'Other', color: '#818CF8' },
];

const HEADER_HEIGHT = Platform.OS === 'web' ? 110 : 170;

// Utility to get cross-platform shadow
const getShadow = () =>
  Platform.OS === 'web'
    ? { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }
    : {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      };

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 110,
    alignItems: 'stretch',
    minHeight: '100%',
  },
  fixedHeader: {
    position: 'relative',
    width: '100%',
    zIndex: 100,
    elevation: 5,
    ...getShadow(),
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 12 : 36,
    paddingBottom: 8,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    width: '100%',
  },
  bottomNavFixed: {
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
    ...getShadow(),
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#6366F1',
    zIndex: 999,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 18,
    ...getShadow(),
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
  drawerClose: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1000,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  drawerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 12,
  },
});

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [budget] = useState(2000);
  const [editTx, setEditTx] = useState<any | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState<keyof typeof FontAwesome.glyphMap>('cutlery');
  const [newCategoryColor, setNewCategoryColor] = useState('');
  const iconOptions: (keyof typeof FontAwesome.glyphMap)[] = ['cutlery', 'bus', 'shopping-bag', 'money', 'ellipsis-h'];
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  // Handler for scroll position
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    // Fade in header after 30px scroll, max opacity at 80px
    const opacity = Math.min(Math.max(y - 30, 0) / 50, 1);
  };

  // Listen to Firestore transactions in real time
  useEffect(() => {
    if (!user) return;
    const unsub = listenToTransactions(user.uid, setTransactions);
    return () => unsub && unsub();
  }, [user]);

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  // Exclude salary from expenses
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.category !== 'Salary').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const spent = totalExpense;
  const budgetProgress = budget === 0 ? 0 : spent / budget;

  // Calculate category breakdown
  const categoryTotals: { [k: string]: number } = {};
  let totalCategorySpend = 0;
  transactions.forEach(tx => {
    if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
    if (tx.type === 'expense') {
      categoryTotals[tx.category] += tx.amount;
      totalCategorySpend += tx.amount;
    }
  });
  // Ensure all categories are present in categoryTotals even if zero
  categories.forEach(cat => {
    if (!(cat.name in categoryTotals)) {
      categoryTotals[cat.name] = 0;
    }
  });
  // Real percentage: each category's spend divided by total spend (all categories)
  const categoryPercents = categories.map(cat => ({
    ...cat,
    percent: totalCategorySpend ? ((categoryTotals[cat.name] || 0) / totalCategorySpend * 100) : 0
  }));

  // Sort transactions by most recent (last added at the top)
  const sortedTransactions = [...transactions].sort((a, b) => {
    // Use createdAt if available, else fallback to id or another property
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt;
    }
    // If createdAt is missing, try to sort by id (assuming it is a timestamp or sortable string)
    if (a.id && b.id) {
      return b.id > a.id ? 1 : -1;
    }
    return 0;
  });

  // Handle Add/Edit Transaction
  const forbiddenIncomeCategories = ['Food', 'Transport', 'Shopping'];
  const handleAddTransaction = useCallback(async (data: { amount: number; category: string; description: string; type: "income" | "expense"; }) => {
    if (!user) return;

    // Prevent saving/updating salary as expense
    if (data.type === 'expense' && data.category === 'Salary') {
      Alert.alert('Invalid Transaction', 'You cannot save or update Salary as an expense.');
      return;
    }

    // Prevent saving/updating Food, Transport, Shopping as income
    if (data.type === 'income' && forbiddenIncomeCategories.includes(data.category)) {
      Alert.alert('Invalid Transaction', `You cannot save or update ${data.category} as an income.`);
      return;
    }

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
    console.log('Delete button pressed for transaction ID:', id);
    if (!user) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this transaction?');
      if (confirmed) {
        try {
          await deleteTransaction(user.uid, id);
        } catch (e) {
          console.error('Delete failed:', e);
          window.alert('Could not delete transaction.');
        }
      }
    } else {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTransaction(user.uid, id);
              } catch (e) {
                console.error('Delete failed:', e);
                Alert.alert('Error', 'Could not delete transaction.');
              }
            }
          }
        ]
      );
    }
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

  const handleAddCategory = useCallback(async () => {
    // Add category logic here
    console.log('Add category:', newCategoryName, newCategoryIcon, newCategoryColor);
    setShowCategoryModal(false);
  }, [newCategoryName, newCategoryIcon, newCategoryColor]);

  // Open/close drawer animation
  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: Dimensions.get('window').width,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setTimeout(() => setDrawerVisible(false), 250); // Hide after animation
  };

  return (
    <LinearGradient colors={["#3B82F6", "#6366F1", "#9333EA"]} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Animated Header with SafeAreaView for native */}
        <SafeAreaView style={{ backgroundColor: 'transparent', zIndex: 100 }}>
          <View style={styles.fixedHeader}>
            <LinearGradient
              colors={[`rgba(59,130,246,1)`, `rgba(99,102,241,1)`]}
              style={styles.headerGradient}
            >
              {/* Overlay for animated opacity */}
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <DailySpendLogo width={32} height={32} />
              </View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 24, textAlign: 'center', flex: 1 }}>
                Daily Spend
              </Text>
              {/* Menu Button (Hamburger) replaces profile icon */}
              <TouchableOpacity
                style={{ width: 32, height: 32, alignItems: 'flex-end', justifyContent: 'center' }}
                onPress={openDrawer}
              >
                <View style={{ backgroundColor: '#fff', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesome name="bars" size={20} color="#6366F1" />
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
        <Animated.ScrollView
          contentContainerStyle={styles.container}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {/* Modern Dashboard Summary Cards */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: '#fff', marginRight: 12, borderRadius: 18, padding: 18, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } }) }}>
              <FontAwesome name="bank" size={32} color="#6366F1" />
              <Text style={{ fontSize: 16, color: '#64748b', marginTop: 8 }}>Balance</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222' }}>${balance.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#fff', marginRight: 12, borderRadius: 18, padding: 18, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } }) }}>
              <FontAwesome name="arrow-circle-down" size={32} color="#22c55e" />
              <Text style={{ fontSize: 16, color: '#64748b', marginTop: 8 }}>Income</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#22c55e' }}>+${totalIncome.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } }) }}>
              <FontAwesome name="arrow-circle-up" size={32} color="#ef4444" />
              <Text style={{ fontSize: 16, color: '#64748b', marginTop: 8 }}>Expenses</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#ef4444' }}>-${totalExpense.toLocaleString()}</Text>
            </View>
          </View>
          {/* Category Breakdown with Icons */}
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 24, ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } }) }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 16 }}>Spending by Category</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {categories.map(cat => (
                <View key={cat.name} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ backgroundColor: cat.color, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <FontAwesome name={cat.name === 'Food' ? 'cutlery' : cat.name === 'Transport' ? 'bus' : cat.name === 'Shopping' ? 'shopping-bag' : cat.name === 'Salary' ? 'money' : 'ellipsis-h'} size={20} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>{cat.name}</Text>
                  <Text style={{ fontSize: 13, color: '#222', fontWeight: 'bold' }}>{categoryTotals[cat.name] ? `$${categoryTotals[cat.name].toLocaleString()}` : '$0'}</Text>
                  <Text style={{ fontSize: 12, color: '#818CF8' }}>{categoryPercents.find(c => c.name === cat.name)?.percent || 0}%</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Recent Transactions - Customized */}
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 24, ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } }) }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 16 }}>Recent Transactions</Text>
            {sortedTransactions.length === 0 ? (
              <Text style={{ color: '#888', textAlign: 'center' }}>No transactions yet.</Text>
            ) : (
              sortedTransactions.slice(0, 5).map(tx => {
                const cat = categories.find(c => c.name === tx.category);
                return (
                  <View key={tx.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, justifyContent: 'space-between', backgroundColor: '#f4f4fa', borderRadius: 10, padding: 10 }}>
                    <View style={{ backgroundColor: cat?.color || '#818CF8', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <FontAwesome name={tx.category === 'Food' ? 'cutlery' : tx.category === 'Transport' ? 'bus' : tx.category === 'Shopping' ? 'shopping-bag' : tx.category === 'Salary' ? 'money' : 'ellipsis-h'} size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', color: tx.type === 'income' ? '#22c55e' : '#ef4444', fontSize: 16 }}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount} <Text style={{ color: '#6366F1', fontWeight: 'normal' }}>{tx.category}</Text>
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 13 }}>{tx.description}</Text>
                      {tx.date && <Text style={{ color: '#888', fontSize: 12 }}>{tx.date}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handleEditTransaction(tx)} style={{ marginHorizontal: 8 }}>
                      <FontAwesome name="pencil" size={18} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTransaction(tx.id)}>
                      <FontAwesome name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
          {/* Add/Edit Transaction Modal */}
          <AddTransactionModal
            visible={showModal}
            onClose={() => { setShowModal(false); setEditTx(null); }}
            onSave={handleAddTransaction}
            {...(editTx ? {
              initialAmount: editTx.amount.toString(),
              initialCategory: editTx.category,
              initialDescription: editTx.description,
              initialType: editTx.type
              // Removed onDelete to hide Delete button in modal
            } : {})}
          />
          {/* Category Modal (like Add Transaction) */}
          <Modal
            visible={showCategoryModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, minWidth: 340, maxWidth: '90%' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Add Category</Text>
                <TextInput
                  style={{ borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 }}
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <Text style={{ marginBottom: 6 }}>Pick Icon</Text>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  {iconOptions.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={{ padding: 8, borderRadius: 6, borderWidth: newCategoryIcon === icon ? 2 : 0, borderColor: '#6366F1', marginRight: 6 }}
                      onPress={() => setNewCategoryIcon(icon)}
                    >
                      <FontAwesome name={icon} size={20} color={newCategoryIcon === icon ? '#6366F1' : '#888'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ marginBottom: 6 }}>Pick Color</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {['#6366F1', '#3B82F6', '#9333EA', '#22c55e', '#818CF8', '#F59E42', '#F43F5E', '#FACC15'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, marginRight: 8, borderWidth: newCategoryColor === color ? 2 : 0, borderColor: '#6366F1' }}
                      onPress={() => setNewCategoryColor(color)}
                    />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#6366F1', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddCategory} style={{ backgroundColor: '#6366F1', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Animated.ScrollView>
        {/* Right-side Drawer */}
        {drawerVisible && (
          <Animated.View
            style={[
              styles.drawer,
              { right: 0, transform: [{ translateX: drawerAnim }] },
            ]}
          >
            {/* App Branding and Greeting */}
            <View style={{ alignItems: 'center', marginBottom: 18, width: '100%' }}>
              <DailySpendLogo width={38} height={38} style={{ marginBottom: 6 }} />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, letterSpacing: 0.2, marginBottom: 2 }}>Daily Spend</Text>
              <Text style={{ color: '#dbeafe', fontSize: 15, marginBottom: 2 }}>
                Hi, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
              </Text>
            </View>
            {/* Modern Profile Card */}
            <View style={{
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: 24,
              marginBottom: 32,
              width: 210,
              ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 } }),
            }}>
              {user?.photoURL ? (
                <View style={{ width: 74, height: 74, borderRadius: 37, borderWidth: 3, borderColor: '#fff', marginBottom: 14, backgroundColor: '#e0e7ff', ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 } }), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Image
                    source={{ uri: user.photoURL }}
                    style={{ width: 74, height: 74, borderRadius: 37 }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: '#e0e7ff', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14, ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 } }) }}>
                  <FontAwesome name="user" size={38} color="#6366F1" />
                </View>
              )}
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 8, textAlign: 'center', letterSpacing: 0.2 }}>
                {user?.displayName || user?.email || 'User'}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await auth.signOut();
                  router.replace('/login');
                }}
                style={{
                  backgroundColor: '#ef4444',
                  borderRadius: 50,
                  paddingVertical: 10,
                  paddingHorizontal: 0,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  width: 140,
                  marginTop: 8,
                  ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 4, elevation: 2 } }),
                }}
              >
                <FontAwesome name="sign-out" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Log out</Text>
              </TouchableOpacity>
            </View>
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', width: '90%', marginBottom: 28, borderRadius: 1 }} />
            {/* Drawer Buttons */}
            <TouchableOpacity
              style={styles.drawerButton}
              onPress={() => {
                setShowModal(true); // Open Add Transaction modal
                closeDrawer();
              }}
            >
              <FontAwesome name="plus-circle" size={22} color="#fff" />
              <Text style={styles.drawerButtonText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerButton}
              onPress={() => {
                router.push('/(dashboard)/profile');
                closeDrawer();
              }}
            >
              <FontAwesome name="user" size={22} color="#fff" />
              <Text style={styles.drawerButtonText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.drawerButton, { backgroundColor: '#fff', marginTop: 8 }]}
              onPress={closeDrawer}
            >
              <FontAwesome name="arrow-left" size={16} color="#6366F1" />
              <Text style={[styles.drawerButtonText, { color: '#6366F1' }]}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {/* Fixed Bottom Navigation Bar */}
        <View style={styles.bottomNavFixed}>
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome name="dashboard" size={22} color="#6366F1" />
            <Text style={styles.navActive}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setEditTx(null); setShowModal(true); }}>
            <FontAwesome name="plus-circle" size={28} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(dashboard)/profile')}>
            <FontAwesome name="user" size={22} color="#64748b" />
            <Text style={styles.navInactive}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
