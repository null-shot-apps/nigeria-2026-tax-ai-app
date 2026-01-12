/**
 * Nigeria Tax Reform Law 2026 - Knowledge Base
 * This structured data feeds into the AI reasoning engine
 */

export interface TaxRule {
  id: string;
  category: 'income' | 'vat' | 'corporate' | 'exemption' | 'deduction' | 'digital';
  title: string;
  description: string;
  applicableTransactions: string[];
  rate?: number;
  threshold?: number;
  examples: string[];
}

export const nigeriaTaxLaw2026: TaxRule[] = [
  // PERSONAL INCOME TAX
  {
    id: 'pit-001',
    category: 'income',
    title: 'Employment Income',
    description: 'All salaries, wages, bonuses, allowances, and benefits from employment are taxable.',
    applicableTransactions: ['salary', 'wage', 'bonus', 'allowance', 'commission'],
    rate: 24, // Progressive rates apply, this is top rate
    examples: [
      'Monthly salary deposit from employer',
      'Year-end bonus payment',
      'Housing allowance',
      'Transport allowance'
    ]
  },
  {
    id: 'pit-002',
    category: 'income',
    title: 'Business and Professional Income',
    description: 'Income from trade, business, profession, or vocation is taxable.',
    applicableTransactions: ['business income', 'professional fees', 'consulting', 'freelance'],
    rate: 24,
    examples: [
      'Consulting fees received',
      'Freelance project payments',
      'Business sales revenue',
      'Professional service fees'
    ]
  },
  {
    id: 'pit-003',
    category: 'income',
    title: 'Investment Income',
    description: 'Dividends, interest, rental income, and capital gains are taxable.',
    applicableTransactions: ['dividend', 'interest', 'rent', 'capital gain', 'investment return'],
    rate: 10, // Withholding tax rate
    examples: [
      'Bank interest payments',
      'Dividend from shares',
      'Rental income from property',
      'Profit from stock sales'
    ]
  },

  // VAT
  {
    id: 'vat-001',
    category: 'vat',
    title: 'Value Added Tax on Goods and Services',
    description: 'VAT at 7.5% applies to most goods and services supplied in Nigeria.',
    applicableTransactions: ['purchase', 'service payment', 'goods', 'retail'],
    rate: 7.5,
    examples: [
      'Restaurant bills',
      'Retail purchases',
      'Professional services',
      'Hotel accommodation'
    ]
  },

  // CORPORATE TAX
  {
    id: 'corp-001',
    category: 'corporate',
    title: 'Corporate Income Tax',
    description: 'Companies pay 30% tax on profits (20% for small companies with turnover < ₦25M).',
    applicableTransactions: ['business income', 'corporate profit'],
    rate: 30,
    threshold: 25000000,
    examples: [
      'Company profit distributions',
      'Business revenue for incorporated entities'
    ]
  },

  // EXEMPTIONS
  {
    id: 'exempt-001',
    category: 'exemption',
    title: 'Personal Gifts and Donations',
    description: 'Gifts and donations between individuals (not business-related) are exempt from tax.',
    applicableTransactions: ['gift', 'donation', 'personal transfer'],
    examples: [
      'Birthday gift from family',
      'Wedding gift money',
      'Personal loan from friend',
      'Family support transfer'
    ]
  },
  {
    id: 'exempt-002',
    category: 'exemption',
    title: 'Loan Proceeds',
    description: 'Loan disbursements are not taxable income (but interest paid may be deductible).',
    applicableTransactions: ['loan', 'loan disbursement', 'borrowed funds'],
    examples: [
      'Bank loan disbursement',
      'Personal loan received',
      'Mortgage advance',
      'Credit facility drawdown'
    ]
  },
  {
    id: 'exempt-003',
    category: 'exemption',
    title: 'Refunds and Reimbursements',
    description: 'Refunds of previously paid amounts and legitimate reimbursements are not taxable.',
    applicableTransactions: ['refund', 'reimbursement', 'return'],
    examples: [
      'Tax refund from NRS',
      'Product return refund',
      'Business expense reimbursement',
      'Overpayment refund'
    ]
  },
  {
    id: 'exempt-004',
    category: 'exemption',
    title: 'Transfers Between Own Accounts',
    description: 'Transfers between accounts owned by the same person are not taxable events.',
    applicableTransactions: ['own account transfer', 'internal transfer'],
    examples: [
      'Transfer from savings to checking account',
      'Moving funds between personal accounts',
      'Transfer to own investment account'
    ]
  },
  {
    id: 'exempt-005',
    category: 'exemption',
    title: 'Agricultural Income (Small Scale)',
    description: 'Income from small-scale agricultural activities (< ₦10M annual) is exempt.',
    applicableTransactions: ['farm income', 'agricultural sales'],
    threshold: 10000000,
    examples: [
      'Small farm produce sales',
      'Livestock sales (small scale)',
      'Poultry income (small scale)'
    ]
  },

  // DEDUCTIONS
  {
    id: 'ded-001',
    category: 'deduction',
    title: 'Business Expenses',
    description: 'Ordinary and necessary business expenses are deductible from business income.',
    applicableTransactions: ['business expense', 'operational cost', 'supplies', 'equipment'],
    examples: [
      'Office rent payment',
      'Business supplies purchase',
      'Equipment purchase for business',
      'Professional service fees for business'
    ]
  },
  {
    id: 'ded-002',
    category: 'deduction',
    title: 'Pension Contributions',
    description: 'Mandatory pension contributions (up to 8% of salary) are tax-deductible.',
    applicableTransactions: ['pension', 'retirement contribution', 'RSA contribution'],
    rate: 8,
    examples: [
      'Monthly pension fund contribution',
      'Retirement savings account deposit',
      'Employer pension remittance'
    ]
  },
  {
    id: 'ded-003',
    category: 'deduction',
    title: 'Life Insurance Premiums',
    description: 'Life insurance premiums are deductible up to ₦500,000 annually.',
    applicableTransactions: ['insurance', 'life insurance premium'],
    threshold: 500000,
    examples: [
      'Annual life insurance premium',
      'Monthly life insurance payment',
      'Term life insurance premium'
    ]
  },
  {
    id: 'ded-004',
    category: 'deduction',
    title: 'Mortgage Interest',
    description: 'Interest paid on residential mortgage is deductible up to ₦5,000,000 annually.',
    applicableTransactions: ['mortgage interest', 'home loan interest'],
    threshold: 5000000,
    examples: [
      'Monthly mortgage interest payment',
      'Home loan interest',
      'Residential property loan interest'
    ]
  },
  {
    id: 'ded-005',
    category: 'deduction',
    title: 'Educational Expenses',
    description: 'Tuition and educational expenses for self or dependents are deductible up to ₦1,000,000 annually.',
    applicableTransactions: ['tuition', 'school fees', 'education'],
    threshold: 1000000,
    examples: [
      'University tuition payment',
      'School fees for children',
      'Professional certification courses',
      'Educational materials'
    ]
  },

  // DIGITAL AND FOREIGN INCOME
  {
    id: 'digital-001',
    category: 'digital',
    title: 'Digital Services Income',
    description: 'Income from digital services, online platforms, and remote work is taxable.',
    applicableTransactions: ['digital income', 'online earnings', 'platform income', 'remote work'],
    rate: 24,
    examples: [
      'YouTube ad revenue',
      'Upwork/Fiverr earnings',
      'Online course sales',
      'Affiliate marketing income',
      'Cryptocurrency trading profits'
    ]
  },
  {
    id: 'digital-002',
    category: 'digital',
    title: 'Foreign Income',
    description: 'Income earned from foreign sources by Nigerian residents is taxable (with foreign tax credit).',
    applicableTransactions: ['foreign income', 'international payment', 'overseas earnings'],
    rate: 24,
    examples: [
      'Salary from foreign employer',
      'International consulting fees',
      'Foreign investment income',
      'Remittance from abroad for services'
    ]
  },
  {
    id: 'digital-003',
    category: 'digital',
    title: 'Cryptocurrency Transactions',
    description: 'Cryptocurrency gains are taxable as capital gains; crypto received for services is taxable as income.',
    applicableTransactions: ['crypto', 'cryptocurrency', 'bitcoin', 'digital asset'],
    rate: 10, // Capital gains rate
    examples: [
      'Bitcoin sale profit',
      'Crypto trading gains',
      'Payment received in cryptocurrency',
      'NFT sales'
    ]
  }
];

