import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import {
  getSettings,
  saveSettings,
  SettingsData,
  getCategories,
  Category,
  saveCategoryBudget,
  getCategoryBudgets,
  CategoryBudget,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [reminderTime, setReminderTime] = useState('02:00');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const settings = await getSettings(user.uid);
      if (settings) {
        setMonthlyIncome(settings.monthlyIncome?.toString() || '');
        setMonthlyBudget(settings.monthlyBudget?.toString() || '');
        setReminderTime(settings.reminderTime || '02:00');
      }

      // Load categories
      const cats = await getCategories(user.uid);
      setCategories(cats);

      // Load category budgets for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const budgets = await getCategoryBudgets(user.uid, currentMonth);

      const budgetMap: { [key: string]: string } = {};
      budgets.forEach((b) => {
        budgetMap[b.categoryId] = b.amount.toString();
      });
      setCategoryBudgets(budgetMap);
    } catch (err) {
      console.error('Error loading settings', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryBudget = (categoryId: string, value: string) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [categoryId]: value,
    });
  };

  const handleSave = async () => {
    if (!user) return;

    const income = parseFloat(monthlyIncome);
    const budget = parseFloat(monthlyBudget);

    if (monthlyIncome && (isNaN(income) || income <= 0)) {
      Alert.alert('Invalid Income', 'Please enter a valid monthly income');
      return;
    }

    if (monthlyBudget && (isNaN(budget) || budget <= 0)) {
      Alert.alert('Invalid Budget', 'Please enter a valid monthly budget');
      return;
    }

    setSaving(true);
    try {
      // Save general settings
      await saveSettings(user.uid, {
        monthlyIncome: income || 0,
        monthlyBudget: budget || 0,
        reminderTime,
      });

      // Save category budgets
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      for (const [categoryId, budgetValue] of Object.entries(categoryBudgets)) {
        if (budgetValue && budgetValue.trim() !== '') {
          const amount = parseFloat(budgetValue);
          if (!isNaN(amount) && amount > 0) {
            await saveCategoryBudget(user.uid, categoryId, amount, currentMonth);
          }
        }
      }

      Alert.alert('Success', 'Settings and budgets saved successfully!');
    } catch (err) {
      console.error('Error saving settings', err);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
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
            } catch (err) {
              console.error('Error logging out', err);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
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
          <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
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
          <ThemedText style={styles.title}>Settings</ThemedText>
          <ThemedText style={styles.subtitle}>Configure your budget & preferences</ThemedText>
        </View>

        {/* Income & Budget Card */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>💰 Financial Setup</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Monthly Income</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your monthly income"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
            />
            <ThemedText style={styles.helperText}>
              Your total monthly income in PKR
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Monthly Budget</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your monthly budget"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
            />
            <ThemedText style={styles.helperText}>
              Maximum amount you plan to spend per month
            </ThemedText>
          </View>
        </View>

        {/* Reminder Settings Card */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>⏰ Reminders</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Daily Reminder Time</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (24-hour format)"
              placeholderTextColor="#9CA3AF"
              value={reminderTime}
              onChangeText={setReminderTime}
            />
            <ThemedText style={styles.helperText}>
              Get reminded to log your expenses (default: 02:00)
            </ThemedText>
          </View>
        </View>

        {/* Category Budgets */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>📊 Category Budgets</ThemedText>
          <ThemedText style={styles.helperText} style={{ marginBottom: 16 }}>
            Set monthly budget limits for each category
          </ThemedText>

          {categories.map((category) => (
            <View key={category.id} style={styles.categoryBudgetItem}>
              <View style={styles.categoryBudgetLeft}>
                <View
                  style={[
                    styles.categoryBudgetIcon,
                    { backgroundColor: category.color + '30' },
                  ]}
                >
                  <ThemedText style={styles.categoryBudgetEmoji}>{category.icon}</ThemedText>
                </View>
                <ThemedText style={styles.categoryBudgetName}>{category.name}</ThemedText>
              </View>
              <TextInput
                style={styles.categoryBudgetInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={categoryBudgets[category.id] || ''}
                onChangeText={(value) => updateCategoryBudget(category.id, value)}
              />
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <ThemedText style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Settings'}
            </ThemedText>
          </LinearGradient>
        </Pressable>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutButtonGradient}
          >
            <ThemedText style={styles.logoutButtonText}>🚪 Logout</ThemedText>
          </LinearGradient>
        </Pressable>

        {/* App Info */}
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoText}>PennyPilot v1.0.0</ThemedText>
          <ThemedText style={styles.infoText}>Track smart · Stay on budget</ThemedText>
          {user && (
            <ThemedText style={styles.infoText}>
              Logged in as: {user.email}
            </ThemedText>
          )}
        </View>

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

  // Cards
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },

  // Category Budgets
  categoryBudgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBudgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryBudgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBudgetEmoji: {
    fontSize: 20,
  },
  categoryBudgetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  categoryBudgetInput: {
    width: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'right',
  },

  // Save Button
  saveButton: {
    marginVertical: 8,
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

  // Logout Button
  logoutButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Info Card
  infoCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginVertical: 2,
  },
});
