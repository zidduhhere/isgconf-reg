import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant, MealSlot, Coupon } from '../types';
import {
    getParticipants,
    getMealSlots,
    getAllClaims,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    updateCoupon,
    initializeClaimsForParticipant
} from '../services/storageService';

interface AdminContextType {
    // State
    participants: Participant[];
    mealSlots: MealSlot[];
    allClaims: Coupon[];
    isLoading: boolean;
    error: string | null;
    isAdminAuthenticated: boolean;

    // Actions
    login: (password: string) => boolean;
    logout: () => void;
    refreshData: () => void;

    // Participant Management
    createParticipant: (participant: Omit<Participant, 'id'>) => Promise<boolean>;
    editParticipant: (id: string, updates: Partial<Participant>) => Promise<boolean>;
    removeParticipant: (id: string) => Promise<boolean>;

    // Coupon Management
    activateAllCoupons: (participantId: string) => Promise<boolean>;
    deactivateAllCoupons: (participantId: string) => Promise<boolean>;
    resetCoupon: (claimId: string) => Promise<boolean>;

    // Statistics
    getParticipantStats: () => {
        total: number;
        withFamily: number;
        activeCoupons: number;
        usedCoupons: number;
    };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
    children: ReactNode;
}

// Simple admin password - in production, this should be more secure
const ADMIN_PASSWORD = 'admin123';
const ADMIN_SESSION_KEY = 'admin_session';

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [mealSlots, setMealSlots] = useState<MealSlot[]>([]);
    const [allClaims, setAllClaims] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    useEffect(() => {
        // Check for existing admin session
        const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
        if (adminSession) {
            setIsAdminAuthenticated(true);
        }

        // Load initial data
        refreshData();
    }, []);

    const refreshData = () => {
        try {
            setIsLoading(true);
            setParticipants(getParticipants());
            setMealSlots(getMealSlots());
            setAllClaims(getAllClaims());
            setError(null);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            setIsAdminAuthenticated(true);
            localStorage.setItem(ADMIN_SESSION_KEY, 'true');
            return true;
        }
        return false;
    };

    const logout = (): void => {
        setIsAdminAuthenticated(false);
        localStorage.removeItem(ADMIN_SESSION_KEY);
    };

    const createParticipant = async (participantData: Omit<Participant, 'id'>): Promise<boolean> => {
        try {
            setIsLoading(true);
            const newParticipant = {
                ...participantData,
                id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            const success = addParticipant(newParticipant);
            if (success) {
                // Initialize claims for the new participant
                initializeClaimsForParticipant(newParticipant);
                refreshData();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to create participant');
            console.error('Error creating participant:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const editParticipant = async (id: string, updates: Partial<Participant>): Promise<boolean> => {
        try {
            setIsLoading(true);
            const success = updateParticipant(id, updates);
            if (success) {
                refreshData();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to update participant');
            console.error('Error updating participant:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const removeParticipant = async (id: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const success = deleteParticipant(id);
            if (success) {
                refreshData();
                return true;
            }
            return false;
        } catch (err) {
            setError('Failed to delete participant');
            console.error('Error deleting participant:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const activateAllCoupons = async (participantId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const participantClaims = allClaims.filter(claim => claim.participantId === participantId);

            const now = new Date();
            const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

            for (const claim of participantClaims) {
                if (claim.status === 'available') {
                    updateCoupon(claim.id, {
                        status: 'active',
                        claimedAt: now.toISOString(),
                        expiresAt: expiresAt.toISOString()
                    });
                }
            }

            refreshData();
            return true;
        } catch (err) {
            setError('Failed to activate coupons');
            console.error('Error activating coupons:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateAllCoupons = async (participantId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const participantClaims = allClaims.filter(claim => claim.participantId === participantId);

            for (const claim of participantClaims) {
                if (claim.status === 'active') {
                    updateCoupon(claim.id, {
                        status: 'available',
                        claimedAt: undefined,
                        expiresAt: undefined
                    });
                }
            }

            refreshData();
            return true;
        } catch (err) {
            setError('Failed to deactivate coupons');
            console.error('Error deactivating coupons:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetCoupon = async (claimId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            updateCoupon(claimId, {
                status: 'available',
                claimedAt: undefined,
                expiresAt: undefined
            });

            refreshData();
            return true;
        } catch (err) {
            setError('Failed to reset coupon');
            console.error('Error resetting coupon:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const getParticipantStats = () => {
        const total = participants.length;
        const withFamily = participants.filter(p => p.isFamily).length;
        const activeCoupons = allClaims.filter(c => c.status === 'active').length;
        const usedCoupons = allClaims.filter(c => c.status === 'used').length;

        return {
            total,
            withFamily,
            activeCoupons,
            usedCoupons
        };
    };

    const value: AdminContextType = {
        // State
        participants,
        mealSlots,
        allClaims,
        isLoading,
        error,
        isAdminAuthenticated,

        // Actions
        login,
        logout,
        refreshData,

        // Participant Management
        createParticipant,
        editParticipant,
        removeParticipant,

        // Coupon Management
        activateAllCoupons,
        deactivateAllCoupons,
        resetCoupon,

        // Statistics
        getParticipantStats
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};