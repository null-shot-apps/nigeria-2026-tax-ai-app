/**
 * AI-powered transaction analysis and tax classification
 * Uses OpenAI or Anthropic Claude for intelligent tax reasoning
 */

import type { Transaction, TaxClassification, AIAnalysisResponse } from './types';
import { getTaxLawContext } from './tax-laws';

/**
 * Analyze transactions using AI
 * This is a client-side implementation that requires API key
 */
export async function analyzeTransactionsWithAI(
  transactions: Transaction[],
  apiKey: string,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<AIAnalysisResponse> {
  
  const taxLawContext = getTaxLawContext();
  
  const prompt = `You are a Nigerian tax expert analyzing bank transactions under the Nigeria Tax Reform Law 2026.

${taxLawContext}

TASK: Analyze each transaction and classify it as:
1. TAXABLE (income that must be reported and taxed)
2. EXEMPT (income that is not taxable)
3. DEDUCTIBLE (expense that can reduce taxable income)
4. UNCERTAIN (needs human review)

For each transaction, provide:
- Category (taxable/exempt/deductible/uncertain)
- Tax type (income/vat/corporate/capital_gains) if taxable
- Confidence level (high/medium/low)
- Plain English explanation citing specific tax law provisions
- Applicable rule IDs from the tax law
- Suggested action if uncertain

TRANSACTIONS TO ANALYZE:
${JSON.stringify(transactions, null, 2)}

RESPONSE FORMAT (JSON only, no markdown):
{
  "classifications": [
    {
      "transactionId": "string",
      "category": "taxable|exempt|deductible|uncertain",
      "taxType": "income|vat|corporate|capital_gains",
      "amount": number,
      "explanation": "Plain English explanation with tax law citation",
      "confidence": "high|medium|low",
      "applicableRules": ["rule-id-1", "rule-id-2"],
      "suggestedAction": "Optional guidance for uncertain transactions"
    }
  ],
  "summary": "Overall summary of tax implications",
  "warnings": ["Any important warnings or flags"]
}`;

  try {
    if (provider === 'openai') {
      return await analyzeWithOpenAI(prompt, apiKey);
    } else {
      return await analyzeWithAnthropic(prompt, apiKey);
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze transactions with AI. Please check your API key and try again.');
  }
}

/**
 * Analyze using OpenAI GPT-4
 */
async function analyzeWithOpenAI(prompt: string, apiKey: string): Promise<AIAnalysisResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a Nigerian tax expert. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data: any = await response.json();
  const content = data.choices[0].message.content;
  
  return JSON.parse(content);
}

/**
 * Analyze using Anthropic Claude
 */
async function analyzeWithAnthropic(prompt: string, apiKey: string): Promise<AIAnalysisResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(error.error?.message || 'Anthropic API request failed');
  }

  const data: any = await response.json();
  const content = data.content[0].text;
  
  // Claude might wrap JSON in markdown, so clean it
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return JSON.parse(content);
}

/**
 * Fallback rule-based classification (when AI is not available)
 */
