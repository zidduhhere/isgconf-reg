import { ExhibitorEmployee } from '../types/exhibitor';

const EXHIBITOR_STORAGE_KEY = 'exhibitor_session';
const EXHIBITOR_EMPLOYEES_KEY = 'exhibitor_employees';
const EXHIBITOR_CLAIMS_KEY = 'exhibitor_meal_claims';

export interface ExhibitorStorageData {
  companyId: string;
  loginTime: number;
  expiresAt: number;
}

export interface ExhibitorClaimData {
  [key: string]: {
    employeeId: string;
    employeeName: string;
    claimedAt: number;
    expiresAt: number;
    mealType: 'lunch' | 'dinner';
  };
}

// Session management
export const saveExhibitorSession = (companyId: string): void => {
  const sessionData: ExhibitorStorageData = {
    companyId,
    loginTime: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  try {
    localStorage.setItem(EXHIBITOR_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save exhibitor session:', error);
  }
};

export const getExhibitorSession = (): ExhibitorStorageData | null => {
  try {
    const stored = localStorage.getItem(EXHIBITOR_STORAGE_KEY);
    if (!stored) return null;
    
    const sessionData: ExhibitorStorageData = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      clearExhibitorSession();
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Failed to get exhibitor session:', error);
    return null;
  }
};

export const clearExhibitorSession = (): void => {
  try {
    localStorage.removeItem(EXHIBITOR_STORAGE_KEY);
    localStorage.removeItem(EXHIBITOR_EMPLOYEES_KEY);
    localStorage.removeItem(EXHIBITOR_CLAIMS_KEY);
  } catch (error) {
    console.error('Failed to clear exhibitor session:', error);
  }
};

// Employee data management
export const saveEmployees = (companyId: string, employees: ExhibitorEmployee[]): void => {
  try {
    const key = `${EXHIBITOR_EMPLOYEES_KEY}_${companyId}`;
    localStorage.setItem(key, JSON.stringify(employees));
  } catch (error) {
    console.error('Failed to save employees:', error);
  }
};

export const getEmployees = (companyId: string): ExhibitorEmployee[] => {
  try {
    const key = `${EXHIBITOR_EMPLOYEES_KEY}_${companyId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get employees:', error);
    return [];
  }
};

// Meal claim management
export const saveExhibitorClaimData = (companyId: string, claims: ExhibitorClaimData): void => {
  try {
    const key = `${EXHIBITOR_CLAIMS_KEY}_${companyId}`;
    localStorage.setItem(key, JSON.stringify(claims));
  } catch (error) {
    console.error('Failed to save exhibitor claim data:', error);
  }
};

export const getExhibitorClaimData = (companyId: string): ExhibitorClaimData => {
  try {
    const key = `${EXHIBITOR_CLAIMS_KEY}_${companyId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get exhibitor claim data:', error);
    return {};
  }
};

export const claimExhibitorMeal = (
  companyId: string,
  employeeId: string,
  employeeName: string,
  mealSlotId: string,
  mealType: 'lunch' | 'dinner'
): boolean => {
  try {
    const existingClaims = getExhibitorClaimData(companyId);
    const claimKey = `${employeeId}_${mealSlotId}`;
    
    // Check if already claimed
    if (existingClaims[claimKey]) {
      console.warn('Meal already claimed for this employee and slot');
      return false;
    }
    
    // Add new claim
    existingClaims[claimKey] = {
      employeeId,
      employeeName,
      claimedAt: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
      mealType
    };
    
    saveExhibitorClaimData(companyId, existingClaims);
    return true;
  } catch (error) {
    console.error('Failed to claim exhibitor meal:', error);
    return false;
  }
};

export const getRemainingExhibitorTime = (companyId: string, employeeId: string, mealSlotId: string): number => {
  try {
    const claims = getExhibitorClaimData(companyId);
    const claimKey = `${employeeId}_${mealSlotId}`;
    const claim = claims[claimKey];
    
    if (!claim) return 0;
    
    const remaining = claim.expiresAt - Date.now();
    return Math.max(0, remaining);
  } catch (error) {
    console.error('Failed to get remaining exhibitor time:', error);
    return 0;
  }
};

export const checkAndExpireExhibitorCoupons = (companyId: string): void => {
  try {
    const claims = getExhibitorClaimData(companyId);
    const now = Date.now();
    let hasExpired = false;
    
    Object.keys(claims).forEach(claimKey => {
      if (claims[claimKey].expiresAt <= now) {
        delete claims[claimKey];
        hasExpired = true;
      }
    });
    
    if (hasExpired) {
      saveExhibitorClaimData(companyId, claims);
    }
  } catch (error) {
    console.error('Failed to expire exhibitor coupons:', error);
  }
};