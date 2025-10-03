import { MealSlot } from "../types";

/**
 * Checks if a meal slot is currently active based on its time range
 * A meal slot is active if the current time is between the startTime and endTime
 */
export const isTimeSlotActive = (slot: MealSlot): boolean => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // If not the same date, the meal slot is not active
  if (slot.eventDate !== currentDate) {
    return false;
  }
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Parse start time (HH:MM format)
  const [startHour, startMinute] = slot.startTime.split(':').map(Number);
  
  // Parse end time (HH:MM format)
  const [endHour, endMinute] = slot.endTime.split(':').map(Number);
  
  // Convert to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  // Check if current time is within the meal slot's time range
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

/**
 * Returns the status of a meal slot based on its time range
 * - 'upcoming': The meal slot is in the future
 * - 'active': The meal slot is currently active
 * - 'past': The meal slot is in the past
 */
export const getMealTimeStatus = (slot: MealSlot): 'upcoming' | 'active' | 'past' => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // If the event date is in the future
  if (slot.eventDate > currentDate) {
    return 'upcoming';
  }
  
  // If the event date is in the past
  if (slot.eventDate < currentDate) {
    return 'past';
  }
  
  // If it's the same date, check the time
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Parse start time and end time
  const [startHour, startMinute] = slot.startTime.split(':').map(Number);
  const [endHour, endMinute] = slot.endTime.split(':').map(Number);
  
  // Convert to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  // If current time is before the start time
  if (currentTimeInMinutes < startTimeInMinutes) {
    return 'upcoming';
  }
  
  // If current time is after the end time
  if (currentTimeInMinutes > endTimeInMinutes) {
    return 'past';
  }
  
  // If current time is within the time range
  return 'active';
};

/**
 * Format a time remaining value in seconds to a MM:SS string
 */
export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // For international numbers, just add the + prefix if not present
  if (digits.length > 10 && !phone.startsWith("+")) {
    return `+${digits}`;
  }

  return phone;
};
