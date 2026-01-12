/**
 * Bank statement parsers for PDF, CSV, and Excel formats
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Transaction, BankStatement } from './types';

/**
 * Parse CSV bank statement
 */
export async function parseCSV(file: File): Promise<BankStatement> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        try {
          const transactions = normalizeTransactions(results.data as any[]);
          resolve({
            fileName: file.name,
            fileType: 'csv',
            transactions,
            statementPeriod: getStatementPeriod(transactions)
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => reject(error)
    });
  });
}

/**
 * Parse Excel bank statement
 */
export async function parseExcel(file: File): Promise<BankStatement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        const transactions = normalizeTransactions(jsonData as any[]);
        resolve({
          fileName: file.name,
          fileType: 'excel',
          transactions,
          statementPeriod: getStatementPeriod(transactions)
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse PDF bank statement (basic text extraction)
 * Note: For production, you'd use OCR or AI vision for complex PDFs
 */
export async function parsePDF(file: File): Promise<BankStatement> {
  // For MVP, we'll use a simple approach
  // In production, integrate with pdf-parse or AI vision API
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // Simple pattern matching for common bank statement formats
        // This is a placeholder - real implementation would use pdf-parse library
        const transactions = extractTransactionsFromText(text);
        
        resolve({
          fileName: file.name,
          fileType: 'pdf',
          transactions,
          statementPeriod: getStatementPeriod(transactions)
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsText(file);
  });
}

/**
 * Normalize transaction data from various formats
 */
function normalizeTransactions(rawData: any[]): Transaction[] {
  return rawData.map((row, index) => {
    // Try to detect common column names
    const date = findValue(row, ['date', 'transaction date', 'trans date', 'value date', 'posting date']);
    const description = findValue(row, ['description', 'narration', 'details', 'transaction details', 'remarks']);
    const debit = parseAmount(findValue(row, ['debit', 'withdrawal', 'debit amount', 'dr']));
    const credit = parseAmount(findValue(row, ['credit', 'deposit', 'credit amount', 'cr']));
    const balance = parseAmount(findValue(row, ['balance', 'running balance', 'account balance']));
    const reference = findValue(row, ['reference', 'ref', 'transaction ref', 'ref no']);
    
    // Determine transaction type and amount
    let type: Transaction['type'];
    let amount: number;
    
    if (credit > 0) {
      type = 'deposit';
      amount = credit;
    } else if (debit > 0) {
      // Try to determine if it's a transfer, fee, or withdrawal
      const desc = description?.toLowerCase() || '';
      if (desc.includes('transfer') || desc.includes('trf')) {
        type = 'transfer';
      } else if (desc.includes('fee') || desc.includes('charge') || desc.includes('commission')) {
        type = 'fee';
      } else {
        type = 'withdrawal';
      }
      amount = debit;
    } else {
      type = 'withdrawal';
      amount = 0;
    }
    
    return {
      id: `txn-${index + 1}`,
      date: normalizeDate(date),
      description: description || 'Unknown transaction',
      amount,
      type,
      balance,
      reference
    };
  }).filter(txn => txn.amount > 0); // Filter out zero-amount transactions
}

/**
 * Find value from object with various possible key names
 */
function findValue(obj: any, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    // Case-insensitive search
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey && obj[foundKey]) {
      return obj[foundKey];
    }
  }
  return null;
}

/**
 * Parse amount string to number
 */
