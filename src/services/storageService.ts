import { Participant, MealSlot, Coupon } from "../types";

export const STORAGE_KEYS = {
  PARTICIPANTS: "meal_pass_participants",
  MEAL_SLOTS: "meal_pass_slots",
  MEAL_CLAIMS: "meal_pass_coupons",
  CURRENT_USER: "meal_pass_current_user",
  COUPONS: "coupons", // New key for tracking coupon claims with timestamps
};

// Coupon management with timestamps
export const getCouponData = (): Coupon[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
  return data ? JSON.parse(data) : [];
};

export const saveCouponData = (coupons: Coupon[]): void => {
  localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
};

export const getCouponById = (mealSlotId: string, participantId: string, familyMemberIndex = 0): Coupon | undefined => {
  const coupons = getCouponData();
  return coupons.find((c: Coupon) => 
    c.mealSlotId === mealSlotId && 
    c.id === participantId && 
    c.familyMemberIndex === familyMemberIndex
  );
};

export const claimCoupon = (mealSlotId: string, participantId: string, familyMemberIndex = 0): Coupon => {
  const coupons = getCouponData();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes expiration
  
  // Check if this coupon already exists
  const existingCouponIndex = coupons.findIndex((c: Coupon) => 
    c.mealSlotId === mealSlotId && 
    c.id === participantId && 
    c.familyMemberIndex === familyMemberIndex
  );
  
  let updatedCoupon: Coupon;
  
  if (existingCouponIndex !== -1) {
    const existingCoupon = coupons[existingCouponIndex];
    
    // Safety check: If couponedAt and expiresAt already exist and are not null, don't overwrite them
    if (existingCoupon.couponedAt && existingCoupon.expiresAt) {
      console.log("Coupon already claimed with timestamps, preserving existing values:", {
        couponedAt: existingCoupon.couponedAt,
        expiresAt: existingCoupon.expiresAt
      });
      
      // Only update the status if needed, preserve existing timestamps
      updatedCoupon = {
        ...existingCoupon,
        status: 'active'
      };
    } else {
      // First time claiming or timestamps are missing, set new timestamps
      updatedCoupon = {
        ...existingCoupon,
        status: 'active',
        couponedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
    }
    
    coupons[existingCouponIndex] = updatedCoupon;
  } else {
    // Create new coupon with timestamps
    updatedCoupon = {
      id: participantId,
      mealSlotId: mealSlotId,
      status: 'active',
      familyMemberIndex: familyMemberIndex,
      uniqueId: `${participantId}-${mealSlotId}-${familyMemberIndex}`,
      couponedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    coupons.push(updatedCoupon);
  }
  
  saveCouponData(coupons);
  return updatedCoupon;
};

export const useCoupon = (mealSlotId: string, participantId: string, familyMemberIndex = 0): boolean => {
  const coupons = getCouponData();
  const couponIndex = coupons.findIndex((c: Coupon) => 
    c.mealSlotId === mealSlotId && 
    c.id === participantId && 
    c.familyMemberIndex === familyMemberIndex
  );
  
  if (couponIndex !== -1) {
    coupons[couponIndex].status = 'used';
    saveCouponData(coupons);
    return true;
  }
  
  return false;
};

export const getUserCoupons = (participantId: string): Coupon[] => {
  const coupons = getCouponData();
  return coupons.filter((c: Coupon) => c.id === participantId);
};

export const getFamilyCoupons = (participantId: string, familySize: number): Coupon[] => {
  const coupons = getCouponData();
  return coupons.filter(
    (c: Coupon) => c.id === participantId && c.familyMemberIndex < familySize
  );
};

export const isCouponValid = (mealSlotId: string, participantId: string, familyMemberIndex = 0): boolean => {
  const coupon = getCouponById(mealSlotId, participantId, familyMemberIndex);
  
  if (!coupon) {
    return false;
  }
  
  if (coupon.status !== 'active') {
    return false;
  }
  
  if (!coupon.expiresAt) {
    return false;
  }
  
  const now = new Date();
  const expiresAt = new Date(coupon.expiresAt);
  
  return now < expiresAt;
};

export const getRemainingTime = (mealSlotId: string, participantId: string, familyMemberIndex = 0): number => {
  const coupon = getCouponById(mealSlotId, participantId, familyMemberIndex);
  
  if (!coupon || !coupon.expiresAt) {
    return 0;
  }
  
  const now = Date.now();
  const expiresAt = new Date(coupon.expiresAt).getTime();
  const diff = expiresAt - now;
  
  return diff > 0 ? Math.floor(diff / 1000) : 0;
};

// Verify coupon timestamps and return detailed information for debugging
export const verifyCouponTimestamps = (mealSlotId: string, participantId: string, familyMemberIndex = 0): {
  exists: boolean;
  hasCouponedAt: boolean;
  hasExpiresAt: boolean;
  isExpired: boolean;
  remainingSeconds: number;
  couponedAt?: string;
  expiresAt?: string;
} => {
  const coupon = getCouponById(mealSlotId, participantId, familyMemberIndex);
  
  if (!coupon) {
    return {
      exists: false,
      hasCouponedAt: false,
      hasExpiresAt: false,
      isExpired: false,
      remainingSeconds: 0
    };
  }
  
  const now = Date.now();
  const hasExpiresAt = !!coupon.expiresAt;
  const isExpired = hasExpiresAt ? new Date(coupon.expiresAt!).getTime() <= now : false;
  const remainingSeconds = hasExpiresAt ? Math.max(0, Math.floor((new Date(coupon.expiresAt!).getTime() - now) / 1000)) : 0;
  
  return {
    exists: true,
    hasCouponedAt: !!coupon.couponedAt,
    hasExpiresAt,
    isExpired,
    remainingSeconds,
    couponedAt: coupon.couponedAt,
    expiresAt: coupon.expiresAt
  };
};

// Function to sync the coupon status with Supabase
export const syncCouponWithSupabase = async (
  mealSlotId: string, 
  participantId: string, 
  familyMemberIndex = 0,
  supabaseUpdateFunction: (mealSlotId: string, status: string) => Promise<boolean>
): Promise<boolean> => {
  try {
    // Get the current status from localStorage
    const coupon = getCouponById(mealSlotId, participantId, familyMemberIndex);
    
    if (!coupon) {
      return false;
    }
    
    // Call the provided Supabase update function with the current status
    return await supabaseUpdateFunction(mealSlotId, coupon.status);
  } catch (error) {
    console.error('Error syncing coupon with Supabase:', error);
    return false;
  }
};

export const checkAndExpireOutdatedCoupons = (): void => {
  const coupons = getCouponData();
  const now = new Date();
  let hasChanges = false;
  
  const updatedCoupons = coupons.map((coupon: Coupon) => {
    // Skip coupons that are already used or don't have an expiration time
    if (coupon.status !== 'active' || !coupon.expiresAt) {
      return coupon;
    }
    
    const expiresAt = new Date(coupon.expiresAt);
    if (now > expiresAt) {
      hasChanges = true;
      return { ...coupon, status: 'used' as const };
    }
    
    return coupon;
  });
  
  // Only save if there were any changes
  if (hasChanges) {
    saveCouponData(updatedCoupons as Coupon[]);
  }
};




export const getCurrentUser = (): Participant | null => {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (participant: Participant): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(participant));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getParticipants = (): Participant[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  return data ? JSON.parse(data) : [];
};

export const getMealSlots = (): MealSlot[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEAL_SLOTS);
  return data ? JSON.parse(data) : [];
};

export const getCoupons = (): Coupon[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEAL_CLAIMS);
  return data ? JSON.parse(data) : [];
};


export const getUserClaims = (participantId: string): Coupon[] => {
  return getCoupons().filter((c) => c.id === participantId);
};

// Admin functions for participant management
export const getAllClaims = (): Coupon[] => {
  return getCoupons();
};

export const addParticipant = (participant: Participant): boolean => {
  try {
    const participants = getParticipants();
    participants.push(participant);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    return true;
  } catch (error) {
    console.error('Error adding participant:', error);
    return false;
  }
};

export const updateParticipant = (id: string, updates: Partial<Participant>): boolean => {
  try {
    const participants = getParticipants();
    const index = participants.findIndex(p => p.id === id);
    
    if (index !== -1) {
      participants[index] = { ...participants[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating participant:', error);
    return false;
  }
};

export const deleteParticipant = (id: string): boolean => {
  try {
    const participants = getParticipants();
    const filteredParticipants = participants.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(filteredParticipants));
    
    // Also remove all coupons for this participant
    const coupons = getCoupons();
    const filteredClaims = coupons.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(filteredClaims));
    
    return true;
  } catch (error) {
    console.error('Error deleting participant:', error);
    return false;
  }
};