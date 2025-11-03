import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import {
  getRecentTransactionsFirestore,
  getCategories,
  getSettings,
  getCategoryBudgets,
  TransactionRow,
  Category,
  SettingsData,
  CategoryBudget,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

type TimeRange = 'month' | 'week' | 'day';

export default function ReportsScreen() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const txns = await getRecentTransactionsFirestore(user.uid, 100); // Get more for reports
      const cats = await getCategories(user.uid);
      const userSettings = await getSettings(user.uid);

      // Load category budgets for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budgets = await getCategoryBudgets(user.uid, currentMonth);

      setTransactions(txns);
      setCategories(cats);
      setSettings(userSettings);
      setCategoryBudgets(budgets);
    } catch (err) {
      console.error('Error loading reports data', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by time range
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter((t) => {
      if (!t.timestamp) return false;
      const txDate = new Date(t.timestamp);

      switch (timeRange) {
        case 'day':
          return (
            txDate.getDate() === now.getDate() &&
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        case 'month':
          return (
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate category spending
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};

    filteredTransactions.forEach((t) => {
      const catId = t.categoryId || 'uncategorized';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([catId, amount]) => {
        const category = categories.find((c) => c.id === catId);
        return {
          name: category?.name || 'Other',
          amount,
          color: category?.color || '#95A5A6',
          icon: category?.icon || '📦',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryData = getCategoryData();
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyBudget = settings?.monthlyBudget || 50000;
  const budgetUsedPercent = Math.round((totalSpent / monthlyBudget) * 100);

  // Prepare pie chart data
  const pieData = categoryData.slice(0, 5).map((cat) => ({
    name: cat.name,
    population: cat.amount,
    color: cat.color,
    legendFontColor: '#FFFFFF',
    legendFontSize: 14,
  }));

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
          <ThemedText style={styles.loadingText}>Loading reports...</ThemedText>
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
          <ThemedText style={styles.title}>Reports</ThemedText>
          <ThemedText style={styles.subtitle}>Track your spending patterns</ThemedText>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
            <Pressable
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <ThemedText
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Total Spent</ThemedText>
              <ThemedText style={styles.summaryValue}>Rs {totalSpent.toLocaleString('en-PK')}</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Transactions</ThemedText>
              <ThemedText style={styles.summaryValue}>{filteredTransactions.length}</ThemedText>
            </View>
          </View>

          {/* Budget Progress */}
          <View style={styles.budgetProgress}>
            <View style={styles.budgetHeader}>
              <ThemedText style={styles.budgetLabel}>Budget Used</ThemedText>
              <ThemedText style={styles.budgetPercent}>{budgetUsedPercent}%</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(budgetUsedPercent, 100)}%`,
                    backgroundColor: budgetUsedPercent > 100 ? '#EF4444' : '#10B981',
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.budgetSubtext}>
              Rs {(monthlyBudget - totalSpent).toLocaleString('en-PK')} remaining
            </ThemedText>
          </View>
        </View>

        {/* Pie Chart */}
        {filteredTransactions.length > 0 && pieData.length > 0 ? (
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>Spending by Category</ThemedText>
            <View style={styles.chartCard}>
              <PieChart
                data={pieData}
                width={width - 80}
                height={220}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
                hasLegend={true}
              />
            </View>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>Spending by Category</ThemedText>
            <View style={styles.infoCard}>
              <ThemedText style={styles.infoText}>
                Add more transactions with categories to see the pie chart
              </ThemedText>
            </View>
          </View>
        ) : null}

        {/* Category Breakdown with Budgets */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Categories & Budgets</ThemedText>
          <View style={styles.categoryList}>
            {categoryData.slice(0, 8).map((cat, index) => {
              const percent = totalSpent > 0 ? Math.round((cat.amount / totalSpent) * 100) : 0;

              // Find budget for this category
              const categoryObj = categories.find(c => c.name === cat.name);
              const budget = categoryBudgets.find(b => b.categoryId === categoryObj?.id);
              const budgetAmount = budget?.amount || 0;
              const budgetUsed = budgetAmount > 0 ? Math.round((cat.amount / budgetAmount) * 100) : 0;

              return (
                <View key={index} style={styles.categoryCard}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIconSmall, { backgroundColor: cat.color + '30' }]}>
                        <ThemedText style={styles.categoryIconText}>{cat.icon}</ThemedText>
                      </View>
                      <View style={styles.categoryInfo}>
                        <ThemedText style={styles.categoryNameText}>{cat.name}</ThemedText>
                        <ThemedText style={styles.categoryPercent}>{percent}% of total</ThemedText>
                      </View>
                    </View>
                    <View style={styles.categoryAmountContainer}>
                      <ThemedText style={styles.categoryAmount}>
                        Rs {cat.amount.toLocaleString('en-PK')}
                      </ThemedText>
                      {budgetAmount > 0 && (
                        <ThemedText style={styles.categoryBudgetText}>
                          of Rs {budgetAmount.toLocaleString('en-PK')}
                        </ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Budget Progress Bar */}
                  {budgetAmount > 0 && (
                    <View style={styles.categoryBudgetProgress}>
                      <View style={styles.categoryProgressBar}>
                        <View
                          style={[
                            styles.categoryProgressFill,
                            {
                              width: `${Math.min(budgetUsed, 100)}%`,
                              backgroundColor: budgetUsed > 100 ? '#EF4444' : budgetUsed > 80 ? '#F59E0B' : '#10B981',
                            },
                          ]}
                        />
                      </View>
                      <ThemedText style={[
                        styles.categoryBudgetPercent,
                        { color: budgetUsed > 100 ? '#EF4444' : budgetUsed > 80 ? '#F59E0B' : '#10B981' }
                      ]}>
                        {budgetUsed}%
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>📊</ThemedText>
            <ThemedText style={styles.emptyText}>No transactions found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add some expenses to see your reports
            </ThemedText>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Time Range Selector
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  timeRangeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  timeRangeText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeRangeTextActive: {
    color: '#667eea',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  // Budget Progress
  budgetProgress: {
    marginTop: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  budgetPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  budgetSubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Chart Section
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },

  // Category List
  section: {
    marginBottom: 20,
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryPercent: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  categoryBudgetText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Category Budget Progress
  categoryBudgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryBudgetPercent: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
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
  },

  // Info Card
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});
