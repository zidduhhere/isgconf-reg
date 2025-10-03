import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CouponContextType, CouponResultType, Participant } from "../types";
import { supabase } from "../services/supabase";
import {
    getRemainingTime as gtR,
    getCouponById,
    checkAndExpireOutdatedCoupons,
    saveCouponData,
    claimCoupon,
    verifyCouponTimestamps,
    getCouponData
} from "../services/storageService";

const CouponContext = createContext<CouponContextType | undefined>(undefined);

type AuthProviderProps = { children: ReactNode, participant: Participant }

export const CouponProvider = ({ children, participant }: AuthProviderProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [coupons, setCoupons] = useState<CouponResultType | null>(null);

    useEffect(() => {
        (async () => {
            // First, try to load coupons from localStorage for faster initial load
            const localCoupons = getCouponData();
            if (localCoupons.length > 0) {
                // Filter coupons for this participant and check expiration
                const participantCoupons = localCoupons.filter(c => c.id === participant.id);
                checkAndExpireOutdatedCoupons(); // Update any expired coupons

                if (participantCoupons.length > 0) {
                    console.log("Loading coupons from localStorage:", participantCoupons);
                    setCoupons(participantCoupons as CouponResultType);
                }
            }

            // Then fetch fresh data from Supabase
            const fetchedCoupons = await getCoupons();
            setCoupons(fetchedCoupons);
        })()
    }, [participant.id]);

    const getCoupons = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase.from('coupons').select('*').eq('id', participant.id);
            if (error) {
                throw new Error('Error fetching coupons');
            }

            // Get existing local coupons with timestamps
            const localCoupons = getCouponData();
            const localCouponsMap = new Map();
            localCoupons.forEach(coupon => {
                if (coupon.id === participant.id) {
                    const key = `${coupon.mealSlotId}-${coupon.familyMemberIndex}`;
                    localCouponsMap.set(key, coupon);
                }
            });

            // Process data before returning, prioritizing local timestamps if they exist
            const processedData = data.map((coupon) => {
                const key = `${coupon.mealSlotId}-${coupon.familyMemberIndex || 0}`;
                const localCoupon = localCouponsMap.get(key);

                // If we have local coupon with timestamps, use those
                if (localCoupon && localCoupon.couponedAt && localCoupon.expiresAt) {
                    const now = new Date();
                    const expiresAt = new Date(localCoupon.expiresAt);
                    const isStillValid = now < expiresAt;

                    return {
                        ...coupon,
                        status: isStillValid ? 'active' : 'used',
                        familyMemberIndex: coupon.familyMemberIndex || 0,
                        uniqueId: `${coupon.id}-${coupon.mealSlotId}-${coupon.familyMemberIndex || 0}`,
                        couponedAt: localCoupon.couponedAt,
                        expiresAt: localCoupon.expiresAt
                    };
                }

                // Otherwise use Supabase data
                // Supabase status: true = available, false = claimed (check timestamps for active vs used)
                return {
                    ...coupon,
                    status: coupon?.status === true ? 'available' :
                        (coupon.couponedAt && new Date(coupon.couponedAt) > new Date(Date.now() - 15 * 60 * 1000)) ?
                            'active' : 'used',
                    familyMemberIndex: coupon.familyMemberIndex || 0,
                    uniqueId: `${coupon.id}-${coupon.mealSlotId}-${coupon.familyMemberIndex || 0}`
                };
            });

            // Update our storage service with the processed data
            saveCouponData(processedData);

            // Also keep the old storage format for backward compatibility
            localStorage.setItem('coupons', JSON.stringify(processedData));

            return processedData;
        } catch (error) {
            console.error("Error fetching coupons:", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    const updateCoupon = async (mealSlotId: string, status: string, familyMemberIndex = 0) => {
        try {
            console.log("Updating coupon for mealSlotId:", mealSlotId);
            console.log("New status:", status);
            console.log("Family member index:", familyMemberIndex);

            let claimedCoupon: any = null;
            let existingTimestamps: { couponedAt: string | null, expiresAt: string | null } = { couponedAt: null, expiresAt: null };

            // 1. Check for existing coupon with timestamps first
            const existingCoupon = getCouponById(mealSlotId, participant.id, familyMemberIndex);
            if (existingCoupon && existingCoupon.couponedAt && existingCoupon.expiresAt) {
                existingTimestamps.couponedAt = existingCoupon.couponedAt;
                existingTimestamps.expiresAt = existingCoupon.expiresAt;
                console.log("Found existing coupon with timestamps:", existingTimestamps);
            }

            // 2. Update local storage with timestamps using our new functions
            if (status === 'active') {
                // Use our claimCoupon function which now has safety checks

                claimedCoupon = claimCoupon(mealSlotId, participant.id, familyMemberIndex);
                console.log("Claimed coupon with timestamps:", claimedCoupon);
            }

            // 3. Update local state for UI rendering using the actual stored timestamps
            if (coupons) {
                const updatedCoupons = coupons.map(coupon => {
                    if (coupon.mealSlotId === mealSlotId && coupon.familyMemberIndex === familyMemberIndex) {
                        // Use timestamps from claimedCoupon if available, otherwise preserve existing ones
                        const finalTimestamps = claimedCoupon ? {
                            couponedAt: claimedCoupon.couponedAt,
                            expiresAt: claimedCoupon.expiresAt
                        } : existingTimestamps;

                        const updatedCoupon = {
                            ...coupon,
                            status: status === 'available' ? 'available' as const : (status === 'active' ? 'active' as const : 'used' as const),
                            couponedAt: status === 'active' ? (finalTimestamps.couponedAt || coupon.couponedAt) : coupon.couponedAt,
                            expiresAt: status === 'active' ? (finalTimestamps.expiresAt || coupon.expiresAt) : coupon.expiresAt
                        };

                        console.log("Updated coupon in context state:", updatedCoupon);
                        return updatedCoupon;
                    }
                    return coupon;
                });

                console.log("Setting updated coupons in context:", updatedCoupons);
                setCoupons(updatedCoupons as CouponResultType);
            }

            // 4. Update in Supabase database using the actual stored timestamps
            // Supabase status logic:
            // - true = meal is available (not claimed)
            // - false = meal is claimed/used (not available)
            const timestampsForSupabase = claimedCoupon ? {
                couponedAt: claimedCoupon.couponedAt,
                expiresAt: claimedCoupon.expiresAt
            } : existingTimestamps;

            const { error } = await supabase
                .from('coupons')
                .update({
                    status: status === 'active' ? false : true, // When claimed (active), status should be false in Supabase
                    couponedAt: status === 'active' ? timestampsForSupabase.couponedAt : null,
                    expiresAt: status === 'active' ? timestampsForSupabase.expiresAt : null
                })
                .eq('id', participant.id)
                .eq('mealSlotId', mealSlotId)

            console.log(`Updated Supabase for mealSlotId ${mealSlotId}: status=${status === 'active' ? false : true}, couponedAt=${status === 'active' ? timestampsForSupabase.couponedAt : null}`);

            if (error) {
                throw new Error(`Failed to update coupon: ${error.message}`);
            }

            // 5. Force a refresh of the coupon data to ensure UI is updated
            const refreshedLocalCoupons = getCouponData();
            const participantCoupons = refreshedLocalCoupons.filter(c => c.id === participant.id);
            if (participantCoupons.length > 0) {
                setCoupons(participantCoupons as CouponResultType);
            }

            return true;
        } catch (error) {
            console.error("Error updating coupon:", error);

            // 4. Revert optimistic update if API call failed
            const freshCoupons = await getCoupons();
            setCoupons(freshCoupons);

            return false;
        }
    }

    const getClaimForSlot = (mealSlotId: string, familyMemberIndex = 0) => {
        try {
            // First check in the context state for the most up-to-date coupon
            if (coupons) {
                const contextCoupon = coupons.find(coupon =>
                    coupon.mealSlotId === mealSlotId &&
                    coupon.familyMemberIndex === familyMemberIndex
                );

                if (contextCoupon) {
                    console.log("Found coupon in context:", contextCoupon);
                    return contextCoupon;
                }
            }

            // Then check in the storage service for the most up-to-date coupon
            const storedCoupon = getCouponById(mealSlotId, participant.id, familyMemberIndex);

            if (storedCoupon) {
                // Check if the coupon has expired and update accordingly
                checkAndExpireOutdatedCoupons();
                // Get the refreshed coupon after expiry check
                const refreshedCoupon = getCouponById(mealSlotId, participant.id, familyMemberIndex);

                // Log coupon verification info for debugging
                const verification = verifyCouponTimestamps(mealSlotId, participant.id, familyMemberIndex);
                console.log("Coupon verification:", verification);

                return refreshedCoupon;
            }

            // Fallback to using the context state
            if (!coupons) return undefined;
            const contextCoupon = coupons?.find(coupon => coupon.mealSlotId === mealSlotId);

            // If we have a context coupon with timestamps, make sure it's also stored locally
            if (contextCoupon && contextCoupon.couponedAt && contextCoupon.expiresAt) {
                const storedCoupons = getCouponData();
                const existsInStorage = storedCoupons.find((c: any) =>
                    c.mealSlotId === mealSlotId &&
                    c.id === participant.id &&
                    c.familyMemberIndex === familyMemberIndex
                );

                if (!existsInStorage) {
                    // Store the context coupon in localStorage for persistence
                    storedCoupons.push(contextCoupon);
                    saveCouponData(storedCoupons);
                    console.log("Synchronized context coupon to localStorage:", contextCoupon);
                }
            }

            return contextCoupon;
        }
        catch (error) {
            console.error("Error getting claim for slot:", error);
            return undefined;
        }
    }

    const getRemainingTime = (couponId: string, familyMemberIndex = 0): number | undefined => {
        // First check in the storage service for the most up-to-date expiration time
        try {

            const remainingTime = gtR(couponId, participant.id, familyMemberIndex);
            if (remainingTime > 0) {
                return remainingTime * 1000; // Convert seconds to milliseconds
            }
        } catch (error) {
            console.error("Error getting remaining time from storage:", error);
        }

        // Fallback to using the context state
        const coupon = coupons?.find(c => c.mealSlotId === couponId);
        if (coupon && coupon.expiresAt) {
            const expiresAt = new Date(coupon.expiresAt).getTime();
            const now = Date.now();
            const diff = expiresAt - now;
            return diff > 0 ? diff : 0;
        }
        return undefined;
    }


    const refreshCoupons = async () => {
        // Check for expired coupons first
        checkAndExpireOutdatedCoupons();

        // Get updated coupons from localStorage
        const localCoupons = getCouponData();
        const participantCoupons = localCoupons.filter(c => c.id === participant.id);

        if (participantCoupons.length > 0) {
            setCoupons(participantCoupons as CouponResultType);
        }

        // Also fetch from Supabase to ensure sync
        const freshCoupons = await getCoupons();
        setCoupons(freshCoupons);
    };

    return (
        <CouponContext.Provider value={{
            coupons,
            isLoading,
            updateCoupon,
            getRemainingTime,
            getCoupons,
            getClaimForSlot,
            refreshCoupons
        }}>
            {children}
        </CouponContext.Provider>
    );
}

export const useCoupon = () => {
    const context = useContext(CouponContext);
    if (!context) {
        throw new Error("useCoupon must be used within a CouponProvider");
    }
    return context;
}