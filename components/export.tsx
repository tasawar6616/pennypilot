// ExportCsvButton.tsx
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text } from 'react-native';

type Txn = {
  id: string;
  date: string;         // ISO string or any
  description: string;
  amount: number;       // positive or negative
  category: string;
};

// TODO: replace with your real records
async function getTransactions(): Promise<Txn[]> {
  // Example random data (10 rows). Swap this with your DB fetch.
  const now = new Date();
  const rows: Txn[] = Array.from({ length: 10 }).map((_, i) => {
    const dt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const amt = Number((Math.random() * 200 - 100).toFixed(2)); // -100..100
    return {
      id: cryptoRandomId(),
      date: dt.toISOString(),
      description: `Sample item #${i + 1}`,
      amount: amt,
      category: amt >= 0 ? 'Income' : 'Expense',
    };
  });
  return rows;
}

function cryptoRandomId() {
  // Small random id (works in RN/JS). Use a stronger lib if needed.
  return Math.random().toString(36).slice(2, 10);
}

function toCsv(rows: Txn[]): string {
  // CSV headers
  const headers = ['id', 'date', 'description', 'amount', 'category'];
  // Escape fields (quote if contains comma/quote/newline; double any quotes)
  const esc = (val: unknown) => {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows.map(r =>
    [r.id, r.date, r.description, r.amount, r.category].map(esc).join(',')
  );
  // Add UTF-8 BOM so Excel opens it nicely
  const bom = '\uFEFF';
  return bom + [headers.join(','), ...body].join('\n');
}

export default function ExportCsvButton() {
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    try {
      setBusy(true);

      // 1) Get your data (replace with real fetch)
      const txns = await getTransactions();
      if (!txns.length) {
        Alert.alert('Nothing to export', 'No transactions found.');
        return;
      }

      // 2) Make CSV
      const csv = toCsv(txns);

      // 3) Write file to cache dir
      const fileName = `transactions-${new Date().toISOString().slice(0,10)}.csv`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 4) Share/save
      if (Platform.OS === 'web') {
        // On web, Sharing is not supported; fall back to browser download
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = fileName;
        a.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('Sharing not available', `File saved: ${fileUri}`);
          return;
        }
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export transactions CSV',
          UTI: 'public.comma-separated-values-text', // iOS hint
        });
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={onExport}
      disabled={busy}
      style={({ pressed }) => ({
        opacity: busy ? 0.6 : pressed ? 0.7 : 1,
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
      })}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>
        {busy ? 'Exporting…' : 'Export CSV'}
      </Text>
    </Pressable>
  );
}