/**
 * Get tax law context for AI reasoning
 */
export function getTaxLawContext(): string {
  return `
# Nigeria Tax Reform Law 2026 - Complete Reference

## PERSONAL INCOME TAX
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'income')
  .map(rule => `
### ${rule.title}
${rule.description}
Rate: ${rule.rate}%
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## VALUE ADDED TAX (VAT)
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'vat')
  .map(rule => `
### ${rule.title}
${rule.description}
Rate: ${rule.rate}%
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## CORPORATE TAX
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'corporate')
  .map(rule => `
### ${rule.title}
${rule.description}
Rate: ${rule.rate}%
${rule.threshold ? `Threshold: ₦${rule.threshold.toLocaleString()}` : ''}
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## EXEMPTIONS
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'exemption')
  .map(rule => `
### ${rule.title}
${rule.description}
${rule.threshold ? `Threshold: ₦${rule.threshold.toLocaleString()}` : ''}
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## DEDUCTIONS
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'deduction')
  .map(rule => `
### ${rule.title}
${rule.description}
${rule.rate ? `Rate: ${rule.rate}%` : ''}
${rule.threshold ? `Maximum: ₦${rule.threshold.toLocaleString()}` : ''}
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## DIGITAL AND FOREIGN INCOME
${nigeriaTaxLaw2026
  .filter(rule => rule.category === 'digital')
  .map(rule => `
### ${rule.title}
${rule.description}
Rate: ${rule.rate}%
Applicable to: ${rule.applicableTransactions.join(', ')}
Examples: ${rule.examples.join('; ')}
`).join('\n')}

## IMPORTANT NOTES
- All amounts are in Nigerian Naira (₦)
- Tax year runs from January 1 to December 31
- Personal income tax uses progressive rates (7%, 11%, 15%, 19%, 21%, 24%)
- Minimum tax applies if calculated tax is less than 0.5% of gross income
- Foreign tax credits available for taxes paid abroad
- Digital economy transactions are fully covered under the 2026 reforms
`;
}

/**
 * Find applicable tax rules for a transaction
 */
export function findApplicableRules(transactionDescription: string): TaxRule[] {
  const lowerDesc = transactionDescription.toLowerCase();
  return nigeriaTaxLaw2026.filter(rule => 
    rule.applicableTransactions.some(keyword => 
      lowerDesc.includes(keyword.toLowerCase())
    )
  );
}

