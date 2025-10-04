export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalParticipants: number;
  totalExhibitors: number;
  totalCoupons: number;
  activeCoupons: number;
  claimedCoupons: number;
  expiredCoupons: number;
  totalMealClaims: number;
  lunchClaims: number;
  dinnerClaims: number;
}

export interface ParticipantAdmin {
  id: string;
  phoneNumber: string;
  name: string;
  familySize: number;
  isFam: boolean;
  hospitalName?: string;
  isFaculty?: boolean;
  createdAt: string;
  updatedAt: string;
  couponsCount: number;
  activeCouponsCount: number;
}

export interface ExhibitorAdmin {
  id: string;
  companyId: string;
  companyName: string;
  phoneNumber: string;
  plan: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
  lunchAllocation: number;
  dinnerAllocation: number;
  lunchUsed: number;
  dinnerUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitorEmployeeAdmin {
  id: string;
  companyId: string;
  companyName?: string;
  employeeId: string;
  employeeName: string;
  phoneNumber: string;
  email?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponAdmin {
  id: string;
  uniqueId: string;
  participantId: string;
  participantName?: string;
  participantPhone?: string;
  mealSlotId: string;
  mealSlotName?: string;
  familyMemberIndex: number;
  status: 'available' | 'active' | 'used' | 'locked';
  couponedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface MealClaimAdmin {
  id: string;
  companyId: string;
  companyName?: string;
  employeeId?: string;
  employeeName?: string;
  mealSlotId: string;
  mealSlotName?: string;
  mealType: 'lunch' | 'dinner';
  quantity?: number;
  status: boolean;
  claimedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface RegistrationAdmin {
  id: string;
  userId: string;
  userType: 'participant' | 'exhibitor' | 'admin';
  name: string;
  phoneNumber?: string;
  companyName?: string;
  isFaculty?: boolean;
  registeredAt: string;
}

export interface AdminContextType {
  // New interface properties
  currentAdmin: AdminUser | null;
  stats: AdminStats | null;
  isLoading: boolean;
  
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Stats
  refreshStats: () => Promise<void>;
  
  // Participants
  getParticipants: () => Promise<ParticipantAdmin[]>;
  addParticipant: (data: Partial<ParticipantAdmin>) => Promise<boolean>;
  updateParticipant: (id: string, data: Partial<ParticipantAdmin>) => Promise<boolean>;
  deleteParticipant: (id: string) => Promise<boolean>;
  
  // Exhibitors
  getExhibitors: () => Promise<ExhibitorAdmin[]>;
  addExhibitor: (data: Partial<ExhibitorAdmin>) => Promise<boolean>;
  updateExhibitor: (id: string, data: Partial<ExhibitorAdmin>) => Promise<boolean>;
  deleteExhibitor: (id: string) => Promise<boolean>;
  
  // Exhibitor Employees
  getExhibitorEmployees: () => Promise<ExhibitorEmployeeAdmin[]>;
  
  // Coupons
  getCoupons: (filters?: CouponFilters) => Promise<CouponAdmin[]>;
  resetCoupon: (couponId: string) => Promise<boolean>;
  resetAllCoupons: () => Promise<boolean>;
  resetParticipantCoupons: (participantId: string) => Promise<boolean>;
  
  // Meal Claims
  getMealClaims: () => Promise<MealClaimAdmin[]>;
  resetMealClaim: (claimId: string) => Promise<boolean>;
  claimExhibitorMeal: (companyId: string, mealSlotId: string, mealType: 'lunch' | 'dinner', employeeId: string, quantity?: number) => Promise<boolean>;

  // Registrations
  getRegistrations: () => Promise<RegistrationAdmin[]>;
  registerParticipant: (participantId: string) => Promise<boolean>;

  // Legacy interface properties for backward compatibility
  participants?: any[];
  mealSlots?: any[];
  allClaims?: any[];
  error?: string | null;
  isAdminAuthenticated?: boolean;
  refreshData?: () => void;
  createParticipant?: (participantData: any) => Promise<boolean>;
  editParticipant?: (id: string, updates: any) => Promise<boolean>;
  removeParticipant?: (id: string) => Promise<boolean>;
  activateAllCoupons?: (participantId: string) => Promise<boolean>;
  deactivateAllCoupons?: (participantId: string) => Promise<boolean>;
  getParticipantStats?: () => {
    total: number;
    withFamily: number;
    activeCoupons: number;
    usedCoupons: number;
  };
}

export interface CouponFilters {
  status?: 'available' | 'active' | 'used' | 'locked';
  mealSlotId?: string;
  participantId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminFormData {
  participants: {
    phoneNumber: string;
    name: string;
    familySize: number;
  };
  exhibitors: {
    companyId: string;
    companyName: string;
    phoneNumber: string;
    plan: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
    password?: string;
  };
}