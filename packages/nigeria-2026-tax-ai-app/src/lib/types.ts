/**
 * Core type definitions for the Tax AI App
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee';
  balance?: number;
  reference?: string;
}

export interface TaxClassification {
  transactionId: string;
  category: 'taxable' | 'exempt' | 'deductible' | 'uncertain';
  taxType?: 'income' | 'vat' | 'corporate' | 'capital_gains';
  amount: number;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  applicableRules: string[];
  suggestedAction?: string;
}

export interface TaxAnalysisResult {
  totalTaxableIncome: number;
  totalExemptIncome: number;
  totalDeductibleAmount: number;
  totalUncertainAmount: number;
  classifications: TaxClassification[];
  summary: {
    taxableBreakdown: { [key: string]: number };
    exemptBreakdown: { [key: string]: number };
    deductibleBreakdown: { [key: string]: number };
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface BankStatement {
  fileName: string;
  fileType: 'pdf' | 'csv' | 'excel';
  transactions: Transaction[];
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  statementPeriod?: {
    start: string;
    end: string;
  };
}

export interface AIAnalysisRequest {
  transactions: Transaction[];
  taxLawContext: string;
  additionalContext?: string;
}

export interface AIAnalysisResponse {
  classifications: TaxClassification[];
  summary: string;
  warnings: string[];
}

