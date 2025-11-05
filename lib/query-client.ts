import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// Create a persister for offline caching
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000, // Only persist to storage once per second
});

// Create Query Client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)

      // Data is considered fresh for 2 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes

      // Retry failed requests 2 times
      retry: 2,

      // Don't refetch on window focus (for mobile apps)
      refetchOnWindowFocus: false,

      // Refetch when reconnecting
      refetchOnReconnect: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
