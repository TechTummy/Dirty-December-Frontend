export interface PackageBenefit {
  item: string;
  quantity: number;
  unit: string; // e.g., "kg bag", "L bottle", "cubes"
  retailPricePerUnit: number;
  savingsPricePerUnit: number;
  totalRetailPrice: number; // Auto-calculated: quantity * retailPricePerUnit
  totalSavingsPrice: number; // Auto-calculated: quantity * savingsPricePerUnit
}

export interface Package {
  id: string;
  name: string;
  monthlyAmount: number;
  yearlyTotal: number;
  estimatedRetailValue: number;
  savings: number;
  savingsPercent: number;
  description: string;
  benefits: string[];
  detailedBenefits?: PackageBenefit[];
  gradient: string;
  shadowColor: string;
  badge?: string;
}

export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic Bundle',
    monthlyAmount: 5000,
    yearlyTotal: 60000,
    estimatedRetailValue: 85700,
    savings: 25700,
    savingsPercent: 43,
    description: 'Perfect for small households',
    benefits: [
      'Premium Rice (25kg)',
      'Vegetable Oil (5L)',
      'Beans, Tomato Paste & More'
    ],
    detailedBenefits: [
      { item: 'Premium Rice', quantity: 1, unit: '25kg bag', retailPricePerUnit: 45000, savingsPricePerUnit: 42000, totalRetailPrice: 45000, totalSavingsPrice: 42000 },
      { item: 'Vegetable Oil', quantity: 1, unit: '5L bottle', retailPricePerUnit: 12000, savingsPricePerUnit: 10000, totalRetailPrice: 12000, totalSavingsPrice: 10000 },
      { item: 'Brown Beans', quantity: 1, unit: '5kg bag', retailPricePerUnit: 8500, savingsPricePerUnit: 7500, totalRetailPrice: 8500, totalSavingsPrice: 7500 },
      { item: 'Tomato Paste', quantity: 1, unit: '2.2kg tin', retailPricePerUnit: 3500, savingsPricePerUnit: 3000, totalRetailPrice: 3500, totalSavingsPrice: 3000 },
      { item: 'Chicken', quantity: 1, unit: 'Whole (2kg)', retailPricePerUnit: 7000, savingsPricePerUnit: 6000, totalRetailPrice: 7000, totalSavingsPrice: 6000 },
      { item: 'Groundnut Oil', quantity: 1, unit: '2L bottle', retailPricePerUnit: 5200, savingsPricePerUnit: 4500, totalRetailPrice: 5200, totalSavingsPrice: 4500 },
      { item: 'Salt', quantity: 1, unit: '1kg pack', retailPricePerUnit: 800, savingsPricePerUnit: 700, totalRetailPrice: 800, totalSavingsPrice: 700 },
      { item: 'Seasoning Cubes', quantity: 1, unit: '50 cubes', retailPricePerUnit: 1200, savingsPricePerUnit: 1000, totalRetailPrice: 1200, totalSavingsPrice: 1000 },
      { item: 'Pasta', quantity: 1, unit: '2kg pack', retailPricePerUnit: 2500, savingsPricePerUnit: 2300, totalRetailPrice: 2500, totalSavingsPrice: 2300 }
    ],
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/30'
  },
  {
    id: 'family',
    name: 'Family Bundle',
    monthlyAmount: 15000,
    yearlyTotal: 180000,
    estimatedRetailValue: 257100,
    savings: 77100,
    savingsPercent: 43,
    description: 'Ideal for medium-sized families',
    benefits: [
      'Triple the Basic Bundle',
      'Extra Premium Items',
      'Priority Distribution'
    ],
    detailedBenefits: [
      { item: 'Premium Rice', quantity: 3, unit: '25kg bag', retailPricePerUnit: 45000, savingsPricePerUnit: 42000, totalRetailPrice: 135000, totalSavingsPrice: 126000 },
      { item: 'Vegetable Oil', quantity: 3, unit: '5L bottle', retailPricePerUnit: 12000, savingsPricePerUnit: 10000, totalRetailPrice: 36000, totalSavingsPrice: 30000 },
      { item: 'Brown Beans', quantity: 3, unit: '5kg bag', retailPricePerUnit: 8500, savingsPricePerUnit: 7500, totalRetailPrice: 25500, totalSavingsPrice: 22500 },
      { item: 'Tomato Paste', quantity: 3, unit: '2.2kg tin', retailPricePerUnit: 3500, savingsPricePerUnit: 3000, totalRetailPrice: 10500, totalSavingsPrice: 9000 },
      { item: 'Chicken', quantity: 3, unit: 'Whole (2kg)', retailPricePerUnit: 7000, savingsPricePerUnit: 6000, totalRetailPrice: 21000, totalSavingsPrice: 18000 },
      { item: 'Groundnut Oil', quantity: 3, unit: '2L bottle', retailPricePerUnit: 5200, savingsPricePerUnit: 4500, totalRetailPrice: 15600, totalSavingsPrice: 13500 },
      { item: 'Salt', quantity: 3, unit: '1kg pack', retailPricePerUnit: 800, savingsPricePerUnit: 700, totalRetailPrice: 2400, totalSavingsPrice: 2100 },
      { item: 'Seasoning Cubes', quantity: 3, unit: '50 cubes', retailPricePerUnit: 1200, savingsPricePerUnit: 1000, totalRetailPrice: 3600, totalSavingsPrice: 3000 },
      { item: 'Pasta', quantity: 3, unit: '2kg pack', retailPricePerUnit: 2500, savingsPricePerUnit: 2300, totalRetailPrice: 7500, totalSavingsPrice: 6900 }
    ],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    shadowColor: 'shadow-emerald-500/30',
    badge: 'POPULAR'
  },
  {
    id: 'premium',
    name: 'Premium Bundle',
    monthlyAmount: 50000,
    yearlyTotal: 600000,
    estimatedRetailValue: 857000,
    savings: 257000,
    savingsPercent: 43,
    description: 'Maximum value for large families',
    benefits: [
      '10x the Basic Bundle',
      'VIP Distribution Access',
      'Exclusive Premium Items'
    ],
    detailedBenefits: [
      { item: 'Premium Rice', quantity: 10, unit: '25kg bag', retailPricePerUnit: 45000, savingsPricePerUnit: 42000, totalRetailPrice: 450000, totalSavingsPrice: 420000 },
      { item: 'Vegetable Oil', quantity: 10, unit: '5L bottle', retailPricePerUnit: 12000, savingsPricePerUnit: 10000, totalRetailPrice: 120000, totalSavingsPrice: 100000 },
      { item: 'Brown Beans', quantity: 10, unit: '5kg bag', retailPricePerUnit: 8500, savingsPricePerUnit: 7500, totalRetailPrice: 85000, totalSavingsPrice: 75000 },
      { item: 'Tomato Paste', quantity: 10, unit: '2.2kg tin', retailPricePerUnit: 3500, savingsPricePerUnit: 3000, totalRetailPrice: 35000, totalSavingsPrice: 30000 },
      { item: 'Chicken', quantity: 10, unit: 'Whole (2kg)', retailPricePerUnit: 7000, savingsPricePerUnit: 6000, totalRetailPrice: 70000, totalSavingsPrice: 60000 },
      { item: 'Groundnut Oil', quantity: 10, unit: '2L bottle', retailPricePerUnit: 5200, savingsPricePerUnit: 4500, totalRetailPrice: 52000, totalSavingsPrice: 45000 },
      { item: 'Salt', quantity: 10, unit: '1kg pack', retailPricePerUnit: 800, savingsPricePerUnit: 700, totalRetailPrice: 8000, totalSavingsPrice: 7000 },
      { item: 'Seasoning Cubes', quantity: 10, unit: '50 cubes', retailPricePerUnit: 1200, savingsPricePerUnit: 1000, totalRetailPrice: 12000, totalSavingsPrice: 10000 },
      { item: 'Pasta', quantity: 10, unit: '2kg pack', retailPricePerUnit: 2500, savingsPricePerUnit: 2300, totalRetailPrice: 25000, totalSavingsPrice: 23000 }
    ],
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    shadowColor: 'shadow-orange-500/30',
    badge: 'BEST VALUE'
  }
];

export const getPackageById = (id: string): Package | undefined => {
  return packages.find(pkg => pkg.id === id);
};

export const calculateProportionalPackageValue = (
  packageId: string,
  monthsPaid: number
): { paidSoFar: number; estimatedValue: number; savings: number } => {
  const pkg = getPackageById(packageId);
  if (!pkg) {
    return { paidSoFar: 0, estimatedValue: 0, savings: 0 };
  }

  const paidSoFar = pkg.monthlyAmount * monthsPaid;
  const monthlyValueRate = pkg.estimatedRetailValue / 12;
  const estimatedValue = Math.round(monthlyValueRate * monthsPaid);
  const savings = estimatedValue - paidSoFar;

  return { paidSoFar, estimatedValue, savings };
};