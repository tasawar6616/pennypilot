import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import {
  getRecentTransactionsFirestore,
  getCategories,
  deleteTransaction,
  TransactionRow,
  Category,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
      const txns = await getRecentTransactionsFirestore(user.uid, 100);
      const cats = await getCategories(user.uid);

      setTransactions(txns);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: string | null | undefined) => {
    if (!id) return null;
    return categories.find((c) => c.id === id);
  };

  const handleDelete = (id: string) => {
    if (!user) return;

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
              setTransactions(transactions.filter((t) => t.id !== id));
            } catch (err) {
              console.error('Error deleting transaction', err);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

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
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
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
          <View>
            <ThemedText style={styles.title}>All Transactions</ThemedText>
            <ThemedText style={styles.subtitle}>
              {transactions.length} transactions · Rs {totalAmount.toLocaleString('en-PK')}
            </ThemedText>
          </View>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>📝</ThemedText>
            <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start adding expenses to track your spending
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((txn) => {
              const category = getCategoryById(txn.categoryId);
              return (
                <View key={txn.id} style={styles.transactionCard}>
                  <View style={styles.transactionMain}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category?.color ? category.color + '20' : '#F3F4F6' },
                      ]}
                    >
                      <ThemedText style={styles.categoryEmoji}>
                        {category?.icon || '💰'}
                      </ThemedText>
                    </View>

                    <View style={styles.transactionInfo}>
                      <ThemedText style={styles.transactionNote}>
                        {txn.note || category?.name || 'Expense'}
                      </ThemedText>
                      <ThemedText style={styles.transactionCategory}>
                        {category?.name || 'Uncategorized'}
                      </ThemedText>
                      <ThemedText style={styles.transactionDate}>
                        {formatDate(txn.timestamp)}
                      </ThemedText>
                    </View>

                    <View style={styles.transactionRight}>
                      <ThemedText style={styles.transactionAmount}>
                        -Rs {txn.amount.toFixed(0)}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(txn.id)}
                    >
                      <ThemedText style={styles.deleteButtonText}>🗑️ Delete</ThemedText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },

  // Transactions List
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
  },
  transactionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
