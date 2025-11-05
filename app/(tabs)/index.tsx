import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { initializeDefaultCategories, initializeDefaultPaymentMethods } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedTransactions, useCachedCategories, useCachedSettings, useInvalidateCache } from '@/hooks/use-cached-data';
import { queryClient } from '@/lib/query-client';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isFocused = useIsFocused();
  const { user, logout } = useAuth();

  // Use cached data with React Query
  const { data: recent = [], isLoading: transactionsLoading } = useCachedTransactions(5);
  const { data: categories = [], isLoading: categoriesLoading } = useCachedCategories();
  const { data: settings = null, isLoading: settingsLoading } = useCachedSettings();

  // Initialize defaults for new users
  useEffect(() => {
    (async () => {
      if (user) {
        try {
          await initializeDefaultCategories(user.uid);
          await initializeDefaultPaymentMethods(user.uid);
        } catch (err) {
          console.warn('Firestore init failed', err);
        }
      }
    })();
  }, [user]);

  const getCategoryById = (id: string | null | undefined) => {
    if (!id) return null;
    return categories.find(c => c.id === id);
  };

  // Calculate actual data from transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = recent.filter(t =>
    t.timestamp && new Date(t.timestamp).setHours(0, 0, 0, 0) === today.getTime()
  );
  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const todayItemCount = todayTransactions.length;

  // Get from settings or use defaults
  const monthlyBudget = settings?.monthlyBudget || 50000; // PKR
  const monthlyIncome = settings?.monthlyIncome || 0;

  // Calculate this month's spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpent = recent
    .filter(t => {
      if (!t.timestamp) return false;
      const txDate = new Date(t.timestamp);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Use actual categories from Firestore
  const quickCategories = categories.slice(0, 4);

  const handleRefreshData = async () => {
    try {
      // Clear all cache
      queryClient.clear();
      Alert.alert('Success', 'Cache cleared! Data will refresh automatically.');
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Refresh failed:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setShowProfileMenu(false);
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Modern Gradient Background */}
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
            <ThemedText style={styles.greeting}>Hello there!</ThemedText>
            <ThemedText style={styles.appTitle}>PennyPilot</ThemedText>
          </View>
          <Pressable style={styles.avatarButton} onPress={() => setShowProfileMenu(true)}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>P</ThemedText>
            </View>
          </Pressable>
        </View>

        {/* Balance Card - Modern Minimalist */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <ThemedText style={styles.balanceLabel}>Today's Spending</ThemedText>
            <View style={styles.dateBadge}>
              <ThemedText style={styles.dateText}>
                {new Date().toLocaleDateString('en-IN')}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.balanceAmount}>Rs {todayTotal.toLocaleString('en-PK')}</ThemedText>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>{todayItemCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Transactions</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>
                Rs {Math.round((monthlyBudget - monthlySpent) / 30)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Daily Budget</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>
                {Math.round((monthlySpent / monthlyBudget) * 100)}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Used</ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <Link href="/add-transaction" asChild style={styles.actionButtonFlex}>
            <Pressable style={styles.addButton}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <ThemedText style={styles.addButtonText}>+ Add Transaction</ThemedText>
              </LinearGradient>
            </Pressable>
          </Link>

          <Link href="/reports" asChild style={styles.actionButtonFlex}>
            <Pressable style={styles.reportsButton}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reportsButtonGradient}
              >
                <ThemedText style={styles.reportsButtonText}>📊 Reports</ThemedText>
              </LinearGradient>
            </Pressable>
          </Link>
        </View>

        {/* Quick Categories - Clean Grid */}
        {quickCategories.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Quick Add</ThemedText>
            <View style={styles.categoriesGrid}>
              {quickCategories.map((category) => (
                <Link key={category.id} href="/add-transaction" asChild>
                  <Pressable style={styles.categoryItem}>
                    <View style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}>
                      <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                    </View>
                    <ThemedText style={styles.categoryLabel}>{category.name}</ThemedText>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions - Modern List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            <Link href="/transactions">
              <ThemedText style={styles.seeAllLink}>View All →</ThemedText>
            </Link>
          </View>

          <View style={styles.transactionsList}>
            {recent.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <ThemedText style={styles.emptyIconText}>📊</ThemedText>
                </View>
                <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Start tracking your expenses today
                </ThemedText>
              </View>
            ) : (
              recent.map((r) => {
                const category = getCategoryById(r.categoryId);
                return (
                  <View key={r.id} style={styles.transactionItem}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: category?.color ? category.color + '20' : '#F3F4F6' }
                    ]}>
                      <ThemedText style={styles.transactionEmoji}>
                        {category?.icon || '💰'}
                      </ThemedText>
                    </View>
                    <View style={styles.transactionDetails}>
                      <ThemedText style={styles.transactionNote}>
                        {r.note || category?.name || 'Expense'}
                      </ThemedText>
                      <ThemedText style={styles.transactionDate}>
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'No time'}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.transactionAmount}>
                      -Rs {r.amount.toFixed(0)}
                    </ThemedText>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowProfileMenu(false)}>
          <View style={styles.profileMenuContainer}>
            <View style={styles.profileMenuHeader}>
              <View style={styles.profileMenuAvatar}>
                <ThemedText style={styles.profileMenuAvatarText}>P</ThemedText>
              </View>
              <View style={styles.profileMenuInfo}>
                <ThemedText style={styles.profileMenuName}>PennyPilot User</ThemedText>
                <ThemedText style={styles.profileMenuEmail}>{user?.email}</ThemedText>
              </View>
            </View>

            <View style={styles.profileMenuDivider} />

            <Pressable style={styles.menuItemRefresh} onPress={handleRefreshData}>
              <ThemedText style={styles.menuItemIcon}>🔄</ThemedText>
              <ThemedText style={styles.menuItemRefreshText}>Refresh Data</ThemedText>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <ThemedText style={styles.menuItemIcon}>🚪</ThemedText>
              <ThemedText style={styles.menuItemText}>Logout</ThemedText>
            </Pressable>

            <Pressable
              style={styles.menuCancelButton}
              onPress={() => setShowProfileMenu(false)}
            >
              <ThemedText style={styles.menuCancelText}>Cancel</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Balance Card
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButtonFlex: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  addButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportsButton: {
    flex: 1,
  },
  reportsButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportsButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Categories
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
  },
  categoryCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Transactions
  transactionsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Profile Menu Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  profileMenuContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileMenuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileMenuAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileMenuInfo: {
    flex: 1,
  },
  profileMenuName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileMenuEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  menuItemRefresh: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginBottom: 12,
  },
  menuItemRefreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    marginBottom: 12,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  menuCancelButton: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
  },
  menuCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
