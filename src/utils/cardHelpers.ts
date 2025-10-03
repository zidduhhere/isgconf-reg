// This file extracts helper functions from MealCard component for testing purposes
import { MealTimeStatus } from '../types';

// Determine card state based on claimed status and time status
export const getCardState = (claimed: boolean, timeStatus: MealTimeStatus): string => {
  if (claimed) return 'claimed';
  if (timeStatus === 'past') return 'locked-past';
  if (timeStatus === 'upcoming') return 'locked-upcoming';
  return 'active'; // Default for active time and not claimed
};

// Get card styles based on state
export const getCardStyles = (state: string): { bgColor: string; textColor: string; borderColor: string } => {
  switch (state) {
    case 'active':
      return {
        bgColor: 'bg-white',
        textColor: 'text-gray-800',
        borderColor: 'border-green-500'
      };
    case 'claimed':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-gray-800',
        borderColor: 'border-green-500'
      };
    case 'locked-past':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-500',
        borderColor: 'border-gray-400'
      };
    case 'locked-upcoming':
      return {
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
      };
    default:
      return {
        bgColor: 'bg-white',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300'
      };
  }
};

// Get icon based on state
export const getIcon = (state: string): string => {
  switch (state) {
    case 'active':
      return '🍽️';
    case 'claimed':
      return '✅';
    case 'locked-past':
      return '🔒';
    case 'locked-upcoming':
      return '⏰';
    default:
      return '❓';
  }
};

// Get status text based on state and meal name
export const getStatusText = (state: string, mealName: string): string => {
  switch (state) {
    case 'active':
      return `Claim ${mealName}`;
    case 'claimed':
      return `${mealName} Claimed`;
    case 'locked-past':
      return `${mealName} - Time Expired`;
    case 'locked-upcoming':
      return `${mealName} - Coming Soon`;
    default:
      return mealName;
  }
};