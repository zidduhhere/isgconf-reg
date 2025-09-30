import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant, MealSlot, Coupon } from '../types';
import {
    getMealSlots,
    getUserClaims,
    updateCoupon
} from '../services/storageService';

interface CouponContextType {
    // State
    mealSlots: MealSlot[];
    claims: Coupon[];
    countdowns: { [key: string]: number };

    // Actions
    loadClaims: (participantId: string) => void;
    claimMeal: (mealSlotId: string, familyMemberIndex?: number) => void;
    claimFamilyMeal: (mealSlotId: string) => void;
    expireClaim: (claimId: string) => void;

    // Getters
    getClaimForSlot: (mealSlotId: string, familyMemberIndex?: number) => Coupon | undefined;
    getTimeRemaining: (mealSlotId: string) => number | undefined;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

interface CouponProviderProps {
    children: ReactNode;
    participant: Participant | null;
}


/**
 * Claims a meal for a participant at a specific meal slot and family member index.
 * If a claim exists and is available, it will be updated to 'active' status with
 * an expiration time of 15 minutes from the current time.
 * 
 * @param mealSlotId - The ID of the meal slot to claim
 * @param familyMemberIndex - Optional index indicating which family member the claim is for (defaults to 0)
 * @returns void
 * 
 * @remarks
 * - Will return early if no participant is provided
 * - Only processes the claim if an available claim exists for the given mealSlotId and familyMemberIndex
 * - Sets claimedAt to current time and expiresAt to 15 minutes from current time
 * - Automatically reloads claims after updating
 */
export const CouponProvider: React.FC<CouponProviderProps> = ({ children, participant }) => {
    const [mealSlots] = useState<MealSlot[]>(getMealSlots());
    const [claims, setClaims] = useState<Coupon[]>([]);
    const [countdowns, setCountdowns] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (participant) {
            loadClaims(participant.id);
        }
    }, [participant?.id]);

    useEffect(() => {
        // Set up intervals for active claims
        const intervals: { [key: string]: NodeJS.Timeout } = {};

        claims.forEach(claim => {
            if (claim.status === 'active' && claim.expiresAt) {
                const expiryTime = new Date(claim.expiresAt).getTime();
                const now = Date.now();
                const timeRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

                if (timeRemaining > 0) {
                    setCountdowns(prev => ({ ...prev, [claim.mealSlotId]: timeRemaining }));

                    intervals[claim.id] = setInterval(() => {
                        const currentTime = Date.now();
                        const remaining = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));

                        if (remaining <= 0) {
                            // Auto-expire the claim
                            expireClaim(claim.id);
                            clearInterval(intervals[claim.id]);
                        } else {
                            setCountdowns(prev => ({ ...prev, [claim.mealSlotId]: remaining }));
                        }
                    }, 1000);
                }
            }
        });

        return () => {
            Object.values(intervals).forEach(interval => clearInterval(interval));
        };
    }, [claims]);

    const loadClaims = (participantId: string): void => {
        const userClaims = getUserClaims(participantId);
        setClaims(userClaims);
    };

    const expireClaim = (claimId: string): void => {
        updateCoupon(claimId, {
            status: 'used'
        });

        if (participant) {
            loadClaims(participant.id);
        }

        // Clear countdown
        const claim = claims.find(c => c.id === claimId);
        if (claim) {
            setCountdowns(prev => {
                const newCountdowns = { ...prev };
                delete newCountdowns[claim.mealSlotId];
                return newCountdowns;
            });
        }
    };

    const claimMeal = (mealSlotId: string, familyMemberIndex: number = 0): void => {
        if (!participant) return;

        const claim = claims.find(c =>
            c.mealSlotId === mealSlotId &&
            c.familyMemberIndex === familyMemberIndex
        );

        if (claim && claim.status === 'available') {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

            updateCoupon(claim.id, {
                status: 'active',
                claimedAt: now.toISOString(),
                expiresAt: expiresAt.toISOString()
            });

            loadClaims(participant.id);
        }
    };

    const claimFamilyMeal = (mealSlotId: string): void => {
        if (!participant || !participant.isFamily) return;

        // Find all claims for this meal slot for all family members
        const familyClaims = claims.filter(c => c.mealSlotId === mealSlotId);

        // Claim for all family members
        familyClaims.forEach(claim => {
            if (claim.status === 'available') {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

                updateCoupon(claim.id, {
                    status: 'active',
                    claimedAt: now.toISOString(),
                    expiresAt: expiresAt.toISOString()
                });
            }
        });

        loadClaims(participant.id);
    };

    const getClaimForSlot = (mealSlotId: string, familyMemberIndex: number = 0): Coupon | undefined => {
        return claims.find(c =>
            c.mealSlotId === mealSlotId &&
            c.familyMemberIndex === familyMemberIndex
        );
    };

    const getTimeRemaining = (mealSlotId: string): number | undefined => {
        return countdowns[mealSlotId];
    };

    const value: CouponContextType = {
        // State
        mealSlots,
        claims,
        countdowns,

        // Actions
        loadClaims,
        claimMeal,
        claimFamilyMeal,
        expireClaim,

        // Getters
        getClaimForSlot,
        getTimeRemaining
    };

    return (
        <CouponContext.Provider value={value}>
            {children}
        </CouponContext.Provider>
    );
};

export const useCoupon = (): CouponContextType => {
    const context = useContext(CouponContext);
    if (context === undefined) {
        throw new Error('useCoupon must be used within a CouponProvider');
    }
    return context;
};