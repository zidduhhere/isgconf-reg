import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant, MealSlot, Coupon, firstLunch, secondLunch, dinner } from '../types';
import { AdminContextType, AdminUser, AdminStats, ParticipantAdmin, ExhibitorAdmin, ExhibitorEmployeeAdmin, CouponAdmin, MealClaimAdmin, CouponFilters, RegistrationAdmin } from '../types/admin';
import { supabase } from '../services/supabase';
import { MEAL_SLOTS } from '../data/mockData';
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
        const initializeData = async () => {
            await refreshData();
            await refreshStats();
        };

        initializeData();
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
    const refreshData = async () => {
        try {
            setIsLoading(true);

            // Fetch participants from Supabase
            const { data: participantsData, error: participantsError } = await supabase
                .from('participants')
                .select('*')
                .order('phoneNumber', { ascending: true }); // Use phoneNumber since created_at doesn't exist

            if (participantsError) {
                console.error('Error fetching participants:', participantsError);
                // Fallback to localStorage if Supabase fails
                setParticipants(getParticipantsLocal());
            } else {
                setParticipants(participantsData || []);
            }

            // Keep using localStorage for meal slots and claims for now
            setMealSlots(getMealSlots());
            setAllClaims(getAllClaims());
            setError(null);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading admin data:', err);
            // Fallback to localStorage on error
            setParticipants(getParticipantsLocal());
            setMealSlots(getMealSlots());
            setAllClaims(getAllClaims());
        } finally {
            setIsLoading(false);
        }
    };

    const refreshStats = async (): Promise<void> => {
        setIsLoading(true);
        try {
            console.log('AdminContext: Starting refreshStats...');
            // Get stats from Supabase with fallback for network issues
            const [participantsResult, exhibitorsResult, couponsResult, mealClaimsResult] = await Promise.allSettled([
                supabase.from('participants').select('*', { count: 'exact' }),
                supabase.from('exhibitor_companies').select('*', { count: 'exact' }),
                supabase.from('coupons').select('status', { count: 'exact' }),
                supabase.from('exhibitor_meal_claims').select('*', { count: 'exact' })
            ]);

            console.log('AdminContext: Query results:', {
                participants: participantsResult.status,
                exhibitors: exhibitorsResult.status,
                coupons: couponsResult.status,
                mealClaims: mealClaimsResult.status
            });

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
                console.log('AdminContext: Total participants:', totalParticipants);
            } else if (participantsResult.status === 'rejected') {
                console.error('AdminContext: Participants query failed:', participantsResult.reason);
            }

            // Handle exhibitors
            if (exhibitorsResult.status === 'fulfilled' && exhibitorsResult.value.data) {
                totalExhibitors = exhibitorsResult.value.count || 0;
                console.log('AdminContext: Total exhibitors:', totalExhibitors);
            } else if (exhibitorsResult.status === 'rejected') {
                console.error('AdminContext: Exhibitors query failed:', exhibitorsResult.reason);
            }

            // Handle coupons - note: status is boolean in schema
            if (couponsResult.status === 'fulfilled' && couponsResult.value.data) {
                totalCoupons = couponsResult.value.count || 0;
                const coupons = couponsResult.value.data || [];
                // Correct logic: true = available, false = used/claimed
                activeCoupons = coupons.filter(c => c.status === true).length; // true = available
                claimedCoupons = coupons.filter(c => c.status === false).length; // false = used/claimed
                expiredCoupons = 0; // No expired status in boolean schema
                console.log('AdminContext: Coupons stats:', { totalCoupons, activeCoupons, claimedCoupons });
            } else if (couponsResult.status === 'rejected') {
                console.error('AdminContext: Coupons query failed:', couponsResult.reason);
            }

            // Handle meal claims
            if (mealClaimsResult.status === 'fulfilled' && mealClaimsResult.value.data) {
                const mealClaims = mealClaimsResult.value.data || [];
                totalMealClaims = mealClaims.length;
                lunchClaims = mealClaims.filter(c => c.meal_type === 'lunch').length;
                dinnerClaims = mealClaims.filter(c => c.meal_type === 'dinner').length;
                console.log('AdminContext: Meal claims stats:', { totalMealClaims, lunchClaims, dinnerClaims });
            } else if (mealClaimsResult.status === 'rejected') {
                console.error('AdminContext: Meal claims query failed:', mealClaimsResult.reason);
            }

            const finalStats = {
                totalParticipants,
                totalExhibitors,
                totalCoupons,
                activeCoupons,
                claimedCoupons,
                expiredCoupons,
                totalMealClaims,
                lunchClaims,
                dinnerClaims
            };

            console.log('AdminContext: Final stats:', finalStats);
            setStats(finalStats);
        } catch (error) {
            console.error('AdminContext: Error refreshing stats:', error);
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
                familySize: p.familySize || 1, // Use correct column name from database
                isFam: p.isFam || false, // Use correct column name
                hospitalName: p.hospitalName || '', // Add missing field
                isFaculty: p.isFaculty || false, // Add missing field
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
            // First, create Supabase auth user
            const email = `${data.phoneNumber}@isgcon.com`;
            const password = '123456789';

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) {
                console.error('Error creating auth user:', authError);
                throw authError;
            }

            if (!authData.user?.id) {
                throw new Error('Failed to create user - no user ID returned');
            }

            // Then create participant record with the auth user ID
            const { error: participantError } = await supabase
                .from('participants')
                .insert({
                    id: authData.user.id, // Use the auth user ID
                    phoneNumber: data.phoneNumber,
                    name: data.name,
                    familySize: data.familySize || 1, // Use correct column name
                    isFam: (data.familySize || 1) > 1 ? true : (data.isFam || false), // Auto-set isFam if familySize > 1
                    hospitalName: data.hospitalName || '', // Add missing field
                    isFaculty: data.isFaculty || false // Add missing field
                });

            if (participantError) {
                console.error('Error adding participant:', participantError);
                // If participant creation fails, we should clean up the auth user
                // Note: In a production app, you might want to handle this differently
                throw participantError;
            }

            // Create 3 default coupons for the participant
            const mealSlots = ["0", "1", "2"]; // Use meal slot IDs from mockData.ts
            const familySize = data.familySize || 1;
            const couponsToCreate = [];

            // Create coupons for the participant and family members
            for (let familyMemberIndex = 0; familyMemberIndex < familySize; familyMemberIndex++) {
                for (const mealSlotId of mealSlots) {
                    couponsToCreate.push({
                        id: authData.user.id, // Participant ID (foreign key)
                        mealSlotId: mealSlotId,
                        familymemberindex: familyMemberIndex, // Use lowercase as per schema
                        status: true, // true = available (default behavior)
                        couponedAt: null,
                        expiresAt: null
                    });
                }
            }

            // Insert all coupons in batch
            const { error: couponsError } = await supabase
                .from('coupons')
                .insert(couponsToCreate);

            if (couponsError) {
                console.error('Error creating coupons:', couponsError);
                // Optionally, we could delete the participant if coupon creation fails
                // For now, we'll just log the error but still consider the participant creation successful
            }

            await refreshStats();
            console.log(`Successfully created participant: ${data.name} with email: ${email} and ${couponsToCreate.length} coupons`);
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
                    familySize: data.familySize, // Use correct column name
                    isFam: data.isFam, // Use correct column name
                    hospitalName: data.hospitalName, // Add missing field
                    isFaculty: data.isFaculty // Add missing field
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
            // Start a transaction to delete from all related tables
            console.log('Deleting participant with ID:', id);

            // First, get participant phone number to construct auth email
            const { data: participantData, error: fetchError } = await supabase
                .from('participants')
                .select('phoneNumber')
                .eq('id', id)
                .single();

            if (fetchError) {
                console.error('Error fetching participant data:', fetchError);
                throw fetchError;
            }

            const phoneNumber = participantData?.phoneNumber;
            console.log('Participant phone number:', phoneNumber);

            // Delete related coupons first (using 'id' field which links to participant)
            const { error: couponsError } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);

            if (couponsError) {
                console.error('Error deleting coupons:', couponsError);
                throw couponsError;
            }
            console.log('Successfully deleted coupons for participant:', id);

            // Note: Auth user deletion requires service role key, not available with anon key
            // The auth user will become orphaned but won't affect app functionality
            // In production, this should be handled by a server-side function with service role
            if (phoneNumber) {
                const authEmail = `${phoneNumber}@isgcon.com`;
                console.log(`Note: Auth user ${authEmail} should be deleted via admin panel or server function`);
            }

            // Delete from participants table
            const { error: participantError } = await supabase
                .from('participants')
                .delete()
                .eq('id', id);

            if (participantError) {
                console.error('Error deleting participant:', participantError);
                throw participantError;
            }
            console.log('Successfully deleted participant:', id);

            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error deleting participant completely:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };    // Legacy participant functions for backward compatibility
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

    // Exhibitor Employee management functions
    const getExhibitorEmployees = async (): Promise<ExhibitorEmployeeAdmin[]> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('exhibitor_employees')
                .select(`
                    *,
                    exhibitor_companies(company_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(e => ({
                id: e.id,
                companyId: e.company_id,
                companyName: e.exhibitor_companies?.company_name || '',
                employeeId: e.id, // Use the actual employee ID from the database
                employeeName: e.employee_name,
                phoneNumber: e.employee_phone || '', // Use employee_phone from database
                email: '', // Not available in database schema
                department: '', // Not available in database schema
                designation: '', // Not available in database schema
                isActive: e.is_active || true,
                createdAt: e.created_at,
                updatedAt: e.updated_at
            }));
        } catch (error) {
            console.error('Error getting exhibitor employees:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Coupon management functions
    const getMealSlotName = (mealSlotId: string): string => {
        const mealSlot = MEAL_SLOTS.find(slot => slot.id === mealSlotId);
        return mealSlot ? mealSlot.name : `Meal Slot ${mealSlotId}`;
    };

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
                // Updated logic: true = available, false = used
                const statusBool = filters.status === 'available' ? true : false;
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
                mealSlotName: getMealSlotName(c.mealSlotId), // Map meal slot ID to name
                familyMemberIndex: c.familymemberindex || 0, // Use correct lowercase field name from DB
                status: c.status ? 'available' : 'used', // true = available, false = used/claimed
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
                    status: true, // true = available (reset to unused state)
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
                    status: true, // true = available (reset to unused state)
                    couponedAt: null,
                    expiresAt: null
                })
                .eq('status', false); // Only reset used/claimed coupons

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
                    status: true, // true = available (reset to unused state)
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
                employeeName: '', // No employee_name in schema - would need to join exhibitor_employees
                mealSlotId: c.mealSlotId, // Use correct field name from schema
                mealSlotName: getMealSlotName(c.mealSlotId), // Map meal slot ID to name
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

    // Registration management functions
    const getRegistrations = async (): Promise<RegistrationAdmin[]> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('registered_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(r => ({
                id: r.id,
                userId: r.user_id,
                userType: r.user_type,
                name: r.name,
                phoneNumber: r.phone_number || '',
                companyName: r.company_name || '',
                isFaculty: r.is_faculty || false,
                registeredAt: r.registered_at
            }));
        } catch (error) {
            console.error('Error getting registrations:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const registerParticipant = async (participantId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // First get the participant data
            const { data: participant, error: participantError } = await supabase
                .from('participants')
                .select('*')
                .eq('id', participantId)
                .single();

            if (participantError || !participant) {
                console.error('Error fetching participant:', participantError);
                return false;
            }

            // Check if registration already exists
            const { data: existingRegistration } = await supabase
                .from('registrations')
                .select('id')
                .eq('user_id', participantId)
                .eq('user_type', 'participant')
                .maybeSingle();

            if (existingRegistration) {
                console.log('Participant already registered');
                return true; // Already registered, consider it success
            }

            // Insert new registration
            const { error: insertError } = await supabase
                .from('registrations')
                .insert({
                    user_id: participantId,
                    user_type: 'participant',
                    name: participant.name,
                    phone_number: participant.phoneNumber,
                    is_faculty: participant.isFaculty || false,
                    registered_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error inserting registration:', insertError);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error registering participant:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const claimExhibitorMeal = async (
        companyId: string,
        mealSlotId: string,
        mealType: 'lunch' | 'dinner',
        employeeId: string,
        quantity: number = 1
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Check if claim already exists for this company, meal slot and employee
            const { data: existingClaim } = await supabase
                .from('exhibitor_meal_claims')
                .select('*')
                .eq('company_id', companyId)
                .eq('mealSlotId', mealSlotId)
                .eq('meal_type', mealType)
                .eq('employee_id', employeeId)
                .maybeSingle();

            if (existingClaim) {
                // Update existing claim quantity
                const newQuantity = (existingClaim.quantity || 0) + quantity;
                const { error } = await supabase
                    .from('exhibitor_meal_claims')
                    .update({
                        quantity: newQuantity,
                        claimed_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('id', existingClaim.id);

                if (error) throw error;
            } else {
                // Create new claim
                const { error } = await supabase
                    .from('exhibitor_meal_claims')
                    .insert({
                        company_id: companyId,
                        employee_id: employeeId, // Associate with specific employee
                        mealSlotId: mealSlotId,
                        meal_type: mealType,
                        quantity: quantity,
                        status: false, // false = claimed
                        claimed_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    });

                if (error) throw error;
            }

            await refreshStats();
            return true;
        } catch (error) {
            console.error('Error claiming exhibitor meal:', error);
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
        const withFamily = participants.filter(p => p.isFam).length;
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
        getExhibitorEmployees,
        getCoupons,
        resetCoupon,
        resetAllCoupons,
        resetParticipantCoupons,
        getMealClaims,
        resetMealClaim,
        claimExhibitorMeal,
        getRegistrations,
        registerParticipant,

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