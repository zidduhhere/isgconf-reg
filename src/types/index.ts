export interface Participant {
  id: string;
  phoneNumber: string;
  name: string;
}

export interface MealSlot {
  id: string;
  name: string;
  day: number;
  type: 'lunch' | 'dinner';
  startTime: string; // HH:MM format
  endTime: string;
  eventDate: string; // YYYY-MM-DD format
}

export interface MealClaim {
  id: string;
  participantId: string;
  mealSlotId: string;
  status: 'available' | 'active' | 'used' | 'locked';
  claimedAt?: string;
  expiresAt?: string;
}

export interface MealCardProps {
  mealSlot: MealSlot;
  claim: MealClaim;
  onClaim: (mealSlotId: string) => void;
  timeRemaining?: number;
}