import { Package, packages as frontendPackages } from '../data/packages';

export interface BackendPackage {
    id: number;
    name: string;
    description: string | null;
    badge: string | null;
    yearly_contribution: string;
    monthly_contribution: string;
    package_worth: string;
    savings_amount: string | null;
    savings_percentage: string;
    benefits: string[];
    is_active: boolean;
    display_order: number;
}

// Deterministic Style Palette
// These styles will be rotated based on package ID to ensure every package looks unique and beautiful
const PREMIUM_STYLES = [
    {
        id: 'style-1', // Purple/Indigo (Classic)
        gradient: 'from-indigo-600 via-purple-600 to-pink-600',
        shadowColor: 'shadow-purple-500/30'
    },
    {
        id: 'style-2', // Emerald/Teal (Fresh)
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        shadowColor: 'shadow-emerald-500/30'
    },
    {
        id: 'style-3', // Amber/Orange (Warm)
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        shadowColor: 'shadow-orange-500/30'
    },
    {
        id: 'style-4', // Blue/Cyan (Cool)
        gradient: 'from-blue-600 via-cyan-500 to-sky-400',
        shadowColor: 'shadow-blue-500/30'
    },
    {
        id: 'style-5', // Rose/Pink (Elegant)
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
        shadowColor: 'shadow-pink-500/30'
    },
    {
        id: 'style-6', // Violet/Indigo (Deep)
        gradient: 'from-violet-600 via-indigo-600 to-blue-600',
        shadowColor: 'shadow-indigo-500/30'
    }
];

export function mergeBackendPackages(backendPackages: BackendPackage[]): Package[] {
    if (!backendPackages || backendPackages.length === 0) {
        return [];
    }

    return backendPackages.map(bp => {
        // Use ID for deterministic style assignment
        // abs() ensures positive index even if something weird happens with ID
        const styleIndex = Math.abs(bp.id) % PREMIUM_STYLES.length;
        const style = PREMIUM_STYLES[styleIndex];

        // determine badge (prefer backend, fallback to logic based on price)
        let badge = bp.badge;
        if (!badge) {
            const price = parseFloat(bp.monthly_contribution);
            if (price >= 50000) badge = "PREMIUM VALUE";
            else if (price >= 15000) badge = "POPULAR";
            else badge = undefined;
        }

        return {
            // Use backend data primarily
            id: bp.id.toString(),
            name: bp.name,
            description: bp.description || `Perfect for your needs`,
            monthlyAmount: parseFloat(bp.monthly_contribution),
            yearlyTotal: parseFloat(bp.yearly_contribution),
            estimatedRetailValue: parseFloat(bp.package_worth),
            savings: bp.savings_amount ? parseFloat(bp.savings_amount) : 0,
            savingsPercent: parseFloat(bp.savings_percentage),

            // Use backend benefits. 
            benefits: bp.benefits,
            detailedBenefits: undefined, // Explicitly clear detailedBenefits so UI uses the simple list

            // Apply deterministic style
            gradient: style.gradient,
            shadowColor: style.shadowColor,
            badge: badge
        } as unknown as Package; // Force cast to match Package interface
    });
}
