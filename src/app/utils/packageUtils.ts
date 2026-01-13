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

export function mergeBackendPackages(backendPackages: BackendPackage[]): Package[] {
    if (!backendPackages || backendPackages.length === 0) {
        return frontendPackages;
    }

    // Helper to normalize text for matching (e.g. "Basic Bundle" -> "basic")
    const normalize = (text: string) => text.toLowerCase().includes('basic') ? 'basic' :
        text.toLowerCase().includes('family') ? 'family' :
            text.toLowerCase().includes('premium') ? 'premium' : text.toLowerCase();

    return backendPackages.map(bp => {
        // Find matching frontend definition for UI styles (gradients, badges, etc)
        const normalizedName = normalize(bp.name);
        // Try to match by name pattern first, otherwise fallback to "basic" style
        const uiDef = frontendPackages.find(fp => fp.id === normalizedName) ||
            frontendPackages.find(fp => fp.name === bp.name) ||
            frontendPackages[0];

        return {
            // Use backend data primarily
            id: bp.id.toString(),
            name: bp.name,
            description: bp.description || uiDef.description,
            monthlyAmount: parseFloat(bp.monthly_contribution),
            yearlyTotal: parseFloat(bp.yearly_contribution),
            estimatedRetailValue: parseFloat(bp.package_worth),
            savings: bp.savings_amount ? parseFloat(bp.savings_amount) : 0,
            savingsPercent: parseFloat(bp.savings_percentage),

            // Use backend benefits. 
            // Note: Backend gives simple strings. Frontend 'detailedBenefits' (item/qty/unit) is not available from backend.
            // We will fallback to 'benefits' array.
            benefits: bp.benefits,
            detailedBenefits: undefined, // Explicitly clear detailedBenefits so UI uses the simple list

            // Keep UI styles from local config
            gradient: uiDef.gradient,
            shadowColor: uiDef.shadowColor,
            badge: bp.badge || uiDef.badge // Prefer backend badge if available
        } as unknown as Package; // Force cast to match Package interface
    });
}
