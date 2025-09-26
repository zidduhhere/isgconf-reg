import { Participant, MealSlot, MealClaim } from '../types';
import { PARTICIPANTS, MEAL_SLOTS } from '../data/mockData';

const STORAGE_KEYS = {
  PARTICIPANTS: 'meal_pass_participants',
  MEAL_SLOTS: 'meal_pass_slots',
  MEAL_CLAIMS: 'meal_pass_claims',
  CURRENT_USER: 'meal_pass_current_user'
};

// Initialize data in localStorage
export const initializeData = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(PARTICIPANTS));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.MEAL_SLOTS)) {
    localStorage.setItem(STORAGE_KEYS.MEAL_SLOTS, JSON.stringify(MEAL_SLOTS));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.MEAL_CLAIMS)) {
    // Initialize claims for all participants and meal slots
    const claims: MealClaim[] = [];
    PARTICIPANTS.forEach(participant => {
      MEAL_SLOTS.forEach(slot => {
        claims.push({
          id: `${participant.id}-${slot.id}`,
          participantId: participant.id,
          mealSlotId: slot.id,
          status: 'available'
        });
      });
    });
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(claims));
  }
};

export const authenticateParticipant = (phoneNumber: string): Participant | null => {
  const participants = getParticipants();
  return participants.find(p => p.phoneNumber === phoneNumber) || null;
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

export const getMealClaims = (): MealClaim[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEAL_CLAIMS);
  return data ? JSON.parse(data) : [];
};

export const updateMealClaim = (claimId: string, updates: Partial<MealClaim>): void => {
  const claims = getMealClaims();
  const index = claims.findIndex(c => c.id === claimId);
  
  if (index !== -1) {
    claims[index] = { ...claims[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEAL_CLAIMS, JSON.stringify(claims));
  }
};

export const getUserClaims = (participantId: string): MealClaim[] => {
  return getMealClaims().filter(c => c.participantId === participantId);
};