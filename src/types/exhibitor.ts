// Exhibitor types
export interface ExhibitorCompany {
  id: string;
  companyId: string; // Login ID like "EXH001"
  companyName: string;
  phoneNumber: string;
  plan: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
  password: string;
  lunchAllocation: number;
  dinnerAllocation: number;
  lunchUsed: number;
  dinnerUsed: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExhibitorEmployee {
  id: string;
  companyId: string;
  employeeName: string;
  employeePhone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExhibitorMealClaim {
  id: string;
  companyId: string;
  employeeId: string | null; // Can be null for bulk claims
  mealSlotId: string;
  mealType: 'lunch' | 'dinner';
  quantity?: number; // Number of meals claimed (for bulk claims)
  status: boolean; // true = available, false = claimed
  claimedAt?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExhibitorContextType {
  currentCompany: ExhibitorCompany | null;
  employees: ExhibitorEmployee[];
  mealClaims: ExhibitorMealClaim[];
  isLoading: boolean;
  
  // Auth functions
  login: (companyId: string) => Promise<boolean>;
  logout: () => void;
  
  // Employee management
  getEmployees: () => Promise<ExhibitorEmployee[]>;
  addEmployee: (employeeName: string, employeePhone?: string) => Promise<boolean>;
  updateEmployee: (employeeId: string, updates: Partial<ExhibitorEmployee>) => Promise<boolean>;
  removeEmployee: (employeeId: string) => Promise<boolean>;
  
  // Meal claim functions
  claimMeal: (employeeId: string, mealSlotId: string, mealType: 'lunch' | 'dinner') => Promise<boolean>;
  claimMealBulk: (mealSlotId: string, mealType: 'lunch' | 'dinner', quantity: number) => Promise<boolean>;
  getMealClaims: () => Promise<ExhibitorMealClaim[]>;
  getAvailableAllocations: () => { lunch: number; dinner: number };
  
  // Utility functions
  refreshData: () => Promise<void>;
}

// Plan allocations mapping
export const PLAN_ALLOCATIONS = {
  Diamond: { lunch: 5, dinner: 4 },
  Platinum: { lunch: 3, dinner: 2 },
  Gold: { lunch: 2, dinner: 0 },
  Silver: { lunch: 1, dinner: 0 }
} as const;