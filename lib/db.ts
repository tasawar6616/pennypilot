import * as SQLite from 'expo-sqlite';

// expo-sqlite typings can vary; use `any` here to keep the helper tolerant.
const db = (SQLite as any).openDatabase('pennypilot.db');

function executeSql<T = any>(sql: string, params: Array<any> = []): Promise<T> {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        sql,
        params,
        (_tx: any, result: any) => resolve(result as unknown as T),
        (_tx: any, err: any) => {
          reject(err);
          return false;
        }
      );
    });
  });
}

export async function initDB() {
  // create transactions table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL,
      currency TEXT,
      timestamp INTEGER,
      account_id TEXT,
      category_id TEXT,
      note TEXT,
      receipt_uri TEXT,
      tags_csv TEXT,
      is_recurring INTEGER,
      recurring_rule_id TEXT
    );
  `);
}

export type TransactionRow = {
  id: string;
  amount: number;
  currency: string;
  timestamp: number;
  account_id?: string | null;
  category_id?: string | null;
  note?: string | null;
};

export async function addTransaction(payload: {
  amount: number;
  currency?: string;
  timestamp?: number;
  note?: string;
}) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const amount = payload.amount ?? 0;
  const currency = payload.currency ?? 'INR';
  const timestamp = payload.timestamp ?? Date.now();

  await executeSql(
    `INSERT INTO transactions (id, amount, currency, timestamp, note) VALUES (?, ?, ?, ?, ?);`,
    [id, amount, currency, timestamp, payload.note ?? null]
  );

  return { id, amount, currency, timestamp } as TransactionRow;
}

export async function getRecentTransactions(limit = 5) {
  const res = await executeSql<any>(`SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?;`, [limit]);
  const rows = res.rows as any;
  const items: TransactionRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows.item(i);
    items.push({
      id: r.id,
      amount: r.amount,
      currency: r.currency,
      timestamp: r.timestamp,
      account_id: r.account_id,
      category_id: r.category_id,
      note: r.note,
    });
  }
  return items;
}
