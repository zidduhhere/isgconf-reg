import { MealSlot } from "../types";

export const isTimeSlotActive = (_slot: MealSlot): boolean => {
  // Always return true - meal coupons are available at any time
  return true;
};

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
