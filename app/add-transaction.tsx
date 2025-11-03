import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Platform, Alert, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import {
  addTransactionFirestore,
  getCategories,
  getPaymentMethods,
  initializeDefaultCategories,
  initializeDefaultPaymentMethods,
  Category,
  PaymentMethod,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function AddTransaction() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      await initializeDefaultCategories(user.uid);
      await initializeDefaultPaymentMethods(user.uid);

      const cats = await getCategories(user.uid);
      const pms = await getPaymentMethods(user.uid);

      setCategories(cats);
      setPaymentMethods(pms);

      // Pre-select first category and payment method
      if (cats.length > 0) setSelectedCategory(cats[0]);
      if (pms.length > 0) setSelectedPayment(pms[0]);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const save = async () => {
    if (!user) return;

    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category');
      return;
    }

    setSaving(true);
    try {
      await addTransactionFirestore(user.uid, {
        amount: num,
        note,
        categoryId: selectedCategory.id,
        paymentMethodId: selectedPayment?.id,
      });
      router.back();
    } catch (err) {
      console.error('Error saving transaction', err);
      Alert.alert('Save failed', 'Could not save transaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centerContent}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Add Expense</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountCard}>
          <ThemedText style={styles.amountLabel}>Amount (PKR)</ThemedText>
          <View style={styles.amountInputContainer}>
            <ThemedText style={styles.currencySymbol}>Rs</ThemedText>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amt) => (
              <Pressable
                key={amt}
                style={styles.quickAmountBtn}
                onPress={() => setAmount(amt.toString())}
              >
                <ThemedText style={styles.quickAmountText}>+{amt}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Category</ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === cat.id && styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: cat.color + '30' },
                    selectedCategory?.id === cat.id && { backgroundColor: cat.color },
                  ]}
                >
                  <ThemedText style={styles.categoryEmoji}>{cat.icon}</ThemedText>
                </View>
                <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
          <View style={styles.paymentList}>
            {paymentMethods.map((pm) => (
              <Pressable
                key={pm.id}
                style={[
                  styles.paymentItem,
                  selectedPayment?.id === pm.id && styles.paymentItemSelected,
                ]}
                onPress={() => setSelectedPayment(pm)}
              >
                <View style={styles.paymentLeft}>
                  <ThemedText style={styles.paymentIcon}>{pm.icon}</ThemedText>
                  <ThemedText style={styles.paymentName}>{pm.name}</ThemedText>
                </View>
                {selectedPayment?.id === pm.id && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Note (Optional)</ThemedText>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={save}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <ThemedText style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Transaction'}
            </ThemedText>
          </LinearGradient>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },

  // Amount Card
  amountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryItemSelected: {
    transform: [{ scale: 1.05 }],
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Payment Methods
  paymentList: {
    gap: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
  },
  paymentItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },

  // Note Input
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Save Button
  saveButton: {
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
