'use client';

import { useState } from 'react';
import { Upload, FileText, TrendingUp, Download, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { BankStatement, TaxAnalysisResult, TaxClassification } from '@/lib/types';
import { parseCSV, parseExcel, parsePDF, generateSampleStatement } from '@/lib/parsers';
import { analyzeTransactionsWithAI, classifyTransactionsBatch } from '@/lib/ai-analyzer';
import ResultsView from '@/components/ResultsView';
import ApiKeyModal from '@/components/ApiKeyModal';

export default function Home() {
  const [statement, setStatement] = useState<BankStatement | null>(null);
  const [analysis, setAnalysis] = useState<TaxAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      let parsedStatement: BankStatement;

      if (file.name.endsWith('.csv')) {
        parsedStatement = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedStatement = await parseExcel(file);
      } else if (file.name.endsWith('.pdf')) {
        parsedStatement = await parsePDF(file);
      } else {
        throw new Error('Unsupported file format. Please upload CSV, Excel, or PDF.');
      }

      setStatement(parsedStatement);
      
      // Auto-analyze with rule-based approach
      await analyzeStatement(parsedStatement, false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const demoStatement = generateSampleStatement();
      setStatement(demoStatement);
      await analyzeStatement(demoStatement, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load demo');
    } finally {
      setLoading(false);
    }
  };

  const analyzeStatement = async (stmt: BankStatement, withAI: boolean, apiKey?: string) => {
    setLoading(true);
    setError(null);

    try {
      let classifications: TaxClassification[];

      if (withAI && apiKey) {
        const aiResponse = await analyzeTransactionsWithAI(stmt.transactions, apiKey, 'openai');
        classifications = aiResponse.classifications;
      } else {
        classifications = classifyTransactionsBatch(stmt.transactions);
      }

      // Calculate totals
      const totalTaxableIncome = classifications
        .filter(c => c.category === 'taxable')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalExemptIncome = classifications
        .filter(c => c.category === 'exempt')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalDeductibleAmount = classifications
        .filter(c => c.category === 'deductible')
        .reduce((sum, c) => sum + c.amount, 0);

      const totalUncertainAmount = classifications
        .filter(c => c.category === 'uncertain')
        .reduce((sum, c) => sum + c.amount, 0);

      // Create breakdowns
      const taxableBreakdown: { [key: string]: number } = {};
      const exemptBreakdown: { [key: string]: number } = {};
      const deductibleBreakdown: { [key: string]: number } = {};

      classifications.forEach(c => {
        const txn = stmt.transactions.find((t: any) => t.id === c.transactionId);
        if (!txn) return;

        const key = txn.description.substring(0, 30);
        
        if (c.category === 'taxable') {
          taxableBreakdown[key] = (taxableBreakdown[key] || 0) + c.amount;
        } else if (c.category === 'exempt') {
          exemptBreakdown[key] = (exemptBreakdown[key] || 0) + c.amount;
        } else if (c.category === 'deductible') {
          deductibleBreakdown[key] = (deductibleBreakdown[key] || 0) + c.amount;
        }
      });

      const result: TaxAnalysisResult = {
        totalTaxableIncome,
        totalExemptIncome,
        totalDeductibleAmount,
        totalUncertainAmount,
        classifications,
        summary: {
          taxableBreakdown,
          exemptBreakdown,
          deductibleBreakdown
        },
        period: {
          startDate: stmt.statementPeriod?.start || '',
          endDate: stmt.statementPeriod?.end || ''
        },
        generatedAt: new Date().toISOString()
      };

      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = () => {
    setShowApiModal(true);
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    if (!statement) return;
    setShowApiModal(false);
    await analyzeStatement(statement, true, apiKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nigeria 2026 Tax AI
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Intelligent bank statement analysis for tax compliance
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>NRS e-filing ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!statement && !analysis && (
          <div className="text-center">
            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Upload Your Bank Statement
                </h2>
                <p className="text-gray-600 mb-6">
                  Support for PDF, CSV, and Excel formats
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium">
                    <Upload className="w-5 h-5" />
                    Choose File
                  </span>
                </label>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Or try it out:</p>
                  <button
                    onClick={handleDemoMode}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Load Demo Statement
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Intelligent classification using Nigeria Tax Reform Law 2026
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <FileText className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">NRS Ready</h3>
                  <p className="text-sm text-gray-600">
                    Export formats compatible with NRS e-filing system
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Visual Insights</h3>
                  <p className="text-sm text-gray-600">
                    Charts and trends for easy understanding
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
            <p className="mt-4 text-gray-600">Processing your statement...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {statement && analysis && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {statement.fileName} • {statement.transactions.length} transactions
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAIAnalysis}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  Enhance with AI
                </button>
                <button
                  onClick={() => {
                    setStatement(null);
                    setAnalysis(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            </div>

            <ResultsView analysis={analysis} statement={statement} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Built with Nigeria Tax Reform Law 2026 • NRS e-filing compatible
            </p>
            <p className="text-xs text-gray-500">
              This tool provides guidance only. Consult a tax professional for official advice.
            </p>
          </div>
        </div>
      </footer>

      {showApiModal && (
        <ApiKeyModal
          onClose={() => setShowApiModal(false)}
          onSubmit={handleApiKeySubmit}
        />
      )}
    </div>
  );
}

