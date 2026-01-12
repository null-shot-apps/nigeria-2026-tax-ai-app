'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, TrendingUp, AlertCircle, CheckCircle, XCircle, HelpCircle, FileText } from 'lucide-react';
import type { TaxAnalysisResult, BankStatement } from '@/lib/types';

interface ResultsViewProps {
  analysis: TaxAnalysisResult;
  statement: BankStatement;
}

export default function ResultsView({ analysis, statement }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'export'>('summary');

  const pieData = [
    { name: 'Taxable Income', value: analysis.totalTaxableIncome, color: '#ef4444' },
    { name: 'Exempt Income', value: analysis.totalExemptIncome, color: '#22c55e' },
    { name: 'Deductible', value: analysis.totalDeductibleAmount, color: '#3b82f6' },
    { name: 'Uncertain', value: analysis.totalUncertainAmount, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Description', 'Amount', 'Category', 'Tax Type', 'Explanation', 'Confidence'];
    const rows = analysis.classifications.map((c: any) => {
      const txn = statement.transactions.find((t: any) => t.id === c.transactionId);
      return [
        c.transactionId,
        txn?.date || '',
        txn?.description || '',
        c.amount,
        c.category,
        c.taxType || '',
        c.explanation.replace(/"/g, '""'),
        c.confidence
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    // Generate a simple HTML report that can be printed to PDF
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1f2937; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .summary-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-weight: 600; }
          .taxable { color: #ef4444; }
          .exempt { color: #22c55e; }
          .deductible { color: #3b82f6; }
          .uncertain { color: #f59e0b; }
        </style>
      </head>
      <body>
        <h1>Nigeria Tax Analysis Report</h1>
        <p><strong>Statement:</strong> ${statement.fileName}</p>
        <p><strong>Period:</strong> ${analysis.period.startDate} to ${analysis.period.endDate}</p>
        <p><strong>Generated:</strong> ${new Date(analysis.generatedAt).toLocaleString()}</p>
        
        <div class="summary-box">
          <h2>Summary</h2>
          <p><span class="amount taxable">Total Taxable Income:</span> ${formatCurrency(analysis.totalTaxableIncome)}</p>
          <p><span class="amount exempt">Total Exempt Income:</span> ${formatCurrency(analysis.totalExemptIncome)}</p>
          <p><span class="amount deductible">Total Deductible:</span> ${formatCurrency(analysis.totalDeductibleAmount)}</p>
          ${analysis.totalUncertainAmount > 0 ? `<p><span class="amount uncertain">Uncertain Amount:</span> ${formatCurrency(analysis.totalUncertainAmount)}</p>` : ''}
        </div>

        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.classifications.map((c: any) => {
              const txn = statement.transactions.find((t: any) => t.id === c.transactionId);
              return `
                <tr>
                  <td>${txn?.date || ''}</td>
                  <td>${txn?.description || ''}</td>
                  <td>${formatCurrency(c.amount)}</td>
                  <td class="${c.category}">${c.category.toUpperCase()}</td>
                  <td>${c.explanation}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #d1d5db; font-size: 12px; color: #6b7280;">
          <p>This report is generated based on the Nigeria Tax Reform Law 2026.</p>
          <p>Please consult a qualified tax professional for official tax advice.</p>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(html);
    reportWindow.document.close();
    setTimeout(() => {
      reportWindow.print();
    }, 250);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'taxable':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'exempt':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'deductible':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'uncertain':
        return <HelpCircle className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'taxable':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'exempt':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'deductible':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'uncertain':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Taxable Income</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(analysis.totalTaxableIncome)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Exempt Income</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.totalExemptIncome)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Deductible</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(analysis.totalDeductibleAmount)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Uncertain</span>
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(analysis.totalUncertainAmount)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Summary & Charts
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Transaction Details
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Export
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-8">
              {/* Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Warnings for Uncertain Transactions */}
              {analysis.totalUncertainAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Review Required</h4>
                      <p className="text-sm text-amber-800">
                        {analysis.classifications.filter(c => c.category === 'uncertain').length} transaction(s) 
                        totaling {formatCurrency(analysis.totalUncertainAmount)} need manual review.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {analysis.classifications.map((classification: any) => {
                const txn = statement.transactions.find(t => t.id === classification.transactionId);
                if (!txn) return null;

                return (
                  <div
                    key={classification.transactionId}
                    className={`border rounded-lg p-4 ${getCategoryColor(classification.category)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getCategoryIcon(classification.category)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{txn.description}</h4>
                            <span className="font-bold">{formatCurrency(classification.amount)}</span>
                          </div>
                          <p className="text-sm opacity-75 mb-2">{txn.date}</p>
                          <p className="text-sm leading-relaxed">{classification.explanation}</p>
                          
                          {classification.suggestedAction && (
                            <div className="mt-3 p-3 bg-white/50 rounded border border-current/20">
                              <p className="text-sm font-medium">Suggested Action:</p>
                              <p className="text-sm mt-1">{classification.suggestedAction}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs opacity-75 mt-3 pt-3 border-t border-current/20">
                      <span className="uppercase font-medium">{classification.category}</span>
                      {classification.taxType && (
                        <span>Tax Type: {classification.taxType.replace('_', ' ').toUpperCase()}</span>
                      )}
                      <span>Confidence: {classification.confidence.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Download your tax analysis in formats compatible with NRS e-filing system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Export to CSV</h4>
                    <p className="text-sm text-gray-600">Spreadsheet format for NRS e-filing</p>
                  </div>
                </button>

                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <Download className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Export to PDF</h4>
                    <p className="text-sm text-gray-600">Printable report with full details</p>
                  </div>
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Analysis Summary</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Total Transactions:</strong> {statement.transactions.length}</p>
                  <p><strong>Statement Period:</strong> {analysis.period.startDate} to {analysis.period.endDate}</p>
                  <p><strong>Generated:</strong> {new Date(analysis.generatedAt).toLocaleString()}</p>
                  <p><strong>Tax Law:</strong> Nigeria Tax Reform Law 2026</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

