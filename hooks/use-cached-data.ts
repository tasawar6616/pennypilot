import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getRecentTransactionsFirestore,
  getCategories,
  getSettings,
  getCategoryBudgets,
  addTransactionFirestore,
  TransactionRow,
} from '@/lib/firebase';

// Query keys for consistent caching
export const queryKeys = {
  transactions: (userId: string, limit?: number) => ['transactions', userId, limit],
  categories: (userId: string) => ['categories', userId],
  settings: (userId: string) => ['settings', userId],
  categoryBudgets: (userId: string, month: string) => ['categoryBudgets', userId, month],
};

/**
 * Hook to fetch transactions with caching
 * Automatically refetches when user or limit changes
 */
export function useCachedTransactions(limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.transactions(user?.uid || '', limit),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await getRecentTransactionsFirestore(user.uid, limit);
    },
    enabled: !!user?.uid, // Only run query if user is authenticated
    staleTime: 1000 * 60 * 1, // Consider data fresh for 1 minute
  });
}

/**
 * Hook to fetch categories with caching
 */
export function useCachedCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.categories(user?.uid || ''),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await getCategories(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // Categories don't change often, cache for 5 minutes
  });
}

/**
 * Hook to fetch settings with caching
 */
export function useCachedSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.settings(user?.uid || ''),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await getSettings(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 10, // Settings rarely change, cache for 10 minutes
  });
}

/**
 * Hook to fetch category budgets with caching
 */
export function useCachedCategoryBudgets(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.categoryBudgets(user?.uid || '', month),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await getCategoryBudgets(user.uid, month);
    },
    enabled: !!user?.uid && !!month,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to add a transaction with automatic cache invalidation
 */
export function useAddTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: any) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await addTransactionFirestore(user.uid, transaction);
    },
    onSuccess: () => {
      // Invalidate and refetch transactions after adding new one
      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: ['transactions', user.uid],
        });
        // Also invalidate settings in case budget was affected
        queryClient.invalidateQueries({
          queryKey: queryKeys.settings(user.uid),
        });
      }
    },
  });
}

/**
 * Hook to delete a transaction with automatic cache invalidation
 */
export function useDeleteTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      const { deleteTransaction } = await import('@/lib/firebase');
      return await deleteTransaction(user.uid, transactionId);
    },
    onSuccess: () => {
      // Invalidate all transaction queries after deletion
      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: ['transactions', user.uid],
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.settings(user.uid),
        });
        queryClient.invalidateQueries({
          queryKey: ['categoryBudgets', user.uid],
        });
      }
    },
  });
}

/**
 * Manual cache invalidation helpers
 */
export function useInvalidateCache() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return {
    invalidateTransactions: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: ['transactions', user.uid],
        });
      }
    },
    invalidateCategories: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories(user.uid),
        });
      }
    },
    invalidateSettings: () => {
      if (user?.uid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.settings(user.uid),
        });
      }
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}