function parseAmount(value: any): number {
  if (typeof value === 'number') return Math.abs(value);
  if (!value) return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = String(value).replace(/[₦$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : Math.abs(parsed);
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(dateValue: any): string {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  try {
    // Handle various date formats
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract transactions from plain text (for PDF)
 */
function extractTransactionsFromText(text: string): Transaction[] {
  // This is a simplified implementation
  // In production, use pdf-parse library or AI vision
  const lines = text.split('\n');
  const transactions: Transaction[] = [];
  
  // Pattern for common transaction line: DATE DESCRIPTION DEBIT CREDIT BALANCE
  const pattern = /(\d{2}[-/]\d{2}[-/]\d{4})\s+(.+?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/;
  
  lines.forEach((line, index) => {
    const match = line.match(pattern);
    if (match) {
      const [, date, description, debit, credit, balance] = match;
      const debitAmount = parseAmount(debit);
      const creditAmount = parseAmount(credit);
      
      if (creditAmount > 0 || debitAmount > 0) {
        transactions.push({
          id: `txn-${index + 1}`,
          date: normalizeDate(date),
          description: description.trim(),
          amount: creditAmount > 0 ? creditAmount : debitAmount,
          type: creditAmount > 0 ? 'deposit' : 'withdrawal',
          balance: parseAmount(balance)
        });
      }
    }
  });
  
  return transactions;
}

/**
 * Get statement period from transactions
 */
function getStatementPeriod(transactions: Transaction[]): { start: string; end: string } | undefined {
  if (transactions.length === 0) return undefined;
  
  const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
  
  return {
    start: dates[0].toISOString().split('T')[0],
    end: dates[dates.length - 1].toISOString().split('T')[0]
  };
}

/**
 * Generate sample bank statement for demo mode
 */
export function generateSampleStatement(): BankStatement {
  const today = new Date();
  const transactions: Transaction[] = [
    {
      id: 'demo-1',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 5).toISOString().split('T')[0],
      description: 'SALARY - ACME CORPORATION LTD',
      amount: 450000,
      type: 'deposit'
    },
    {
      id: 'demo-2',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 7).toISOString().split('T')[0],
      description: 'PENSION CONTRIBUTION - RSA',
      amount: 36000,
      type: 'withdrawal'
    },
    {
      id: 'demo-3',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 10).toISOString().split('T')[0],
      description: 'FREELANCE CONSULTING - XYZ LTD',
      amount: 150000,
      type: 'deposit'
    },
    {
      id: 'demo-4',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 12).toISOString().split('T')[0],
      description: 'RENT PAYMENT',
      amount: 120000,
      type: 'withdrawal'
    },
    {
      id: 'demo-5',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString().split('T')[0],
      description: 'GIFT FROM FAMILY',
      amount: 50000,
      type: 'deposit'
    },
    {
      id: 'demo-6',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 18).toISOString().split('T')[0],
      description: 'BANK INTEREST',
      amount: 2500,
      type: 'deposit'
    },
    {
      id: 'demo-7',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 20).toISOString().split('T')[0],
      description: 'LIFE INSURANCE PREMIUM',
      amount: 15000,
      type: 'withdrawal'
    },
    {
      id: 'demo-8',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 22).toISOString().split('T')[0],
      description: 'UPWORK PAYMENT - DIGITAL SERVICES',
      amount: 85000,
      type: 'deposit'
    },
    {
      id: 'demo-9',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 25).toISOString().split('T')[0],
      description: 'SCHOOL FEES - UNIVERSITY',
      amount: 200000,
      type: 'withdrawal'
    },
    {
      id: 'demo-10',
      date: new Date(today.getFullYear(), today.getMonth() - 2, 28).toISOString().split('T')[0],
      description: 'LOAN DISBURSEMENT - BANK',
      amount: 500000,
      type: 'deposit'
    },
    {
      id: 'demo-11',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 5).toISOString().split('T')[0],
      description: 'SALARY - ACME CORPORATION LTD',
      amount: 450000,
      type: 'deposit'
    },
    {
      id: 'demo-12',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 8).toISOString().split('T')[0],
      description: 'DIVIDEND - STOCK INVESTMENT',
      amount: 25000,
      type: 'deposit'
    },
    {
      id: 'demo-13',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 12).toISOString().split('T')[0],
      description: 'MORTGAGE INTEREST PAYMENT',
      amount: 45000,
      type: 'withdrawal'
    },
    {
      id: 'demo-14',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().split('T')[0],
      description: 'YOUTUBE AD REVENUE',
      amount: 32000,
      type: 'deposit'
    },
    {
      id: 'demo-15',
      date: new Date(today.getFullYear(), today.getMonth() - 1, 20).toISOString().split('T')[0],
      description: 'TRANSFER TO SAVINGS ACCOUNT',
      amount: 100000,
      type: 'transfer'
    }
  ];
  
  return {
    fileName: 'sample-statement.csv',
    fileType: 'csv',
    transactions,
    accountNumber: '0123456789',
    accountName: 'DEMO USER',
    bankName: 'SAMPLE BANK',
    statementPeriod: getStatementPeriod(transactions)
  };
}
