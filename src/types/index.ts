export interface Participant {
  id: string;
  phoneNumber: string;
  name: string;
  familySize: number; // Number of people including the participant (1-4)
  isFamily: boolean; // Whether this participant has family members
}

export interface MealSlot {
  id: string;
  name: string;
  day: number;
  type: "lunch" | "dinner";
  startTime: string; // HH:MM format
  endTime: string;
  eventDate: string; // YYYY-MM-DD format
}

export interface MealClaim {
  id: string;
  participantId: string;
  mealSlotId: string;
  familyMemberIndex: number; // 0 = participant, 1-3 = family members
  status: "available" | "active" | "used" | "locked";
  claimedAt?: string;
  expiresAt?: string;
}

export interface MealCardProps {
  mealSlot: MealSlot;
  claim: MealClaim;
  onClaim: (mealSlotId: string, familyMemberIndex: number) => void;
  timeRemaining?: number;
  familyMemberIndex: number;
  familyMemberName: string;
}

export interface CouponSetProps {
  participant: Participant;
  familyMemberIndex: number;
  familyMemberName: string;
  mealSlots: MealSlot[];
  claims: MealClaim[];
  countdowns: { [key: string]: number };
  onClaim: (mealSlotId: string, familyMemberIndex: number) => void;
}
