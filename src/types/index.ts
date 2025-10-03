export interface Participant {
  id: string;
  phoneNumber: string;
  name: string;
  familySize: number; // Number of people including the participant (1-4)
  isFamily: boolean; // Whether this participant has family members
}

export type MealTimeStatus = 'upcoming' | 'active' | 'past';

export interface MealSlot {
  id: string;
  name: string;
  day: number;
  type: "lunch" | "dinner";
  startTime: string; // HH:MM format
  endTime: string;
  eventDate: string; // YYYY-MM-DD format
}

export interface Coupon {
  id: string;
  uniqueId: string;
  mealSlotId: string;
  familyMemberIndex: number; // 0 = participant, 1-3 = family members
  status: "available" | "active" | "used" | "locked";
  couponedAt?: string;
  expiresAt?: string;
}

export interface MealCardProps {
  mealSlot: MealSlot;
  coupon: Coupon;
  onClaim: () => void;
  timeRemaining?: number;
}


export interface CouponSetProps {
  participant: Participant;
  familyMemberIndex: number;
  mealSlots: MealSlot[];
  coupons: Coupon[];
  countdowns: { [key: string]: number };
  onClaim: (mealSlotId: string, familyMemberIndex: number) => void;
}


export interface RegistrationSlot {
  id: string;
  particpant: Participant;
  date: string;
  time: string;
  isRegistered: boolean;
}

export type CouponContextType = {
coupons: CouponResultType | null;
 isLoading: boolean;
 updateCoupon: (mealSlotId: string, status: string, familyMemberIndex?: number) => Promise<boolean>;
 getRemainingTime: (couponId: string, familyMemberIndex?: number) => number | undefined;
 getCoupons: () => Promise<any>;
 getClaimForSlot: (mealSlotId: string, familyMemberIndex?: number) => Coupon | undefined;
 refreshCoupons: () => Promise<void>;
}

export type CouponResultType = Coupon[];

export type Claims = Map<string, boolean>;


export const firstLunch = "lunch_1";
export const secondLunch = "lunch_2";
export const dinner = "gala_1";
export const familyFirstLunch = "fam_lunch_1";
export const familySecondLunch = "fam_lunch_2";
export const familyDinner = "fam_gala";