export function classifyTransactionRuleBased(transaction: Transaction): TaxClassification {
  const desc = transaction.description.toLowerCase();
  
  // TAXABLE INCOME patterns
  if (desc.includes('salary') || desc.includes('wage') || desc.includes('bonus')) {
    return {
      transactionId: transaction.id,
      category: 'taxable',
      taxType: 'income',
      amount: transaction.amount,
      explanation: 'This is employment income (salary/wage/bonus), which is taxable under the Nigeria Tax Reform Law 2026, Section on Personal Income Tax. Employment income is subject to progressive tax rates up to 24%.',
      confidence: 'high',
      applicableRules: ['pit-001']
    };
  }
  
  if (desc.includes('freelance') || desc.includes('consulting') || desc.includes('professional')) {
    return {
      transactionId: transaction.id,
      category: 'taxable',
      taxType: 'income',
      amount: transaction.amount,
      explanation: 'This is business/professional income from freelance or consulting work, which is taxable at 24% under Personal Income Tax provisions.',
      confidence: 'high',
      applicableRules: ['pit-002']
    };
  }
  
  if (desc.includes('interest') || desc.includes('dividend') || desc.includes('investment')) {
    return {
      transactionId: transaction.id,
      category: 'taxable',
      taxType: 'income',
      amount: transaction.amount,
      explanation: 'This is investment income (interest/dividend), which is subject to 10% withholding tax under the Investment Income provisions.',
      confidence: 'high',
      applicableRules: ['pit-003']
    };
  }
  
  if (desc.includes('upwork') || desc.includes('fiverr') || desc.includes('youtube') || 
      desc.includes('digital') || desc.includes('online')) {
    return {
      transactionId: transaction.id,
      category: 'taxable',
      taxType: 'income',
      amount: transaction.amount,
      explanation: 'This is digital services income from online platforms, which is fully taxable at 24% under the 2026 Digital Economy provisions.',
      confidence: 'high',
      applicableRules: ['digital-001']
    };
  }
  
  // EXEMPT patterns
  if (desc.includes('gift') || desc.includes('donation') || desc.includes('family')) {
    return {
      transactionId: transaction.id,
      category: 'exempt',
      amount: transaction.amount,
      explanation: 'This appears to be a personal gift or family transfer, which is exempt from tax under the Personal Gifts and Donations exemption.',
      confidence: 'medium',
      applicableRules: ['exempt-001']
    };
  }
  
  if (desc.includes('loan') && transaction.type === 'deposit') {
    return {
      transactionId: transaction.id,
      category: 'exempt',
      amount: transaction.amount,
      explanation: 'This is a loan disbursement, which is not taxable income. Only the interest paid on the loan may be deductible if used for qualifying purposes.',
      confidence: 'high',
      applicableRules: ['exempt-002']
    };
  }
  
  if (desc.includes('refund') || desc.includes('reimbursement')) {
    return {
      transactionId: transaction.id,
      category: 'exempt',
      amount: transaction.amount,
      explanation: 'This is a refund or reimbursement of previously paid amounts, which is not taxable income.',
      confidence: 'high',
      applicableRules: ['exempt-003']
    };
  }
  
  if (desc.includes('transfer') && (desc.includes('savings') || desc.includes('own account'))) {
    return {
      transactionId: transaction.id,
      category: 'exempt',
      amount: transaction.amount,
      explanation: 'This is a transfer between your own accounts, which is not a taxable event.',
      confidence: 'high',
      applicableRules: ['exempt-004']
    };
  }
  
  // DEDUCTIBLE patterns
  if (desc.includes('pension') || desc.includes('rsa')) {
    return {
      transactionId: transaction.id,
      category: 'deductible',
      amount: transaction.amount,
      explanation: 'Pension contributions (up to 8% of salary) are tax-deductible under the Pension Contributions deduction provision.',
      confidence: 'high',
      applicableRules: ['ded-002']
    };
  }
  
  if (desc.includes('life insurance') || desc.includes('insurance premium')) {
    return {
      transactionId: transaction.id,
      category: 'deductible',
      amount: Math.min(transaction.amount, 500000),
      explanation: 'Life insurance premiums are deductible up to ₦500,000 annually under the Life Insurance Premiums deduction.',
      confidence: 'high',
      applicableRules: ['ded-003']
    };
  }
  
  if (desc.includes('mortgage interest') || desc.includes('home loan interest')) {
    return {
      transactionId: transaction.id,
      category: 'deductible',
      amount: Math.min(transaction.amount, 5000000),
      explanation: 'Mortgage interest on residential property is deductible up to ₦5,000,000 annually under the Mortgage Interest deduction.',
      confidence: 'high',
      applicableRules: ['ded-004']
    };
  }
  
  if (desc.includes('school') || desc.includes('tuition') || desc.includes('education') || desc.includes('university')) {
    return {
      transactionId: transaction.id,
      category: 'deductible',
      amount: Math.min(transaction.amount, 1000000),
      explanation: 'Educational expenses for self or dependents are deductible up to ₦1,000,000 annually under the Educational Expenses deduction.',
      confidence: 'high',
      applicableRules: ['ded-005']
    };
  }
  
  // UNCERTAIN - needs review
  return {
    transactionId: transaction.id,
    category: 'uncertain',
    amount: transaction.amount,
    explanation: 'This transaction requires manual review to determine its tax treatment. The description does not clearly match any standard tax category.',
    confidence: 'low',
    applicableRules: [],
    suggestedAction: 'Please review this transaction and provide additional context about its nature (e.g., is it income, a personal transfer, a business expense, etc.)'
  };
}

/**
 * Batch classify transactions using rule-based approach
 */
export function classifyTransactionsBatch(transactions: Transaction[]): TaxClassification[] {
  return transactions.map(txn => classifyTransactionRuleBased(txn));
}

