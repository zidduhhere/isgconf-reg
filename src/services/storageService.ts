import { Participant, MealSlot, Coupon } from "../types";
import { PARTICIPANTS, MEAL_SLOTS } from "../data/mockData";

const STORAGE_KEYS = {
  PARTICIPANTS: "meal_pass_participants",
  MEAL_SLOTS: "meal_pass_slots",
  MEAL_CLAIMS: "meal_pass_claims",
  CURRENT_USER: "meal_pass_current_user",
};

// Initialize data in localStorage
export const initializeData = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
    localStorage.setItem(
      STORAGE_KEYS.PARTICIPANTS,
      JSON.stringify(PARTICIPANTS)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEAL_SLOTS)) {
    localStorage.setItem(STORAGE_KEYS.MEAL_SLOTS, JSON.stringify(MEAL_SLOTS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEAL_CLAIMS)) {
    // Initialize claims for all participants and meal slots
    const claims: Coupon[] = [];
    PARTICIPANTS.forEach((participant) => {
      MEAL_SLOTS.forEach((slot) => {
        // Create claims for each family member
        for (let i = 0; i < participant.familySize; i++) {
          claims.push({
            id: `${participant.id}-${slot.id}-${i}`,
            participantId: participant.id,
            mealSlotId: slot.id,
            familyMemberIndex: i,
            status: "available",
          });
        }
      });
    });
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(claims));
  }
};

export const authenticateParticipant = (
  phoneNumber: string
): Participant | null => {
  const participants = getParticipants();
  return participants.find((p) => p.phoneNumber === phoneNumber) || null;
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

export const updateCoupon = (
  claimId: string,
  updates: Partial<Coupon>
): void => {
  const claims = getCoupons();
  const index = claims.findIndex((c) => c.id === claimId);

  if (index !== -1) {
    claims[index] = { ...claims[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(claims));
  }
};

export const getUserClaims = (participantId: string): Coupon[] => {
  return getCoupons().filter((c) => c.participantId === participantId);
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
    
    // Also remove all claims for this participant
    const claims = getCoupons();
    const filteredClaims = claims.filter(c => c.participantId !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(filteredClaims));
    
    return true;
  } catch (error) {
    console.error('Error deleting participant:', error);
    return false;
  }
};

export const initializeClaimsForParticipant = (participant: Participant): void => {
  const mealSlots = getMealSlots();
  const existingClaims = getCoupons();
  const newClaims: Coupon[] = [];
  
  mealSlots.forEach(slot => {
    // Create claims for each family member
    for (let i = 0; i < participant.familySize; i++) {
      const claimId = `${participant.id}-${slot.id}-${i}`;
      
      // Only add if claim doesn't already exist
      if (!existingClaims.find(c => c.id === claimId)) {
        newClaims.push({
          id: claimId,
          participantId: participant.id,
          mealSlotId: slot.id,
          familyMemberIndex: i,
          status: 'available'
        });
      }
    }
  });
  
  if (newClaims.length > 0) {
    const allClaims = [...existingClaims, ...newClaims];
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(allClaims));
  }
};
