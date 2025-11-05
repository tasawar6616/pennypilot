import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';


// ADD these imports at the top with your others
// ADD these imports at the top with your others

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCachedTransactions, useCachedCategories, useDeleteTransaction } from '@/hooks/use-cached-data';

export default function TransactionsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Use cached data with React Query
  const { data: transactions = [], isLoading: transactionsLoading } = useCachedTransactions(100);
  const { data: categories = [], isLoading: categoriesLoading } = useCachedCategories();
  const deleteTransactionMutation = useDeleteTransaction();

  const loading = transactionsLoading || categoriesLoading;



  type CsvRow = { id: string; date: string; description: string; amount: number; category: string };

const esc = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows: CsvRow[]) =>
  '\uFEFF' + ['id,date,description,amount,category', ...rows.map(r =>
    [r.id, r.date, r.description, r.amount, r.category].map(esc).join(',')
  )].join('\n');


const onExportCsv = async () => {
  try {
    if (!transactions.length) {
      Alert.alert('Nothing to export', 'No transactions found.');
      return;
    }

    // Map your TransactionRow -> flat CSV rows safely (handles different date shapes)
    const rows: CsvRow[] = transactions.map((t) => {
      // Try to figure out the date field
      const anyT: any = t as any;
      const dateSrc = anyT.date ?? anyT.createdAt ?? anyT.timestamp;
      let ms: number | undefined;
      if (typeof dateSrc === 'number') ms = dateSrc;
      else if (typeof dateSrc === 'string') { const d = Date.parse(dateSrc); if (!isNaN(d)) ms = d; }
      else if (dateSrc?.seconds) ms = dateSrc.seconds * 1000; // Firestore Timestamp

      const dateISO = ms ? new Date(ms).toISOString() : '';
      const cat = getCategoryById(anyT.categoryId ?? anyT.category)?.name ?? '';
      const desc = anyT.note ?? anyT.description ?? '';

      return {
        id: String(t.id),
        date: dateISO,
        description: String(desc),
        amount: Number(t.amount ?? 0),
        category: cat,
      };
    });

    const csv = toCsv(rows);
    const fileName = `transactions-${new Date().toISOString().slice(0,10)}.csv`;
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csv);

    // Share/save
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export transactions CSV',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('CSV saved', `Saved to: ${fileUri}`);
    }
  } catch (e: any) {
    Alert.alert('Export failed', e?.message ?? String(e));
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
              await deleteTransactionMutation.mutateAsync(id);
              Alert.alert('Success', 'Transaction deleted successfully');
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

        <View style={styles.header}>
          <Pressable
            onPress={onExportCsv}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              backgroundColor: '#2563eb',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            })}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Export CSV</ThemedText>
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
