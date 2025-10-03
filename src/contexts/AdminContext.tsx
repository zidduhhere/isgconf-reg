import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant, MealSlot, Coupon } from '../types';
import { AdminContextType, AdminUser, AdminStats, ParticipantAdmin, ExhibitorAdmin, CouponAdmin, MealClaimAdmin, CouponFilters } from '../types/admin';
import { supabase } from '../services/supabase';
import {
    getParticipants as getParticipantsLocal,
    getMealSlots,
    getAllClaims,
    addParticipant as addParticipantLocal,
    updateParticipant as updateParticipantLocal,
    deleteParticipant as deleteParticipantLocal,
} from '../services/storageService';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
    children: ReactNode;
}

// Admin credentials and session management
const ADMIN_PASSWORD = 'admin123';
const ADMIN_SESSION_KEY = 'admin_session';
const mockAdminEmail = 'admin@isgconf.com';
const mockAdminPassword = 'admin123';

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    // New interface state
    const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Legacy interface state for backward compatibility
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [mealSlots, setMealSlots] = useState<MealSlot[]>([]);
    const [allClaims, setAllClaims] = useState<Coupon[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    useEffect(() => {
        // Check for existing admin session for legacy components
        const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
        if (adminSession) {
            setIsAdminAuthenticated(true);
            // Also set up new admin state for consistency
            setCurrentAdmin({
                id: 'admin-1',
                email: mockAdminEmail,
                role: 'super_admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Load initial data
        refreshData();
        refreshStats();
    }, []);

    // New authentication method (email/password)
    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            if (email === mockAdminEmail && password === mockAdminPassword) {
                const adminUser = {
                    id: 'admin-1',
                    email: email,
                    role: 'super_admin' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                setCurrentAdmin(adminUser);
                setIsAdminAuthenticated(true);
                localStorage.setItem(ADMIN_SESSION_KEY, 'true');
                await refreshStats();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy authentication method (password only) for backward compatibility
    const loginLegacy = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            setIsAdminAuthenticated(true);
            localStorage.setItem(ADMIN_SESSION_KEY, 'true');
            setCurrentAdmin({
                id: 'admin-1',
                email: mockAdminEmail,
                role: 'super_admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    };

    const logout = async (): Promise<void> => {
        setCurrentAdmin(null);
        setStats(null);
        setIsAdminAuthenticated(false);
        localStorage.removeItem(ADMIN_SESSION_KEY);
    };

    // Legacy logout for backward compatibility
    const logoutLegacy = (): void => {
        setIsAdminAuthenticated(false);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setCurrentAdmin(null);
        setStats(null);
    };

    // Data refresh functions
    const refreshData = () => {
        try {
            setIsLoading(true);
            setParticipants(getParticipantsLocal());
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

    const refreshStats = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Get stats from Supabase with fallback for network issues
            const [participantsResult, exhibitorsResult, couponsResult, mealClaimsResult] = await Promise.allSettled([
                supabase.from('participants').select('*', { count: 'exact' }),
                supabase.from('exhibitor_companies').select('*', { count: 'exact' }),
                supabase.from('coupons').select('status', { count: 'exact' }),
                supabase.from('exhibitor_meal_claims').select('*', { count: 'exact' })
            ]);

            let totalParticipants = 0;
            let totalExhibitors = 0;
            let totalCoupons = 0;
            let activeCoupons = 0;
            let claimedCoupons = 0;
            let expiredCoupons = 0;
            let totalMealClaims = 0;
            let lunchClaims = 0;
            let dinnerClaims = 0;

            // Handle participants
            if (participantsResult.status === 'fulfilled' && participantsResult.value.data) {
                totalParticipants = participantsResult.value.count || 0;
            }

            // Handle exhibitors
            if (exhibitorsResult.status === 'fulfilled' && exhibitorsResult.value.data) {
                totalExhibitors = exhibitorsResult.value.count || 0;
            }

            // Handle coupons - note: status is boolean in schema
            if (couponsResult.status === 'fulfilled' && couponsResult.value.data) {
                totalCoupons = couponsResult.value.count || 0;
                const coupons = couponsResult.value.data || [];
                activeCoupons = coupons.filter(c => c.status === true).length;
                claimedCoupons = coupons.filter(c => c.status === false).length;
                expiredCoupons = 0; // No expired status in boolean schema
            }

            // Handle meal claims
            if (mealClaimsResult.status === 'fulfilled' && mealClaimsResult.value.data) {
                const mealClaims = mealClaimsResult.value.data || [];
                totalMealClaims = mealClaims.length;
                lunchClaims = mealClaims.filter(c => c.meal_type === 'lunch').length;
                dinnerClaims = mealClaims.filter(c => c.meal_type === 'dinner').length;
            }

            setStats({
                totalParticipants,
                totalExhibitors,
                totalCoupons,
                activeCoupons,
                claimedCoupons,
                expiredCoupons,
                totalMealClaims,
                lunchClaims,
                dinnerClaims
            });
        } catch (error) {
            console.error('Error refreshing stats:', error);
            // Set fallback stats if Supabase is not available
            setStats({
                totalParticipants: 0,
                totalExhibitors: 0,
                totalCoupons: 0,
                activeCoupons: 0,
                claimedCoupons: 0,
                expiredCoupons: 0,
                totalMealClaims: 0,
                lunchClaims: 0,
                dinnerClaims: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Participant management functions
    const getParticipants = async (): Promise<ParticipantAdmin[]> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('*')
                .order('phoneNumber', { ascending: true }); // Use phoneNumber instead of created_at

            if (error) throw error;

            return (data || []).map(p => ({
                id: p.id,
                phoneNumber: p.phoneNumber, // Use correct column name
                name: p.name,
                familySize: p.famSize || 1, // Use correct column name
                isFamily: p.isFam || false, // Use correct column name
                couponsCount: 0, // Will be calculated separately
                activeCouponsCount: 0, // Will be calculated separately
                createdAt: new Date().toISOString(), // Add default since no created_at in DB
                updatedAt: new Date().toISOString() // Add default since no updated_at in DB
            }));
        } catch (error) {
            console.error('Error getting participants:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const addParticipant = async (data: Partial<ParticipantAdmin>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('participants')
                .insert({
                    phoneNumber: data.phoneNumber, // Use correct column name
                    name: data.name,
                    famSize: data.familySize || 1, // Use correct column name
                    isFam: data.isFamily || false // Use correct column name
                });

            if (error) throw error;
            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error adding participant:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateParticipant = async (id: string, data: Partial<ParticipantAdmin>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('participants')
                .update({
                    phoneNumber: data.phoneNumber, // Use correct column name
                    name: data.name,
                    famSize: data.familySize, // Use correct column name
                    isFam: data.isFamily // Use correct column name
                })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating participant:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteParticipant = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('participants')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error deleting participant:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy participant functions for backward compatibility
    const createParticipant = async (participantData: Omit<Participant, 'id'>): Promise<boolean> => {
        try {
            setIsLoading(true);
            const newParticipant = {
                ...participantData,
                id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            const success = addParticipantLocal(newParticipant);
            if (success) {
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
            const success = updateParticipantLocal(id, updates);
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
            const success = deleteParticipantLocal(id);
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

    // Exhibitor management functions
    const getExhibitors = async (): Promise<ExhibitorAdmin[]> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('exhibitor_companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(e => ({
                id: e.id,
                companyId: e.company_id,
                companyName: e.company_name,
                phoneNumber: e.phone_number,
                plan: e.plan,
                lunchAllocation: e.lunch_allocation,
                dinnerAllocation: e.dinner_allocation,
                lunchUsed: e.lunch_used, // Correct field name
                dinnerUsed: e.dinner_used, // Correct field name
                createdAt: e.created_at,
                updatedAt: e.updated_at
            }));
        } catch (error) {
            console.error('Error getting exhibitors:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const addExhibitor = async (data: Partial<ExhibitorAdmin>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('exhibitor_companies')
                .insert({
                    company_id: data.companyId,
                    company_name: data.companyName,
                    phone_number: data.phoneNumber,
                    plan: data.plan,
                    lunch_allocation: data.lunchAllocation,
                    dinner_allocation: data.dinnerAllocation
                });

            if (error) throw error;
            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error adding exhibitor:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateExhibitor = async (id: string, data: Partial<ExhibitorAdmin>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('exhibitor_companies')
                .update({
                    company_id: data.companyId,
                    company_name: data.companyName,
                    phone_number: data.phoneNumber,
                    plan: data.plan,
                    lunch_allocation: data.lunchAllocation,
                    dinner_allocation: data.dinnerAllocation
                })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating exhibitor:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteExhibitor = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('exhibitor_companies')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error deleting exhibitor:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Coupon management functions
    const getCoupons = async (filters?: CouponFilters): Promise<CouponAdmin[]> => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('coupons')
                .select(`
                    *,
                    participants:id (
                        phoneNumber,
                        name
                    )
                `)
                .order('uniqueId', { ascending: false });

            if (filters?.status) {
                // Note: the coupons table uses boolean status instead of string
                const statusBool = filters.status === 'active' ? true : false;
                query = query.eq('status', statusBool);
            }

            const { data, error } = await query;
            if (error) throw error;

            return (data || []).map(c => ({
                id: c.id,
                uniqueId: c.uniqueId,
                participantId: c.id, // Using id as participant_id since they are linked
                participantName: c.participants?.name || '', // From joined participants table
                participantPhone: c.participants?.phoneNumber || '', // From joined participants table
                mealSlotId: c.mealSlotId,
                mealSlotName: '', // Will need to join with meal_slots table later
                familyMemberIndex: c.familyMemberIndex,
                status: c.status ? 'active' : 'available', // Convert boolean to string
                couponedAt: c.couponedAt,
                expiresAt: c.expiresAt,
                createdAt: new Date().toISOString() // Not in schema, using current time
            }));
        } catch (error) {
            console.error('Error getting coupons:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const resetCoupon = async (couponId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('coupons')
                .update({
                    status: false, // false = available
                    couponedAt: null,
                    expiresAt: null
                })
                .eq('uniqueId', couponId); // Use uniqueId as the identifier

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error resetting coupon:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetAllCoupons = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('coupons')
                .update({
                    status: false, // false = available
                    couponedAt: null,
                    expiresAt: null
                })
                .eq('status', true); // Only reset active coupons

            if (error) throw error;
            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error resetting all coupons:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetParticipantCoupons = async (participantId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('coupons')
                .update({
                    status: false, // false = available
                    couponedAt: null,
                    expiresAt: null
                })
                .eq('id', participantId); // Using id field since it seems to be participant_id

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error resetting participant coupons:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Meal claims management
    const getMealClaims = async (): Promise<MealClaimAdmin[]> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('exhibitor_meal_claims')
                .select(`
                    *,
                    exhibitor_companies(company_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(c => ({
                id: c.id,
                companyId: c.company_id,
                companyName: c.exhibitor_companies?.company_name,
                employeeId: c.employee_id,
                employeeName: c.employee_name,
                mealSlotId: c.meal_slot_id,
                mealSlotName: '', // Will need to join with meal_slots
                mealType: c.meal_type,
                quantity: c.quantity,
                status: c.status,
                claimedAt: c.claimed_at,
                expiresAt: c.expires_at,
                createdAt: c.created_at
            }));
        } catch (error) {
            console.error('Error getting meal claims:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const resetMealClaim = async (claimId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('exhibitor_meal_claims')
                .delete()
                .eq('id', claimId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error resetting meal claim:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy coupon functions for backward compatibility
    const activateAllCoupons = async (participantId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const participantClaims = allClaims.filter(coupon => coupon.id === participantId);

            for (const coupon of participantClaims) {
                if (coupon.status === 'available') {
                    // Legacy implementation - would need to update coupons
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
            const participantClaims = allClaims.filter(coupon => coupon.id === participantId);

            for (const coupon of participantClaims) {
                if (coupon.status === 'active') {
                    // Legacy implementation - would need to update coupons
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

    // Legacy statistics function
    const getCouponStatusCounts = () => {
        if (!allClaims) return { available: 0, active: 0, used: 0, total: 0 };
        const available = allClaims.filter(c => c.status === 'available').length;
        const active = allClaims.filter(c => c.status === 'active').length;
        const used = allClaims.filter(c => c.status === 'used').length;
        return { available, active, used, total: allClaims.length };
    };

    const getParticipantStats = () => {
        if (!participants || !allClaims) {
            return {
                total: 0,
                withFamily: 0,
                activeCoupons: 0,
                usedCoupons: 0
            };
        }
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

    // Create value object that satisfies both old and new interfaces
    const value: AdminContextType = {
        // New interface properties
        currentAdmin,
        stats,
        isLoading,
        login,
        logout,
        refreshStats,
        getParticipants,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        getExhibitors,
        addExhibitor,
        updateExhibitor,
        deleteExhibitor,
        getCoupons,
        resetCoupon,
        resetAllCoupons,
        resetParticipantCoupons,
        getMealClaims,
        resetMealClaim,

        // Legacy interface properties for backward compatibility
        participants,
        mealSlots,
        allClaims,
        error,
        isAdminAuthenticated,
        refreshData,
        createParticipant,
        editParticipant,
        removeParticipant,
        activateAllCoupons,
        deactivateAllCoupons,
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